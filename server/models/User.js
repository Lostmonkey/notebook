const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, '用户名是必需的'],
    unique: true,
    trim: true,
    minlength: [2, '用户名至少需要2个字符'],
    maxlength: [30, '用户名不能超过30个字符'],
    match: [/^[a-zA-Z0-9_\u4e00-\u9fa5]+$/, '用户名只能包含字母、数字、下划线和中文字符']
  }
}, {
  timestamps: true,
  collection: 'users'
});

// 虚拟字段：用户的文件夹
userSchema.virtual('folders', {
  ref: 'Folder',
  localField: '_id',
  foreignField: 'userId'
});

// 虚拟字段：用户的笔记
userSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'userId'
});

// 转换输出时删除敏感字段
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.__v;
  return user;
};

module.exports = mongoose.model('User', userSchema);