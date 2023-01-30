const express = require("express");
const router = express.Router();
const { updateBaseInfo } = require("../controller/actionController");
const checkAuth = require("../middleware/auth");
const { fileFilter, userProfileStorage } = require("../helper/uploadUtils");
const multer = require("multer");

/* all methods checking auth at first
    update info includes name about image
*/

router.post(
  "/updateBaseInfo",
  fileFilter,
  multer({ storage: userProfileStorage }).single("Image"),
  //   checkAuth,
  updateBaseInfo
);

module.exports = router;
