"use strict";

module.exports = (data, alert) => {
  let art = "";

  switch (alert) {
    case "w":
      art = "warning";
      break;
    case "d":
      art = "danger";
      break;
    case "i":
      art = "info";
      break;
    case "s":
      art = "success";
      break;
  }

  return { ...data, alert: art };
};
