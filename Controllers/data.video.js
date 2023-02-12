"use strict";

const fs = require("fs-extra");

const { Alert, Get_Video_Data } = require(`../Utils`);

module.exports = async (req, res) => {
  try {
    const { slug, file } = req.query;
    if (!slug || !file) return res.json({ status: false });

    let outPath = `${global.dirPublic}${slug}/${file}`;

    if (fs.existsSync(outPath)) {
      let data = await Get_Video_Data(outPath);
      return res.json(data);
    } else {
      return res.json(Alert({ status: false, msg: "nofile", outPath }, `d`));
    }
  } catch (error) {
    console.log(error);
    return res.json(Alert({ status: false, msg: error.name }, `d`));
  }
};
