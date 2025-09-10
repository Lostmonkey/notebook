const Note = require('../models/Note');
const Folder = require('../models/Folder');

class NoteService {
  async getNotesByFolder(folderId, userId, options = {}) {
    try {
      // 验证文件夹是否存在且属于用户
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        throw new Error('文件夹不存在');
      }
      
      const { page = 1, limit = 50 } = options;
      const skip = (page - 1) * limit;
      
      const notes = await Note.find({ folderId, userId })
        .select('title order updatedAt')
        .sort({ order: 1, updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Note.countDocuments({ folderId, userId });
      
      return {
        notes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('获取文件夹笔记失败:', error);
      throw error;
    }
  }
  
  async getNoteById(noteId, userId) {
    try {
      const note = await Note.findOne({ _id: noteId, userId })
        .populate('folderId', 'name type')
        .select('-__v');
      
      if (!note) {
        throw new Error('笔记不存在');
      }
      
      return note;
    } catch (error) {
      console.error('获取笔记详情失败:', error);
      throw error;
    }
  }
  
  async createNote(folderId, userId, title, content = null) {
    try {
      // 验证文件夹是否存在且属于用户
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        throw new Error('文件夹不存在');
      }
      
      // 检查标题是否在文件夹中重复
      const existingNote = await Note.findOne({ folderId, title });
      if (existingNote) {
        throw new Error('笔记标题在当前文件夹中已存在');
      }
      
      // 获取最大排序值
      const maxOrder = await Note.findOne({ folderId })
        .sort({ order: -1 })
        .select('order');
      
      const order = maxOrder ? maxOrder.order + 1 : 1;
      
      const note = new Note({
        title,
        content: content || {
          type: 'doc',
          content: []
        },
        folderId,
        userId,
        order
      });
      
      await note.save();
      
      return note;
    } catch (error) {
      console.error('创建笔记失败:', error);
      throw error;
    }
  }
  
  async updateNote(noteId, userId, updates) {
    try {
      const note = await Note.findOne({ _id: noteId, userId });
      
      if (!note) {
        throw new Error('笔记不存在');
      }
      
      // 如果更新标题，检查是否在同一文件夹中重复
      if (updates.title && updates.title !== note.title) {
        const existingNote = await Note.findOne({
          folderId: note.folderId,
          title: updates.title,
          _id: { $ne: noteId }
        });
        
        if (existingNote) {
          throw new Error('笔记标题在当前文件夹中已存在');
        }
      }
      
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).populate('folderId', 'name type').select('-__v');
      
      return updatedNote;
    } catch (error) {
      console.error('更新笔记失败:', error);
      throw error;
    }
  }
  
  async deleteNote(noteId, userId) {
    try {
      const note = await Note.findOne({ _id: noteId, userId });
      
      if (!note) {
        throw new Error('笔记不存在');
      }
      
      await Note.findByIdAndDelete(noteId);
      
      return { message: '笔记删除成功' };
    } catch (error) {
      console.error('删除笔记失败:', error);
      throw error;
    }
  }
  
  async moveNote(noteId, userId, targetFolderId) {
    try {
      const note = await Note.findOne({ _id: noteId, userId });
      if (!note) {
        throw new Error('笔记不存在');
      }
      
      // 验证目标文件夹
      const targetFolder = await Folder.findOne({ _id: targetFolderId, userId });
      if (!targetFolder) {
        throw new Error('目标文件夹不存在');
      }
      
      // 检查目标文件夹中是否有同名笔记
      const existingNote = await Note.findOne({
        folderId: targetFolderId,
        title: note.title,
        _id: { $ne: noteId }
      });
      
      if (existingNote) {
        throw new Error('目标文件夹中已存在同名笔记');
      }
      
      // 获取目标文件夹的最大排序值
      const maxOrder = await Note.findOne({ folderId: targetFolderId })
        .sort({ order: -1 })
        .select('order');
      
      const order = maxOrder ? maxOrder.order + 1 : 1;
      
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { folderId: targetFolderId, order, updatedAt: new Date() },
        { new: true }
      ).populate('folderId', 'name type').select('-__v');
      
      return updatedNote;
    } catch (error) {
      console.error('移动笔记失败:', error);
      throw error;
    }
  }
  
  async reorderNotes(folderId, userId, noteOrders) {
    try {
      // 验证文件夹
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        throw new Error('文件夹不存在');
      }
      
      const updates = noteOrders.map(({ noteId, order }) => ({
        updateOne: {
          filter: { _id: noteId, userId, folderId },
          update: { order }
        }
      }));
      
      await Note.bulkWrite(updates);
      
      return await this.getNotesByFolder(folderId, userId);
    } catch (error) {
      console.error('笔记排序失败:', error);
      throw error;
    }
  }
  
  async searchNotes(userId, query, options = {}) {
    try {
      const { page = 1, limit = 20 } = options;
      const skip = (page - 1) * limit;
      
      const searchRegex = new RegExp(query, 'i');
      
      const notes = await Note.find({
        userId,
        $or: [
          { title: searchRegex },
          { 'content.content': { $elemMatch: { text: searchRegex } } }
        ]
      })
        .populate('folderId', 'name')
        .select('title folderId updatedAt')
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit);
      
      const total = await Note.countDocuments({
        userId,
        $or: [
          { title: searchRegex },
          { 'content.content': { $elemMatch: { text: searchRegex } } }
        ]
      });
      
      return {
        notes,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('搜索笔记失败:', error);
      throw error;
    }
  }
  
  async getRecentNotes(userId, limit = 10) {
    try {
      const notes = await Note.find({ userId })
        .populate('folderId', 'name')
        .select('title folderId updatedAt')
        .sort({ updatedAt: -1 })
        .limit(limit);
      
      return notes;
    } catch (error) {
      console.error('获取最近笔记失败:', error);
      throw error;
    }
  }
}

module.exports = new NoteService();