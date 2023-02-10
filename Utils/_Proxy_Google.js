"use strict";
const { Files, ProxyCache } = require(`../Models`);
const GoogleAuth = require(`./_GoogleAuth`);

module.exports = async (data) => {
  try {
    let google_data = await GoogleAuth.Source(data);
    return google_data;
  } catch (error) {
    return;
  }
};
