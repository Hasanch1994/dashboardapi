const express = require("express");
const router = express.Router();
const {
  loginOperator,
  handleLogout,
} = require("../controllers/operatorController");
router.post("/login", loginOperator);
router.post("/logout", handleLogout);

module.exports = router;
