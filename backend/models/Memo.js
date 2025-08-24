const mongoose = require('mongoose');

const memoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    maxLength: 100
  },
  content: {
    type: String,
    required: true,
    maxLength: 10000
  },
  category: {
    type: String,
    default: 'general',
    trim: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// 更新時に updatedAt を自動更新
memoSchema.pre('save', function(next) {
  if (this.isModified() && !this.isNew) {
    this.updatedAt = Date.now();
  }
  next();
});

// 検索用のインデックス
memoSchema.index({ title: 'text', content: 'text' });
memoSchema.index({ createdAt: -1 });
memoSchema.index({ isPinned: -1, createdAt: -1 });

module.exports = mongoose.model('Memo', memoSchema);