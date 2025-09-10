const Folder = require('../models/Folder');
const Note = require('../models/Note');

class FolderService {
  async getUserFolders(userId) {
    try {
      const folders = await Folder.find({ userId })
        .sort({ type: 1, createdAt: 1 }) // 系统文件夹在前，按创建时间排序
        .select('-__v');
      
      return folders.map(folder => folder.toObject());
    } catch (error) {
      console.error('获取用户文件夹失败:', error);
      throw error;
    }
  }
  
  async createFolder(userId, name) {
    try {
      // 检查文件夹名是否已存在
      const existingFolder = await Folder.findOne({ userId, name, type: 'user' });
      if (existingFolder) {
        const error = new Error('文件夹名称已存在');
        error.statusCode = 409;
        throw error;
      }
      
      const folder = new Folder({
        name,
        type: 'user',
        userId
      });
      
      await folder.save();
      
      return folder.toObject();
    } catch (error) {
      console.error('创建文件夹失败:', error);
      throw error;
    }
  }
  
  async updateFolder(folderId, userId, updates) {
    try {
      const folder = await Folder.findOne({ _id: folderId, userId });
      
      if (!folder) {
        const error = new Error('文件夹不存在');
        error.statusCode = 404;
        throw error;
      }
      
      if (folder.type === 'system') {
        const error = new Error('系统文件夹不允许修改');
        error.statusCode = 403;
        throw error;
      }
      
      // 如果更新名称，检查是否重复
      if (updates.name && updates.name !== folder.name) {
        const existingFolder = await Folder.findOne({ 
          userId, 
          name: updates.name, 
          type: 'user',
          _id: { $ne: folderId }
        });
        
        if (existingFolder) {
          const error = new Error('文件夹名称已存在');
          error.statusCode = 409;
          throw error;
        }
      }
      
      const updatedFolder = await Folder.findByIdAndUpdate(
        folderId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-__v');
      
      return updatedFolder.toObject();
    } catch (error) {
      console.error('更新文件夹失败:', error);
      throw error;
    }
  }
  
  async deleteFolder(folderId, userId) {
    try {
      const folder = await Folder.findOne({ _id: folderId, userId });
      
      if (!folder) {
        const error = new Error('文件夹不存在');
        error.statusCode = 404;
        throw error;
      }
      
      if (folder.type === 'system') {
        const error = new Error('系统文件夹不允许删除');
        error.statusCode = 403;
        throw error;
      }
      
      // 检查文件夹下是否有笔记
      const noteCount = await Note.countDocuments({ folderId });
      if (noteCount > 0) {
        const error = new Error('文件夹中还有笔记，请先删除所有笔记');
        error.statusCode = 409;
        throw error;
      }
      
      await Folder.findByIdAndDelete(folderId);
      
      return { message: '文件夹删除成功' };
    } catch (error) {
      console.error('删除文件夹失败:', error);
      throw error;
    }
  }
  
  
  async getFolderById(folderId, userId) {
    try {
      const folder = await Folder.findOne({ _id: folderId, userId }).select('-__v');
      
      if (!folder) {
        const error = new Error('文件夹不存在');
        error.statusCode = 404;
        throw error;
      }
      
      return folder.toObject();
    } catch (error) {
      console.error('获取文件夹详情失败:', error);
      throw error;
    }
  }
}

module.exports = new FolderService();