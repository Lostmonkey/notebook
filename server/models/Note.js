const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, '笔记标题是必需的'],
    trim: true,
    minlength: [1, '标题至少需要1个字符'],
    maxlength: [200, '标题不能超过200个字符']
  },
  content: {
    type: mongoose.Schema.Types.Mixed,
    default: {
      type: 'doc',
      content: []
    }
  },
  folderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Folder',
    required: [true, '文件夹ID是必需的'],
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, '用户ID是必需的'],
    index: true
  },
  order: {
    type: Number,
    required: true,
    default: 0
  }
}, {
  timestamps: true,
  collection: 'notes'
});

// 创建复合索引
noteSchema.index({ userId: 1, folderId: 1 });
noteSchema.index({ folderId: 1, order: 1 });
noteSchema.index({ userId: 1, updatedAt: -1 }); // 用于获取用户最近的笔记

// 确保文件夹内笔记标题唯一性
noteSchema.index(
  { folderId: 1, title: 1 },
  { unique: true }
);

// 转换输出
noteSchema.methods.toJSON = function() {
  const note = this.toObject();
  delete note.__v;
  return note;
};

// 静态方法：获取用户的最近笔记
noteSchema.statics.getRecentNotes = function(userId, limit = 10) {
  return this.find({ userId })
    .populate('folderId', 'name')
    .sort({ updatedAt: -1 })
    .limit(limit)
    .select('title folderId updatedAt');
};

module.exports = mongoose.model('Note', noteSchema);