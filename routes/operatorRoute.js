const express = require("express");
const router = express.Router();
const { loginOperator } = require("../controllers/operatorController");
router.post("/login", loginOperator);
// router.post("/logout");

module.exports = router;
