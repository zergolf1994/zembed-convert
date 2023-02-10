"use strict";

const express = require("express");
const router = express.Router();
const { AuthJwt } = require("./Utils");
const Control = require("./Controllers");
//data
router.route("/server/create").get(Control.Server.Create);

//download
router.route("/start").get(Control.DL.Start);
router.route("/cancle").get(Control.DL.Cancle);

router.all("*", async (req, res) => {
  res.status(500).end();
});

module.exports = router;
