const Note = require('../models/Note');
const Folder = require('../models/Folder');

class NoteService {
  async getNotesByFolder(folderId, userId) {
    try {
      // 验证文件夹是否存在且属于用户
      const folder = await Folder.findOne({ _id: folderId, userId });
      if (!folder) {
        const error = new Error('文件夹不存在');
        error.statusCode = 404;
        throw error;
      }
      
      const notes = await Note.find({ folderId, userId })
        .select('title updatedAt')
        .sort({ updatedAt: -1 });
      
      return notes;
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
        const error = new Error('笔记不存在');
        error.statusCode = 404;
        throw error;
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
        const error = new Error('文件夹不存在');
        error.statusCode = 404;
        throw error;
      }
      
      // 检查标题是否在文件夹中重复
      const existingNote = await Note.findOne({ folderId, title });
      if (existingNote) {
        const error = new Error('笔记标题在当前文件夹中已存在');
        error.statusCode = 400;
        throw error;
      }
      
      const note = new Note({
        title,
        content: content || {
          type: 'doc',
          content: []
        },
        folderId,
        userId
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
        const error = new Error('笔记不存在');
        error.statusCode = 404;
        throw error;
      }
      
      // 如果更新标题，检查是否在同一文件夹中重复
      if (updates.title && updates.title !== note.title) {
        const existingNote = await Note.findOne({
          folderId: note.folderId,
          title: updates.title,
          _id: { $ne: noteId }
        });
        
        if (existingNote) {
          const error = new Error('笔记标题在当前文件夹中已存在');
          error.statusCode = 400;
          throw error;
        }
      }
      
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { ...updates, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).select('-__v');
      
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
        const error = new Error('笔记不存在');
        error.statusCode = 404;
        throw error;
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
        const error = new Error('笔记不存在');
        error.statusCode = 404;
        throw error;
      }
      
      // 验证目标文件夹
      const targetFolder = await Folder.findOne({ _id: targetFolderId, userId });
      if (!targetFolder) {
        const error = new Error('目标文件夹不存在');
        error.statusCode = 404;
        throw error;
      }
      
      // 检查目标文件夹中是否有同名笔记
      const existingNote = await Note.findOne({
        folderId: targetFolderId,
        title: note.title,
        _id: { $ne: noteId }
      });
      
      if (existingNote) {
        const error = new Error('目标文件夹中已存在同名笔记');
        error.statusCode = 409;
        throw error;
      }
      
      const updatedNote = await Note.findByIdAndUpdate(
        noteId,
        { folderId: targetFolderId, updatedAt: new Date() },
        { new: true }
      ).populate('folderId', 'name type').select('-__v');
      
      return updatedNote;
    } catch (error) {
      console.error('移动笔记失败:', error);
      throw error;
    }
  }
  
}

module.exports = new NoteService();