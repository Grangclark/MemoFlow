const express = require('express');
const router = express.Router();
const Memo = require('../models/Memo');

// メモ一覧取得
router.get('/', async (req, res) => {
  try {
    const { search, category, limit = 50, page = 1 } = req.query;
    let query = {};

    // 検索クエリがある場合
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // カテゴリフィルタ
    if (category && category !== 'all') {
      query.category = category;
    }

    const memos = await Memo.find(query)
      .sort({ isPinned: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));

    const total = await Memo.countDocuments(query);

    res.json({
      success: true,
      data: memos,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        count: memos.length,
        totalCount: total
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'メモの取得に失敗しました',
      error: error.message
    });
  }
});

// メモ詳細取得
router.get('/:id', async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);
    if (!memo) {
      return res.status(404).json({
        success: false,
        message: 'メモが見つかりません'
      });
    }
    res.json({
      success: true,
      data: memo
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'メモの取得に失敗しました',
      error: error.message
    });
  }
});

// メモ作成
router.post('/', async (req, res) => {
  try {
    const { title, content, category, tags, isPinned } = req.body;

    // バリデーション
    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: 'タイトルと内容は必須です'
      });
    }

    const memo = new Memo({
      title,
      content,
      category: category || 'general',
      tags: tags || [],
      isPinned: isPinned || false
    });

    const savedMemo = await memo.save();
    res.status(201).json({
      success: true,
      data: savedMemo,
      message: 'メモが作成されました'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'メモの作成に失敗しました',
      error: error.message
    });
  }
});

// メモ更新
router.put('/:id', async (req, res) => {
  try {
    const { title, content, category, tags, isPinned } = req.body;

    const memo = await Memo.findByIdAndUpdate(
      req.params.id,
      {
        title,
        content,
        category,
        tags,
        isPinned,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    );

    if (!memo) {
      return res.status(404).json({
        success: false,
        message: 'メモが見つかりません'
      });
    }

    res.json({
      success: true,
      data: memo,
      message: 'メモが更新されました'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'メモの更新に失敗しました',
      error: error.message
    });
  }
});

// メモ削除
router.delete('/:id', async (req, res) => {
  try {
    const memo = await Memo.findByIdAndDelete(req.params.id);
    if (!memo) {
      return res.status(404).json({
        success: false,
        message: 'メモが見つかりません'
      });
    }

    res.json({
      success: true,
      message: 'メモが削除されました'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'メモの削除に失敗しました',
      error: error.message
    });
  }
});

// ピン留め切り替え
router.patch('/:id/pin', async (req, res) => {
  try {
    const memo = await Memo.findById(req.params.id);
    if (!memo) {
      return res.status(404).json({
        success: false,
        message: 'メモが見つかりません'
      });
    }

    memo.isPinned = !memo.isPinned;
    memo.updatedAt = new Date();
    await memo.save();

    res.json({
      success: true,
      data: memo,
      message: memo.isPinned ? 'メモをピン留めしました' : 'ピン留めを解除しました'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'ピン留めの切り替えに失敗しました',
      error: error.message
    });
  }
});

// カテゴリ一覧取得
router.get('/categories/list', async (req, res) => {
  try {
    const categories = await Memo.distinct('category');
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'カテゴリの取得に失敗しました',
      error: error.message
    });
  }
});

module.exports = router;