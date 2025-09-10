const jwt = require('jsonwebtoken');
const config = require('../config');
const ApiResponse = require('../utils/response');
const User = require('../models/User');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return ApiResponse.unauthorized(res, '未提供认证令牌');
    }
    
    const decoded = jwt.verify(token, config.jwt.secret);
    
    // 验证用户是否存在
    const user = await User.findById(decoded.userId);
    if (!user) {
      return ApiResponse.unauthorized(res, '用户不存在');
    }
    
    req.user = {
      userId: decoded.userId,
      username: decoded.username
    };
    
    next();
  } catch (error) {
    console.error('认证中间件错误:', error);
    
    if (error.name === 'JsonWebTokenError') {
      return ApiResponse.unauthorized(res, '无效的认证令牌');
    }
    
    if (error.name === 'TokenExpiredError') {
      return ApiResponse.unauthorized(res, '认证令牌已过期');
    }
    
    return ApiResponse.error(res, '认证失败');
  }
};

module.exports = auth;