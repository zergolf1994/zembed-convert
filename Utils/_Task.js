"use strict";
const path = require("path");
const fs = require("fs-extra");

module.exports = async (data = false) => {
  try {
    if (!fs.existsSync(global.dirPublic)) {
      fs.mkdirSync(global.dirPublic, { recursive: true });
    }
    let file_task = path.join(global.dirPublic, "task.json");
    let task;
    if (!fs.existsSync(file_task) && data != false) {
      task = data;
      fs.writeFileSync(file_task, JSON.stringify(data), "utf8");
    } else if (fs.existsSync(file_task)) {
      // update
      let dataOld = await fs.readFileSync(file_task);
      let dataOldJson = JSON.parse(dataOld);
      if (data != false) {
        task = { ...dataOldJson, ...data };
        fs.writeFileSync(file_task, JSON.stringify(task), "utf8");
      } else {
        task = dataOldJson;
      }
    }
    return task;
  } catch (error) {
    return;
  }
};
