const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// ミドルウェア
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongo:27017/memoflow', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB に接続しました');
})
.catch((error) => {
  console.error('MongoDB 接続エラー:', error);
  process.exit(1);
});

// ルートの設定
app.use('/api/memos', require('./routes/memos'));

// ヘルスチェック
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'MemoFlow API'
  });
});

// ルートエンドポイント
app.get('/', (req, res) => {
  res.json({
    message: 'MemoFlow API Server',
    version: '1.0.0',
    endpoints: {
      memos: '/api/memos',
      health: '/health'
    }
  });
});

// 404ハンドラー
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'エンドポイントが見つかりません'
  });
});

// エラーハンドラー
app.use((error, req, res, next) => {
  console.error('Server Error:', error);
  res.status(500).json({
    success: false,
    message: 'サーバーエラーが発生しました',
    error: process.env.NODE_ENV === 'development' ? error.message : undefined
  });
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`MemoFlow API サーバーがポート ${PORT} で起動しました`);
});