const ApiResponse = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error('错误详情:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    body: req.body,
    params: req.params,
    query: req.query,
    user: req.user
  });

  // Mongoose验证错误
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message,
      value: e.value
    }));
    return ApiResponse.badRequest(res, '数据验证失败', errors);
  }

  // Mongoose重复键错误
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    const value = err.keyValue[field];
    return ApiResponse.conflict(res, `${field}: '${value}' 已存在`);
  }

  // Mongoose转换错误（无效的ObjectId等）
  if (err.name === 'CastError') {
    return ApiResponse.badRequest(res, `无效的${err.path}: ${err.value}`);
  }

  // JWT错误
  if (err.name === 'JsonWebTokenError') {
    return ApiResponse.unauthorized(res, '无效的认证令牌');
  }

  if (err.name === 'TokenExpiredError') {
    return ApiResponse.unauthorized(res, '认证令牌已过期');
  }

  // 默认服务器错误
  return ApiResponse.error(res, 
    process.env.NODE_ENV === 'production' ? '服务器内部错误' : err.message
  );
};

// 404错误处理
const notFoundHandler = (req, res) => {
  return ApiResponse.notFound(res, `路由 ${req.originalUrl} 不存在`);
};

module.exports = {
  errorHandler,
  notFoundHandler
};