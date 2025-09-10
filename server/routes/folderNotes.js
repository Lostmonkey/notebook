const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');
const { validateNote, validateObjectId, validatePagination } = require('../middleware/validation');

// 所有路由都需要认证
router.use(auth);

// GET /api/folders/:folderId/notes - 获取文件夹下的笔记列表
router.get('/:folderId/notes', 
  validateObjectId('folderId'), 
  validatePagination, 
  noteController.getNotesByFolder
);

// POST /api/folders/:folderId/notes - 在文件夹中创建笔记
router.post('/:folderId/notes', 
  validateObjectId('folderId'), 
  validateNote, 
  noteController.createNote
);


module.exports = router;