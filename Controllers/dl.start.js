"use strict";

const { Files, Servers, Procress } = require(`../Models`);
const { Alert, CheckDisk, GetIP } = require(`../Utils`);
const { Sequelize, Op } = require("sequelize");

module.exports = async (req, res) => {
  try {
    const { slug } = req.query;

    if (!slug) return res.json({ status: false });
    const sv_ip = await GetIP();
    let server = await Servers.Lists.findOne({
      raw: true,
      where: {
        sv_ip,
        active: 1,
        status: 0,
      },
    });

    if (!server)
      return res.json(Alert({ status: false, msg: "server_busy" }, `w`));

    let row = await Files.Lists.findOne({
      raw: true,
      where: {
        slug,
        e_code: 0,
        s_convert: 0,
        [Op.or]: [{ s_backup: 1 }, { s_video: 1 }],
      },
    });
    if (!row) return res.json(Alert({ status: false, msg: "not_exists" }, `w`));

    let data = {
      userId: row?.uid,
      serverId: server?.id,
      fileId: row?.id,
      type: "convert",
    };
    let db_create = await Procress.create(data);

    if (db_create?.id) {
      await Files.Lists.update(
        { e_code: 1 },
        {
          where: { id: data.fileId },
          silent: true,
        }
      );
      await Servers.Lists.update(
        { status: 1 },
        {
          where: { id: data.serverId },
          silent: true,
        }
      );
      return res.json(Alert({ status: true, msg: `created` }, `s`));
    } else {
      return res.json(Alert({ status: false, msg: `db_err` }, `d`));
    }
  } catch (error) {
    console.log(error);
    return res.json(Alert({ status: false, msg: error.name }, `d`));
  }
};
