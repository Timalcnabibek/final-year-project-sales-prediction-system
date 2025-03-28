const express = require("express");
const createcus = require("../controllers/signup");
const verifyOTP = require("../controllers/otpverification");

const router = express.Router();

router.post("/signup", createcus);
router.post("/verify-otp", verifyOTP);

module.exports = router;
