const User = require('../models/User');
const Folder = require('../models/Folder');
const jwt = require('jsonwebtoken');
const config = require('../config');

class UserService {
  async loginOrCreate(username) {
    try {
      // 查找用户
      let user = await User.findOne({ username });
      
      if (!user) {
        // 创建新用户
        user = new User({ username });
        await user.save();
        
        // 为新用户创建系统文件夹
        await this.createSystemFolders(user._id);
        
        console.log(`新用户创建成功: ${username}`);
      } else {
        console.log(`用户登录: ${username}`);
      }
      
      // 生成JWT token
      const token = jwt.sign(
        {
          userId: user._id,
          username: user.username
        },
        config.jwt.secret,
        { expiresIn: config.jwt.expiresIn }
      );
      
      return {
        user: {
          _id: user._id,
          username: user.username,
          createdAt: user.createdAt
        },
        token
      };
    } catch (error) {
      console.error('用户登录/创建失败:', error);
      throw error;
    }
  }
  
  async createSystemFolders(userId) {
    const systemFolders = [
      { name: '单词表', type: 'system', userId, order: 1 },
      { name: '例句集', type: 'system', userId, order: 2 },
      { name: '素材库', type: 'system', userId, order: 3 }
    ];
    
    try {
      await Folder.insertMany(systemFolders);
      console.log(`系统文件夹创建成功，用户: ${userId}`);
    } catch (error) {
      console.error('创建系统文件夹失败:', error);
      throw error;
    }
  }
  
  async getUserProfile(userId) {
    try {
      const user = await User.findById(userId).select('-__v');
      if (!user) {
        throw new Error('用户不存在');
      }
      
      return user;
    } catch (error) {
      console.error('获取用户信息失败:', error);
      throw error;
    }
  }
  
  async getUserStats(userId) {
    try {
      const [folderCount, noteCount] = await Promise.all([
        Folder.countDocuments({ userId }),
        require('../models/Note').countDocuments({ userId })
      ]);
      
      return {
        folderCount,
        noteCount,
        systemFolderCount: await Folder.countDocuments({ userId, type: 'system' }),
        userFolderCount: await Folder.countDocuments({ userId, type: 'user' })
      };
    } catch (error) {
      console.error('获取用户统计失败:', error);
      throw error;
    }
  }
}

module.exports = new UserService();