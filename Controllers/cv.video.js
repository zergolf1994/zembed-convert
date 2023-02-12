"use strict";

const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs-extra");

const { Files, Servers, Procress } = require(`../Models`);
const { Alert, Get_Video_Data, GetIP, GetOne, SCP, Task } = require(`../Utils`);

module.exports = async (req, res) => {
  try {
    const { slug } = req.query;
    if (!slug) return res.json({ status: false });
    let storageId;

    let row = await Files.Lists.findOne({
      attributes: ["id", "type", "source", "duration"],
      where: {
        slug,
      },
      include: [
        {
          model: Files.Videos,
          as: "videos",
          attributes: ["quality", "storageId"],
          required: false,
        },
        {
          model: Files.Backups,
          as: "backups",
          attributes: ["type", "quality", "source"],
          required: false,
        },
        {
          model: Files.Sets,
          as: "sets",
          attributes: ["name", "value"],
          required: false,
        },
      ],
    });
    if (!row) return res.json(Alert({ status: false, msg: "not_exists" }, `w`));

    let process = await Procress.findOne({
      raw: true,
      where: {
        fileId: row?.id,
        type: "convert",
      },
    });

    if (!process)
      return res.json(Alert({ status: false, msg: "not_exists" }, `w`));

    if (row.videos.length) {
      storageId = row.videos[0].storageId;
    }

    let sv_storage = await GetOne.Storage({ storageId });

    /// start

    let inputPath = `${global.dirPublic}/${slug}/file_default.mp4`;
    if (!fs.existsSync(inputPath)) {
      return res.json(Alert({ status: false, msg: "no video" }, `d`));
    }
    let video_data = await Get_Video_Data(inputPath);

    let { width, height, duration, codec_name } = video_data?.streams[0];
    let video_type = "vertical"; // horizontal
    let list_convert = [],
      list_quality = [];
    if (width > height) {
      video_type = "horizontal";
    }
    if (height >= 1080) list_quality = [1080, 720, 480, 360];
    else if (height >= 720) list_quality = [720, 480, 360];
    else if (height >= 480) list_quality = [480, 360];
    else if (height >= 360) list_quality = [360];
    else
      return res.json(
        Alert({ status: false, msg: `video size = ${height}` }, `d`)
      );

    let taskConvert = {};
    for (const key in list_quality) {
      let quality = list_quality[key];
      taskConvert[`file_${quality}`] = 0;
    }
    await Task({
      convert_video: {
        ...taskConvert,
        video_type,
        sound_remove: 0,
        isolate_audio: 0,
        merge_sound: 0,
      },
    });
    // ลบเสียง
    await SoundRemove({
      inputPath,
      outPath: `${global.dirPublic}/${slug}/video_no_sound.mp4`,
      slug,
      quality: list_quality[0],
      video_type,
    });
    // แยกเสียง
    await IsolateAudio({
      inputPath,
      outPath: `${global.dirPublic}/${slug}/sound.mp3`,
      slug,
    });
    // รวมเสียง
    let merge = await MergeSound({
      inputPath: `${global.dirPublic}/${slug}/video_no_sound.mp4`,
      inputSound: `${global.dirPublic}/${slug}/sound.mp3`,
      outPath: `${global.dirPublic}/${slug}/file_${list_quality[0]}.mp4`,
      slug,
      quality: list_quality[0],
    });

    if (merge?.status) {
      //upload to server
      await SCP.Storage({
        file: merge?.file,
        save: `file_${list_quality[0]}.mp4`,
        row,
        dir: `/home/files/${slug}`,
        sv_storage,
        quality,
      });
      list_convert.push(quality);
    }
    // ประมวผล
    for (const key in list_quality) {
      if (key != 0) {
        let quality = list_quality[key];
        let covert_s = await ConvertVideo({
          inputPath: `${global.dirPublic}/${slug}/file_${list_quality[0]}.mp4`,
          slug,
          quality,
          codec_name,
          video_type,
        });
        if (covert_s?.status) {
          //upload to server
          await SCP.Storage({
            file: covert_s?.file,
            save: `file_${quality}.mp4`,
            row,
            dir: `/home/files/${slug}`,
            sv_storage,
            quality,
          });
          list_convert.push(quality);
          //if (fs.existsSync(covert_s?.file)) {
          // fs.unlinkSync(covert_s?.file);
          //}
        }
      }
    }

    if (list_convert.length) {
      await Files.Lists.update(
        { e_code: 0, s_convert: 1 },
        {
          where: { id: row?.id },
        }
      );
    } else {
      await Files.Lists.update(
        { e_code: 31, s_convert: 0 },
        {
          where: { id: row?.id },
        }
      );
    }

    await Servers.Lists.update(
      { status: 0 },
      { where: { id: process?.serverId } }
    );
    await Procress.destroy({ where: { id: process?.id } });

    return res.json(
      Alert({ status: true, msg: `convert`, quality: list_quality }, `s`)
    );
  } catch (error) {
    console.log(error);
    return res.json(Alert({ status: false, msg: error.name }, `d`));
  }

  function ConvertVideo({ inputPath, slug, quality, codec_name, video_type }) {
    let startTime = +new Date();
    let outPath = `${global.dirPublic}${slug}/file_${quality}.mp4`;
    let percent = 0;

    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    return new Promise(function (resolve, reject) {
      let video_size =
        video_type == "horizontal" ? `?x${quality}` : `${quality}x?`;
        
      let convert = ffmpeg(inputPath);
      convert.output(outPath);
      convert.size(video_size);
      convert.on("start", () => {
        console.log("start", slug, quality);
      });
      convert.on("progress", async (d) => {
        let npercent = Math.floor(d?.percent);
        if (percent != npercent) {
          await updatePercent(quality, npercent);
          //console.log("progress", slug, quality, npercent);
        }
        percent = Math.floor(d?.percent);
      });
      convert.on("end", async () => {
        await updatePercent(quality, 100);
        console.log(`Done ${quality} ${(+new Date() - startTime) / 1000}s.`);
        resolve({ status: true, file: outPath });
      });
      convert.on("error", async (err, stdout, stderr) => {
        console.log(stderr);
        await updatePercent(quality, "error");
        fs.unlinkSync(outPath);
        resolve({ status: false });
      });
      convert.run();
    });
  }
  //
  function SoundRemove({ inputPath, outPath, slug, quality, video_type }) {
    let startTime = +new Date();
    let percent = 0;
    let action = "sound_remove";
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    return new Promise(function (resolve, reject) {
      let video_size =
        video_type == "horizontal" ? `?x${quality}` : `${quality}x?`;
      console.log("video_size", video_size);
      let convert = ffmpeg(inputPath);
      convert.output(outPath);
      convert.size(video_size);
      convert.videoCodec("libx264");
      convert.outputOptions([
        "-crf 32",
        "-movflags faststart",
        "-an",
        "-max_muxing_queue_size 1024",
      ]);
      convert.on("start", () => {
        console.log("start", slug, quality);
      });
      convert.on("progress", async (d) => {
        let npercent = Math.floor(d?.percent);
        if (percent != npercent) {
          await updatePercent(action, npercent);
          //console.log("progress", slug, quality, npercent);
        }
        percent = Math.floor(d?.percent);
      });
      convert.on("end", async () => {
        await updatePercent(action, 100);
        console.log(`Done ${action} ${(+new Date() - startTime) / 1000}s.`);
        resolve({ status: true, file: outPath });
      });
      convert.on("error", async (err, stdout, stderr) => {
        console.log(stderr);
        await updatePercent(action, "error");
        fs.unlinkSync(outPath);
        resolve({ status: false });
      });
      convert.run();
    });
  }
  function IsolateAudio({ inputPath, outPath, slug }) {
    let startTime = +new Date();
    let percent = 0;
    let action = "isolate_audio";
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    return new Promise(function (resolve, reject) {
      let convert = ffmpeg(inputPath);
      convert.output(outPath);
      convert.videoCodec("libx264");
      convert.on("start", () => {
        console.log("start", slug, action);
      });
      convert.on("progress", async (d) => {
        let npercent = Math.floor(d?.percent);
        if (percent != npercent) {
          await updatePercent(action, npercent);
          //console.log("progress", slug, quality, npercent);
        }
        percent = Math.floor(d?.percent);
      });
      convert.on("end", async () => {
        await updatePercent(action, 100);
        console.log(`Done ${action} ${(+new Date() - startTime) / 1000}s.`);
        resolve({ status: true, file: outPath });
      });
      convert.on("error", async (err, stdout, stderr) => {
        console.log(stderr);
        await updatePercent(action, "error");
        fs.unlinkSync(outPath);
        resolve({ status: false });
      });
      convert.run();
    });
  }

  function MergeSound({ inputPath, inputSound, outPath, slug, quality }) {
    let startTime = +new Date();
    let percent = 0;
    let action = "merge_sound";
    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    return new Promise(function (resolve, reject) {
      let convert = ffmpeg(inputPath);
      convert.addInput(inputSound);
      convert.output(outPath);
      convert.outputOptions(["-c:v copy", "-c:a aac", "-movflags faststart"]);
      convert.on("start", () => {
        console.log("start", slug, quality);
      });
      convert.on("progress", async (d) => {
        let npercent = Math.floor(d?.percent);
        if (percent != npercent) {
          await updatePercent(action, npercent);
          //console.log("progress", slug, quality, npercent);
        }
        percent = Math.floor(d?.percent);
      });
      convert.on("end", async () => {
        await updatePercent(action, 100);
        console.log(`Done ${action} ${(+new Date() - startTime) / 1000}s.`);
        // upload to storage
        resolve({ status: true, file: outPath });
      });
      convert.on("error", async (err, stdout, stderr) => {
        console.log(stderr);
        await updatePercent(action, "error");
        fs.unlinkSync(outPath);
        resolve({ status: false });
      });
      convert.run();
    });
  }
};

async function updatePercent(quality, percent) {
  let newdata = {};
  let task = await Task();
  if (Number(quality)) {
    quality = Number(quality);
  }
  if (quality == 1080) {
    newdata.file_1080 = parseInt(percent);
  } else if (quality == 720) {
    newdata.file_720 = parseInt(percent);
  } else if (quality == 480) {
    newdata.file_480 = parseInt(percent);
  } else if (quality == 360) {
    newdata.file_360 = parseInt(percent);
  } else if (quality == "isolate_audio") {
    newdata.isolate_audio = parseInt(percent);
  } else if (quality == "sound_remove") {
    newdata.sound_remove = parseInt(percent);
  } else if (quality == "merge_sound") {
    newdata.merge_sound = parseInt(percent);
  }

  let taskUpdate = { ...task.convert_video, ...newdata };
  await Task({ convert_video: taskUpdate });
  return true;
}
