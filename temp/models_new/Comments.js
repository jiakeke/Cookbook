const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'recipe', // 关联菜谱
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user', // 发表评论的用户
    required: true,
  },
  content: {
    type: String,
    required: true, // 评论内容
  },
  images: [
    {
      type: String, // 评论配图（图片URL或路径）
    },
  ],
  rating: {
    type: Number,
    min: 1,
    max: 5, // 星级评分
  },
  likes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user', // 点赞的用户列表
    },
  ],
  likeCount: {
    type: Number,
    default: 0, // 点赞数量（方便快速读取）
  },
  reports: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user', // 举报人
      },
      reason: {
        type: String, // 举报原因（例如“侮辱性语言”、“虚假信息”等）
      },
      date: {
        type: Date,
        default: Date.now, // 举报时间
      },
    },
  ],
  approved: {
    type: Boolean,
    default: true, // 管理员是否允许显示
  },
  createdAt: {
    type: Date,
    default: Date.now, // 评论创建时间
  },
});

module.exports = mongoose.model('Comment', CommentSchema);
