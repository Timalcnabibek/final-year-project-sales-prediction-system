const express = require('express');
const router = express.Router();
// const authController = require('../controllers/authController');
const createCustomer = require('../controllers/signup');


router.post('/signup', createCustomer);
module.exports = router;

