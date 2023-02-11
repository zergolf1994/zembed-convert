"use strict";
const { Storage } = require(`../Models`);
const { Op } = require("sequelize");

module.exports = async ({ storageId }) => {
  try {
    let where = {
      id: storageId,
    };
    
    let rows = await Storage.Lists.findOne({
      //subQuery: false,
      where,
      attributes: ["id", "sv_ip"],
      include: [
        {
          //required: true,
          separate: true,
          model: Storage.Sets,
          as: "sets",
          attributes: ["name", "value"],
          where: {
            name: { [Op.or]: ["username", "password", "port"] },
          },
        },
      ],
      order: [["disk_percent", "ASC"]],
    });
    if (!rows) return;

    let data = {};
    data.id = rows?.id;
    data.sv_ip = rows?.sv_ip;
    let sets = rows?.sets;

    if (!sets.length) return;

    for (let key in sets) {
      if (sets.hasOwnProperty(key)) {
        let name = sets[key]?.dataValues?.name;
        let value = sets[key]?.dataValues?.value;
        data[name] = value;
      }
    }

    return data;
  } catch (error) {
    console.log(error.name);
    return;
  }
};
