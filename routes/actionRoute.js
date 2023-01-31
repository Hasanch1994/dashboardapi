const express = require("express");
const router = express.Router();
const {
  updateBaseInfo,
  addNewSkill,
  deleteSkill,
  updateSkill,
  getSkills,
  getPortfolios,
  deletePortfolio,
  addPortfolio,
  addExperience,
  getExperiences,
  deleteExperience,
  updateExperience,
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
  contains add,delete,get and update for skills
*/

// get skills
router.get("/skills", getSkills);
// add new skill
router.post("/addNewSkill", addNewSkill);
// delete skill
router.delete("/deleteSkill", deleteSkill);
// update skill
router.put("/updateSkill", updateSkill);

/*
  portfolio routes
  contains add,delete and get for portfolio
*/

// add new portfolio with upload multipart images with max count 4
router.post("/addPortfolio", fileFilter, addPortfolio);

// get portfolio
router.get("/portfolios", getPortfolios);

// delete portfolio
router.delete("/deletePortfolio", deletePortfolio);

/*
  experiences routes
  contains add,delete,update and get for experiences
*/

// add new experience
router.post("/addExperience", addExperience);
// get experiences
router.get("/getExperiences", getExperiences);
// delete experience
router.delete("/deleteExperience", deleteExperience);
// update experience
router.put("/updateExperience", updateExperience);

module.exports = router;
