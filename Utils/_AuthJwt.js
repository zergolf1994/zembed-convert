"use strict";

const jwt = require("jsonwebtoken");
const verifyToken = async (req, res, next) => {
  const token =
    req.body.accessToken ||
    req.query.accessToken ||
    req.headers["x-access-token"];
  try {
    if (!token) {
      req.user = {
        error: "A token is required for authentication.",
      };
    } else {
      const data = jwt.verify(token, process.env.JWT_TOKEN_KEY);
      //เช็ค ระงับใช้งาน
      
      //เช็ค ตัดออกจากระบบ
      req.user = { ...data };
    }
  } catch (err) {
    req.user = {
      error: "Invalid Token.",
    };
    //return res.json({ status: false, msg: "Invalid Token." });
  }
  return next();
};
module.exports = verifyToken;
