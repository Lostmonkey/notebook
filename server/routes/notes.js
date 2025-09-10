const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const auth = require('../middleware/auth');
const { validateNote, validateObjectId, validatePagination } = require('../middleware/validation');

// 所有路由都需要认证
router.use(auth);



// GET /api/notes/:id - 获取笔记详情
router.get('/:id', validateObjectId('id'), noteController.getNoteById);

// PUT /api/notes/:id - 更新笔记
router.put('/:id', validateObjectId('id'), validateNote, noteController.updateNote);

// DELETE /api/notes/:id - 删除笔记
router.delete('/:id', validateObjectId('id'), noteController.deleteNote);

// PUT /api/notes/:id/move - 移动笔记
router.put('/:id/move', validateObjectId('id'), noteController.moveNote);

module.exports = router;