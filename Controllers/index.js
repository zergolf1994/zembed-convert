module.exports = {
  RunTask: require("./runtask"),
  DataVideo: require("./data.video"),
  Server: {
    Create: require("./server.create"),
  },
  DL: {
    Start: require("./dl.start"),
    Cancle: require("./dl.cancle"),
    Download: require("./dl.download"),
  },
  CV: {
    Video: require("./cv.video"),
    Sprites: require("./cv.sprites"),
  },
};
