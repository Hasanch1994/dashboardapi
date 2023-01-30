const express = require("express");
const router = express.Router();
const { loginOperator } = require("../controller/operatorController");
router.post("/login", loginOperator);
// router.post("/logout");

module.exports = router;
