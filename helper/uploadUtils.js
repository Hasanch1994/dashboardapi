const multer = require("multer");
const fs = require("fs");
const { nanoid } = require("nanoid");
const { eLog } = require("./createLog");

// just png and jpeg images can upload in storage
const fileFilter = (req, file, cb) => {
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};
// declare profile storage destination and fixed name
const userProfileStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./upload/profile/`);
  },
  filename: function (req, file, cb) {
    cb(null, "profile.jpg");
  },
});

//delete profile image
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

// declare portfolio storage destination and name that use nanoid with 9 length
const portfolioStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, `./upload/portfolio/`);
  },
  filename: function (req, file, cb) {
    cb(null, nanoid(9) + ".jpg");
  },
});

//delete portfolio images with list of paths
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
