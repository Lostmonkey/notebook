const mongoose = require('mongoose');

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, '文件夹名称是必需的'],
    trim: true,
    minlength: [1, '文件夹名称至少需要1个字符'],
    maxlength: [50, '文件夹名称不能超过50个字符']
  },
  type: {
    type: String,
    enum: ['system', 'user'],
    required: [true, '文件夹类型是必需的'],
    default: 'user'
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的'],
    index: true
  },
}, {
  timestamps: true,
  collection: 'folders'
});

// 创建复合索引
folderSchema.index({ userId: 1, type: 1 });

// 虚拟字段：文件夹内的笔记
folderSchema.virtual('notes', {
  ref: 'Note',
  localField: '_id',
  foreignField: 'folderId'
});


// 确保用户文件夹名称唯一性
folderSchema.index(
  { userId: 1, name: 1 },
  { 
    unique: true,
    partialFilterExpression: { type: 'user' }
  }
);

// 删除文件夹前的中间件
folderSchema.pre('findOneAndDelete', async function() {
  const Note = mongoose.model('Note');
  const folder = await this.model.findOne(this.getQuery());
  
  if (folder) {
    // 删除文件夹下的所有笔记
    await Note.deleteMany({ folderId: folder._id });
  }
});

// 转换输出
folderSchema.methods.toJSON = function() {
  const folder = this.toObject();
  delete folder.__v;
  return folder;
};

module.exports = mongoose.model('Folder', folderSchema);