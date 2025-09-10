const { body, param, query, validationResult } = require('express-validator');
const ApiResponse = require('../utils/response');

// 验证结果处理中间件
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(error => ({
      field: error.path,
      message: error.msg,
      value: error.value
    }));
    
    return ApiResponse.validationError(res, formattedErrors);
  }
  next();
};

// 用户验证规则
const validateUser = [
  body('username')
    .trim()
    .isLength({ min: 2, max: 30 })
    .withMessage('用户名长度必须在2-30个字符之间')
    .matches(/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/)
    .withMessage('用户名只能包含字母、数字、下划线和中文字符'),
  handleValidationErrors
];

// 文件夹验证规则
const validateFolder = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('文件夹名称长度必须在1-50个字符之间')
    .notEmpty()
    .withMessage('文件夹名称不能为空'),
  handleValidationErrors
];

// 笔记验证规则
const validateNote = [
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('笔记标题长度必须在1-200个字符之间')
    .notEmpty()
    .withMessage('笔记标题不能为空'),
  
  body('content')
    .optional()
    .isObject()
    .withMessage('笔记内容必须是有效的JSON对象'),
  
  handleValidationErrors
];

// ID参数验证
const validateObjectId = (paramName = 'id') => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName}必须是有效的MongoDB ObjectId`),
  handleValidationErrors
];

// 分页参数验证
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('页码必须是大于0的整数'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('每页数量必须是1-100之间的整数'),
  
  handleValidationErrors
];

module.exports = {
  validateUser,
  validateFolder,
  validateNote,
  validateObjectId,
  validatePagination,
  handleValidationErrors
};