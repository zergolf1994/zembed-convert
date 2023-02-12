"use strict";
const moment = require("moment");
const sizeOf = require("image-size");
const mergeImg = require("merge-img");
const shell = require("shelljs");
const Jimp = require("jimp");

const { Files, Servers, Procress } = require(`../Models`);

module.exports = async (req, res) => {
  const { slug } = req.query;
  try {
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
          where: {
            active: 1,
          },
          required: false,
        },
      ],
    });

    return res.json({ status: true, row });
  } catch (error) {
    return res.json({ status: false });
  }
};
