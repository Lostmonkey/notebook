const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const auth = require('../middleware/auth');
const { validateFolder, validateObjectId } = require('../middleware/validation');

// 所有路由都需要认证
router.use(auth);

// GET /api/folders - 获取文件夹列表
router.get('/', folderController.getFolders);

// GET /api/folders/:id - 获取文件夹详情
router.get('/:id', validateObjectId('id'), folderController.getFolderById);

// POST /api/folders - 创建文件夹
router.post('/', validateFolder, folderController.createFolder);

// PUT /api/folders/:id - 更新文件夹
router.put('/:id', validateObjectId('id'), validateFolder, folderController.updateFolder);

// DELETE /api/folders/:id - 删除文件夹
router.delete('/:id', validateObjectId('id'), folderController.deleteFolder);


module.exports = router;