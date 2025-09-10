const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const auth = require('../middleware/auth');
const { validateUser } = require('../middleware/validation');

// POST /api/auth/login - 用户登录
router.post('/login', validateUser, authController.login);

// GET /api/auth/profile - 获取用户信息（需要认证）
router.get('/profile', auth, authController.getProfile);

// POST /api/auth/logout - 用户登出
router.post('/logout', auth, authController.logout);

module.exports = router;