"use strict";

const { Files, Servers, Procress } = require(`../Models`);
const { Alert, CheckDisk, GetIP, GetOne, SCP, Task } = require(`../Utils`);
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  try {
    const { slug } = req.query;

    if (!slug) return res.json({ status: false });
    let task = await Task();
    if (task?.download) return res.json({ status: false, msg: "downloaded" });
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

    let file_list = await SCP.CheckFileStorage({ sv_storage, slug });
    let file_lists = [];
    for (const key in file_list) {
      if (file_list.hasOwnProperty.call(file_list, key)) {
        const name = file_list[key].name;
        file_lists.push(name);
      }
    }

    if (file_lists.length) {
      let download = await SCP.DownloadFileStorage({
        sv_storage,
        slug,
        file_name: file_lists[0],
      });
    }
    return res.json(Alert({ status: true, file_lists }, `s`));
  } catch (error) {
    console.log(error);
    return res.json(Alert({ status: false, msg: error.name }, `d`));
  }
};
