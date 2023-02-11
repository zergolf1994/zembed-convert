"use strict";

const ffmpeg = require("fluent-ffmpeg");
const fs = require("fs-extra");

const { Files, Servers, Procress } = require(`../Models`);
const { Alert, Get_Video_Data, GetIP, GetOne, SCP } = require(`../Utils`);

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
    //return res.json(video_data);

    let { width, height, duration, codec_name } = video_data?.streams[0];
    let list_quality;
    let list_convert = [];
    if (height >= 1080) list_quality = [1080, 720, 480, 360];
    else if (height >= 720) list_quality = [720, 480, 360];
    else if (height >= 480) list_quality = [480, 360];
    else if (height >= 360) list_quality = [360];
    else
      return res.json(
        Alert({ status: false, msg: `video size = ${height}` }, `d`)
      );
    console.log("list_quality", list_quality);
    for (const key in list_quality) {
      let quality = list_quality[key];
      let covert_s = await ConvertVideo({
        inputPath,
        slug,
        quality,
        codec_name,
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
        if (fs.existsSync(covert_s?.file)) {
          list_convert.push(quality);
          fs.unlinkSync(covert_s?.file);
        }
      }
    }
    console.log("list_convert", list_convert);
    // เช็คไฟล์ว่ามี backup ไหม  ถ้าไม่มี backup ให้ปิดไฟล์ default ถ้ามีให้ลบ default ออกจากเซิฟเวอร์

    /*let rowChcek = await Files.Lists.findOne({
      attributes: ["id"],
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
      ],
    });

    let checkVideos = rowChcek?.videos;
    if (checkVideos > 0) {
      for (const key in checkVideos) {
        if (checkVideos.hasOwnProperty.call(checkVideos, key)) {
          const vdo = checkVideos[key];
          if(list_quality.includes(vdo?.name)){

          }
        }
      }
    }*/
    /*let remove = await SCP.RemoveFileStorage({
      file: `/home/files/${slug}/file_default.mp4`,
      row,
      sv_storage,
      quality: "default",
    });

    console.log("convert video done", remove);
    if (fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }*/
    if (list_convert.length) {
      await Files.Lists.update(
        { e_code: 0, s_convert: 1 },
        {
          where: { id: row?.id },
        }
      );
      await Servers.Lists.update(
        { status: 0 },
        { where: { id: process?.serverId } }
      );
      await Procress.destroy({ where: { id: process?.id } });
    }

    return res.json(
      Alert({ status: true, msg: `convert`, quality: list_quality }, `s`)
    );
  } catch (error) {
    console.log(error);
    return res.json(Alert({ status: false, msg: error.name }, `d`));
  }

  function ConvertVideo({ inputPath, slug, quality, codec_name }) {
    let startTime = +new Date();
    let outPath = `${global.dirPublic}/${slug}/file_${quality}.mp4`;
    let percent = 0;

    if (fs.existsSync(outPath)) {
      fs.unlinkSync(outPath);
    }
    return new Promise(function (resolve, reject) {
      let convert = ffmpeg(inputPath);
      convert.output(outPath);
      if (codec_name != "h264") {
        convert.videoCodec("libx264");
      }
      convert.outputOptions('-max_muxing_queue_size 1024')
      convert.size(`?x${quality}`);
      convert.on("start", () => {
        console.log("start", slug, quality);
      });
      convert.on("progress", (d) => {
        let npercent = Math.floor(d?.percent);
        if (percent != npercent) {
          console.log("progress", slug, quality, npercent);
        }
        percent = Math.floor(d?.percent);
      });
      convert.on("end", () => {
        console.log(`Done ${quality} ${(+new Date() - startTime) / 1000}s.`);
        resolve({ status: true, file: outPath });
      });
      convert.on("error", (err, stdout, stderr) => {
        console.log("outPath", outPath);
        fs.unlinkSync(outPath);
        resolve({ status: false });
      });
      convert.run();
    });
  }
};
