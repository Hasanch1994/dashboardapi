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
  addContact,
  getContactUs,
  handleRefreshToken,
  readContact,
} = require("../controllers/actionController");
const auth = require("../middleware/auth");
const {
  fileFilter,
  userProfileStorage,
  portfolioStorage,
} = require("../helper/uploadUtils");
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
router.get("/skills", auth, getSkills);
// add new skill
router.post("/addNewSkill", auth, addNewSkill);
// delete skill
router.delete("/deleteSkill/:id", auth, deleteSkill);
// update skill
router.put("/updateSkill", auth, updateSkill);

/*
  portfolio routes
  contains add,delete and get for portfolio
*/
const upload = multer({ storage: portfolioStorage }).array("Images", 8);

// add new portfolio with upload multipart images with max count 4
router.post("/addPortfolio", upload, auth, fileFilter, addPortfolio);

// get portfolio
router.get("/portfolios", auth, getPortfolios);

// delete portfolio
router.delete("/deletePortfolio/:id", auth, deletePortfolio);

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

/*
  contact route
*/

// add new contactUS
router.post("/addNewContact", addContact);

// get contactUS
router.get("/getContacts", getContactUs);

// read contact by operator
router.put("/readContact/:id", readContact);

/*
  refresh Token
*/

router.post("/refreshToken", handleRefreshToken);

module.exports = router;
