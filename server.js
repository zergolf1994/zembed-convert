"use strict";

require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const http = require("http");
const fs = require("fs-extra");
const app = express();

// Global
global.dir = __dirname;
global.dirPublic = path.join(global.dir, "public/");

app.use(
  cors({
    origin: "*",
    optionsSuccessStatus: 200,
  })
);

app.use(express.static(global.dirPublic));

app.use(bodyParser.json({ limit: "50mb" }));

app.use(
  bodyParser.urlencoded({
    limit: "50mb",
    extended: true,
    parameterLimit: 1000000,
  })
);

app.options("*", (req, res, next) => res.end());

app.use(require("./routes"));

const server = http.createServer(app);

server.listen(process.env.HTTP_PORT, () =>
  console.log(`HTTP port:${process.env.HTTP_PORT}...`)
);
