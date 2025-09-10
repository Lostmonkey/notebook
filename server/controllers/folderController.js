const folderService = require('../services/folderService');
const ApiResponse = require('../utils/response');

class FolderController {
  async getFolders(req, res, next) {
    try {
      const folders = await folderService.getUserFolders(req.user.userId);
      
      return ApiResponse.success(res, folders, '获取文件夹列表成功');
    } catch (error) {
      next(error);
    }
  }
  
  async getFolderById(req, res, next) {
    try {
      const { id } = req.params;
      const folder = await folderService.getFolderById(id, req.user.userId);
      
      return ApiResponse.success(res, folder, '获取文件夹详情成功');
    } catch (error) {
      next(error);
    }
  }
  
  async createFolder(req, res, next) {
    try {
      const { name } = req.body;
      const folder = await folderService.createFolder(req.user.userId, name);
      
      return ApiResponse.success(res, folder, '文件夹创建成功', 201);
    } catch (error) {
      next(error);
    }
  }
  
  async updateFolder(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const folder = await folderService.updateFolder(id, req.user.userId, updates);
      
      return ApiResponse.success(res, folder, '文件夹更新成功');
    } catch (error) {
      next(error);
    }
  }
  
  async deleteFolder(req, res, next) {
    try {
      const { id } = req.params;
      const result = await folderService.deleteFolder(id, req.user.userId);
      
      return ApiResponse.success(res, result, '文件夹删除成功');
    } catch (error) {
      next(error);
    }
  }
  
}

module.exports = new FolderController();