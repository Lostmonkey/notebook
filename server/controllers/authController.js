const userService = require('../services/userService');
const ApiResponse = require('../utils/response');

class AuthController {
  async login(req, res, next) {
    try {
      const { username } = req.body;
      
      const result = await userService.loginOrCreate(username);
      
      return ApiResponse.success(res, result, '登录成功');
    } catch (error) {
      next(error);
    }
  }
  
  async getProfile(req, res, next) {
    try {
      const user = await userService.getUserProfile(req.user.userId);
      const stats = await userService.getUserStats(req.user.userId);
      
      return ApiResponse.success(res, {
        ...user.toObject(),
        stats
      }, '获取用户信息成功');
    } catch (error) {
      next(error);
    }
  }
  
  async logout(req, res, next) {
    try {
      // JWT是无状态的，客户端删除token即可
      return ApiResponse.success(res, null, '登出成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();