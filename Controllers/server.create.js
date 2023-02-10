"use strict";

const { Servers } = require(`../Models`);
const { Alert, CheckDisk } = require(`../Utils`);

module.exports = async (req, res) => {
  const { sv_ip, sv_name } = req.query;

  try {
    if (!sv_ip) return res.json({ status: false });

    let row = await Servers.Lists.findOne({
      raw: true,
      where: { sv_ip },
    });
    if (row) return res.json(Alert({ status: false, msg: "exists" }, `w`));
    let disk = await CheckDisk();
    let data = {
      sv_name,
      sv_ip,
      type: "convert",
      active: 0,
      ...disk,
    };
    let db_create = await Servers.Lists.create(data);

    if (db_create?.id) {
      return res.json(Alert({ status: true, msg: `created` }, `s`));
    } else {
      return res.json(Alert({ status: false, msg: `db_err` }, `d`));
    }
  } catch (error) {
    console.log(error);
    return res.json(Alert({ status: false, msg: error.name }, `d`));
  }
};
