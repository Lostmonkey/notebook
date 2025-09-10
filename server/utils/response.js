class ApiResponse {
  static success(res, data = null, message = '操作成功', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data
    });
  }

  static error(res, message = '操作失败', statusCode = 500, errors = null) {
    return res.status(statusCode).json({
      success: false,
      message,
      errors
    });
  }

  static badRequest(res, message = '请求参数错误', errors = null) {
    return this.error(res, message, 400, errors);
  }

  static unauthorized(res, message = '未授权访问') {
    return this.error(res, message, 401);
  }

  static forbidden(res, message = '禁止访问') {
    return this.error(res, message, 403);
  }

  static notFound(res, message = '资源不存在') {
    return this.error(res, message, 404);
  }

  static conflict(res, message = '资源冲突') {
    return this.error(res, message, 409);
  }

  static validationError(res, errors) {
    return this.error(res, '数据验证失败', 400, errors);
  }
}

module.exports = ApiResponse;