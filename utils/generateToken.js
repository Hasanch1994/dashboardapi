const jwt = require("jsonwebtoken");
const fs = require("fs");
require("dotenv").config();
const CryptoJS = require("crypto-js");
const { jwtKeys } = require("../files/keys");

const accessTokenSignOptions = {
  expiresIn: "30d",
  algorithm: "RS256",
};

const refreshTokenSignOptions = {
  expiresIn: "30d",
  algorithm: "RS256",
};

module.exports = class GenerateToken {
  constructor() {}

  accessToken = async (id, name) => {
    const PRIVATE_KEY = fs.readFileSync("./files/accessToken/private.key");
    const ENCRYPT_KEY = process.env.ENCRYPT_KEY;

    // const encryptedId = CryptoJS.AES.encrypt(id, ENCRYPT_KEY).toString();
    // const encryptedPhone = CryptoJS.AES.encrypt(phone, ENCRYPT_KEY).toString();

    const accessPayload = {
      userId: id,
      userName: name,
    };

    const accessToken = jwt.sign(
      accessPayload,
      PRIVATE_KEY,
      accessTokenSignOptions
    );
    return accessToken;
  };

  refreshToken = async (id) => {
    const PRIVATE_KEY = fs.readFileSync("./files/refreshToken/private.key");
    // const ENCRYPT_KEY = process.env.ENCRYPT_KEY;
    // const encryptedId = CryptoJS.AES.encrypt(id, ENCRYPT_KEY).toString();

    const refreshPayload = {
      userId: id,
    };

    const refreshToken = jwt.sign(
      refreshPayload,
      PRIVATE_KEY,
      refreshTokenSignOptions
    );
    return { refreshToken };
  };
};
