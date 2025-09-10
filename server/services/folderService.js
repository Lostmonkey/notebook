const Folder = require('../models/Folder');
const Note = require('../models/Note');

class FolderService {
  async getUserFolders(userId) {
    try {
      const folders = await Folder.find({ userId })
        .sort({ order: 1 })
        .select('-__v');
      
      // 获取每个文件夹的笔记数量
      const foldersWithCount = await Promise.all(
        folders.map(async (folder) => {
          const notesCount = await Note.countDocuments({ folderId: folder._id });
          return {
            ...folder.toObject(),
            notesCount
          };
        })
      );
      
      return foldersWithCount;
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
        throw new Error('文件夹名称已存在');
      }
      
      // 获取最大排序值
      const maxOrder = await Folder.findOne({ userId })
        .sort({ order: -1 })
        .select('order');
      
      const order = maxOrder ? maxOrder.order + 1 : 4; // 系统文件夹占用1-3
      
      const folder = new Folder({
        name,
        type: 'user',
        userId,
        order
      });
      
      await folder.save();
      
      return {
        ...folder.toObject(),
        notesCount: 0
      };
    } catch (error) {
      console.error('创建文件夹失败:', error);
      throw error;
    }
  }
  
  async updateFolder(folderId, userId, updates) {
    try {
      const folder = await Folder.findOne({ _id: folderId, userId });
      
      if (!folder) {
        throw new Error('文件夹不存在');
      }
      
      if (folder.type === 'system') {
        throw new Error('系统文件夹不允许修改');
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
          throw new Error('文件夹名称已存在');
        }
      }
      
      const updatedFolder = await Folder.findByIdAndUpdate(
        folderId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-__v');
      
      // 获取笔记数量
      const notesCount = await Note.countDocuments({ folderId });
      
      return {
        ...updatedFolder.toObject(),
        notesCount
      };
    } catch (error) {
      console.error('更新文件夹失败:', error);
      throw error;
    }
  }
  
  async deleteFolder(folderId, userId) {
    try {
      const folder = await Folder.findOne({ _id: folderId, userId });
      
      if (!folder) {
        throw new Error('文件夹不存在');
      }
      
      if (folder.type === 'system') {
        throw new Error('系统文件夹不允许删除');
      }
      
      // 检查文件夹下是否有笔记
      const noteCount = await Note.countDocuments({ folderId });
      if (noteCount > 0) {
        throw new Error('文件夹中还有笔记，请先删除所有笔记');
      }
      
      await Folder.findByIdAndDelete(folderId);
      
      return { message: '文件夹删除成功' };
    } catch (error) {
      console.error('删除文件夹失败:', error);
      throw error;
    }
  }
  
  async reorderFolders(userId, folderOrders) {
    try {
      const updates = folderOrders.map(({ folderId, order }) => ({
        updateOne: {
          filter: { _id: folderId, userId, type: 'user' },
          update: { order }
        }
      }));
      
      await Folder.bulkWrite(updates);
      
      return await this.getUserFolders(userId);
    } catch (error) {
      console.error('文件夹排序失败:', error);
      throw error;
    }
  }
  
  async getFolderById(folderId, userId) {
    try {
      const folder = await Folder.findOne({ _id: folderId, userId }).select('-__v');
      
      if (!folder) {
        throw new Error('文件夹不存在');
      }
      
      const notesCount = await Note.countDocuments({ folderId });
      
      return {
        ...folder.toObject(),
        notesCount
      };
    } catch (error) {
      console.error('获取文件夹详情失败:', error);
      throw error;
    }
  }
}

module.exports = new FolderService();