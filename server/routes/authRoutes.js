const express = require('express');
const router = express.Router();
const { validateRegister, validateLogin } = require('../middleware/validation');
const { register, login, refresh, logout } = require('../controllers/authController');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh', refresh);
router.post('/logout', logout);

module.exports = router;
