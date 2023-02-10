"use strict";
const { ProxyCache } = require(`../Models`);

module.exports = async (data) => {
  try {
    let ProxyVideo = await ProxyCache.findAll({
      where: {
        fileId: data?.id,
      },
      raw: true,
    });
    if (ProxyVideo.length) {
      let array = {};
      for (const key in ProxyVideo) {
        if (ProxyVideo.hasOwnProperty.call(ProxyVideo, key)) {
          let name = ProxyVideo[key].name;
          array[name] = ProxyVideo[key].value;
        }
      }

      let nowTime = Date.now();
      let cacheTime = array.timestamp;
      let Time = Math.floor((nowTime - cacheTime) / 1000);
      if (Time > 12600) {
        return "time_over";
      }
      return ProxyVideo;
    } else {
      return "not_cache";
    }
  } catch (error) {
    return;
  }
};
