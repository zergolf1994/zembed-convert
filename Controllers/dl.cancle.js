"use strict";

const { Files, Servers, Procress } = require(`../Models`);
const { Alert, CheckDisk, GetIP } = require(`../Utils`);
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  try {
    const { slug } = req.query;

    if (!slug) return res.json({ status: false });

    let row = await Files.Lists.findOne({
      raw: true,
      where: {
        slug,
      },
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

    await Servers.Lists.update(
      { status: 0 },
      {
        where: { id: process.serverId },
        silent: true,
      }
    );

    await Files.Lists.update(
      { e_code: 0 },
      {
        where: { id: process.fileId },
        silent: true,
      }
    );

    let db_delete = await Procress.destroy({ where: { id: process.id } });

    if (db_delete) {
      return res.json(Alert({ status: true, msg: `canceled` }, `s`));
    } else {
      return res.json(Alert({ status: false, msg: `db_err` }, `d`));
    }
  } catch (error) {
    console.log(error);
    return res.json(Alert({ status: false, msg: error.name }, `d`));
  }
};
