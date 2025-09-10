const mongoose = require('mongoose');
const config = require('../config');

class Database {
  constructor() {
    this.connection = null;
  }

  async connect() {
    try {
      console.log('正在连接到MongoDB...');
      console.log('数据库URI:', config.mongodb.uri.replace(/\/\/.*@/, '//***:***@')); // 隐藏密码
      
      // 直接连接到目标数据库，使用authSource=admin进行认证
      this.connection = await mongoose.connect(config.mongodb.uri, config.mongodb.options);
      
      console.log('MongoDB连接成功');
      console.log('当前数据库:', this.connection.connection.db.databaseName);
      
      // 监听连接事件
      mongoose.connection.on('error', (err) => {
        console.error('MongoDB连接错误:', err);
      });

      mongoose.connection.on('disconnected', () => {
        console.log('MongoDB连接已断开');
      });

      process.on('SIGINT', async () => {
        await this.disconnect();
        process.exit(0);
      });

      return this.connection;
    } catch (error) {
      console.error('MongoDB连接失败:', error);
      throw error;
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        console.log('MongoDB连接已关闭');
      }
    } catch (error) {
      console.error('关闭MongoDB连接时出错:', error);
    }
  }

  isConnected() {
    return mongoose.connection.readyState === 1;
  }
}

module.exports = new Database();