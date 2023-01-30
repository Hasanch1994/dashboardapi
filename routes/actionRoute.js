const express = require("express");
const router = express.Router();
const {
  updateBaseInfo,
  addNewSkill,
  deleteSkill,
} = require("../controller/actionController");
const checkAuth = require("../middleware/auth");
const { fileFilter, userProfileStorage } = require("../helper/uploadUtils");
const multer = require("multer");

/* all methods checking auth at first
    update info includes name about image
*/

/*
  about routes
  contains update
*/
router.put(
  "/updateBaseInfo",
  fileFilter,
  multer({ storage: userProfileStorage }).single("Image"),
  //   checkAuth,
  updateBaseInfo
);

/*
  skill routes
  contains add,delete and update for skills
*/

// add new skill
router.post("/addNewSkill", addNewSkill);
// delete skill
router.delete("/deleteSkill", deleteSkill);
// update skill
router.put("/updateSkill", updateSkill);
module.exports = router;
