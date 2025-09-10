const noteService = require('../services/noteService');
const ApiResponse = require('../utils/response');

class NoteController {
  async getNotesByFolder(req, res, next) {
    try {
      const { folderId } = req.params;
      const { page, limit } = req.query;
      
      const result = await noteService.getNotesByFolder(folderId, req.user.userId, {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 50
      });
      
      return ApiResponse.success(res, result, '获取笔记列表成功');
    } catch (error) {
      next(error);
    }
  }
  
  async getNoteById(req, res, next) {
    try {
      const { id } = req.params;
      const note = await noteService.getNoteById(id, req.user.userId);
      
      return ApiResponse.success(res, note, '获取笔记详情成功');
    } catch (error) {
      next(error);
    }
  }
  
  async createNote(req, res, next) {
    try {
      const { folderId } = req.params;
      const { title, content } = req.body;
      
      const note = await noteService.createNote(folderId, req.user.userId, title, content);
      
      return ApiResponse.success(res, note, '笔记创建成功', 201);
    } catch (error) {
      next(error);
    }
  }
  
  async updateNote(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const note = await noteService.updateNote(id, req.user.userId, updates);
      
      return ApiResponse.success(res, note, '笔记更新成功');
    } catch (error) {
      next(error);
    }
  }
  
  async deleteNote(req, res, next) {
    try {
      const { id } = req.params;
      const result = await noteService.deleteNote(id, req.user.userId);
      
      return ApiResponse.success(res, result, '笔记删除成功');
    } catch (error) {
      next(error);
    }
  }
  
  async moveNote(req, res, next) {
    try {
      const { id } = req.params;
      const { targetFolderId } = req.body;
      
      if (!targetFolderId) {
        return ApiResponse.badRequest(res, '目标文件夹ID不能为空');
      }
      
      const note = await noteService.moveNote(id, req.user.userId, targetFolderId);
      
      return ApiResponse.success(res, note, '笔记移动成功');
    } catch (error) {
      next(error);
    }
  }
  
  async reorderNotes(req, res, next) {
    try {
      const { folderId } = req.params;
      const { noteOrders } = req.body;
      
      if (!Array.isArray(noteOrders)) {
        return ApiResponse.badRequest(res, 'noteOrders必须是数组');
      }
      
      const result = await noteService.reorderNotes(folderId, req.user.userId, noteOrders);
      
      return ApiResponse.success(res, result, '笔记排序成功');
    } catch (error) {
      next(error);
    }
  }
  
  async searchNotes(req, res, next) {
    try {
      const { q: query, page, limit } = req.query;
      
      if (!query || query.trim() === '') {
        return ApiResponse.badRequest(res, '搜索关键词不能为空');
      }
      
      const result = await noteService.searchNotes(req.user.userId, query.trim(), {
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20
      });
      
      return ApiResponse.success(res, result, '搜索笔记成功');
    } catch (error) {
      next(error);
    }
  }
  
  async getRecentNotes(req, res, next) {
    try {
      const { limit } = req.query;
      const notes = await noteService.getRecentNotes(req.user.userId, parseInt(limit) || 10);
      
      return ApiResponse.success(res, notes, '获取最近笔记成功');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new NoteController();