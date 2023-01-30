var jwt = require("jsonwebtoken");
require("dotenv").config();
const fs = require("fs");

module.exports = (req, res, next) => {
  try {
    const PUBLIC_KEY = fs.readFileSync("./files/accessToken/public.key");
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (authHeader === undefined) res.sendStatus(401);
    const token = authHeader.split(" ")[1];
    if (!authHeader?.startsWith("Bearer ")) return res.sendStatus(401);
    if (!token) res.sendStatus(401);

    jwt.verify(token, PUBLIC_KEY, (err, decoded) => {
      if (err) return res.status(401).json({ err: err });
      req.operatorData = decoded;
      next();
    });
  } catch (err) {
    return res.sendStatus(401);
  }
};
