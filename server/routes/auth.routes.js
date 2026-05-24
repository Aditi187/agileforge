const express = require('express');
const router = express.Router();
const { register, login, getMe, getUsers } = require('../controllers/authController');
const { auth } = require('../middleware/auth');

router.post('/register', register);
router.post('/login', login);
router.get('/me', auth, getMe);
router.get('/users', auth, getUsers);

module.exports = router;
