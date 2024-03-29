"use strict";

const express = require("express");
const router = express.Router();
const { AuthJwt } = require("./Utils");
const Control = require("./Controllers");
//data
router.route("/server/create").get(Control.Server.Create);

//download
router.route("/run").get(Control.RunTask);
router.route("/start").get(Control.DL.Start);
router.route("/cancle").get(Control.DL.Cancle);
router.route("/download").get(Control.DL.Download);

router.route("/video-convert").get(Control.CV.Video);
router.route("/sprites").get(Control.CV.Sprites);
router.route("/video-data").get(Control.DataVideo);
router.all("*", async (req, res) => {
  res.status(500).end();
});

module.exports = router;
