const multer = require("multer");
const fs = require("fs");
const { nanoid } = require("nanoid");

const { fileDeleted } = require("../config/errors");
const { eLog } = require("./createLog");

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const userProfileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./upload/profile/`);
  },
  filename: function (req, file, cb) {
    cb(null, "profile.jpg");
  },
});

const deleteProfileImage = () => {
  var result = false;
  try {
    new Promise((resolve, reject) => {
      fs.unlink(`./upload/profile/profile.jpg`, (err) => {});
      if (index === array.length - 1) resolve();
    })
      .then(() => {
        result = true;
      })
      .catch((err) => {
        result = false;
        throw err;
      });
  } catch (err) {
    result = false;
    eLog(err);
  }

  return result;
};

const portfolioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./upload/portfolio/`);
  },
  filename: function (req, file, cb) {
    cb(null, nanoid(9) + ".jpg");
  },
});

const deletePortfolioImage = (imageURLS) => {
  const names = imageURLS.map((item) => item.substring(item.length - 31));
  try {
    names.forEach(
      (path) => fs.existsSync("." + path) && fs.unlinkSync("." + path)
    );
  } catch (err) {
    eLog(err);
  }
};

module.exports = {
  deleteProfileImage,
  fileFilter,
  userProfileStorage,
  deletePortfolioImage,
  portfolioStorage,
};
