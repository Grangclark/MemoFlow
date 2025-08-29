'use client';
console.log('=== ページファイルが実行されました ==='); // この行を追加

import { useState, useEffect } from 'react';

export default function Home() {
  const [memos, setMemos] = useState([]);
  const [filteredMemos, setFilteredMemos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [categories, setCategories] = useState(['general']);
  const [showEditor, setShowEditor] = useState(false);
  const [editingMemo, setEditingMemo] = useState(null);
  const [loading, setLoading] = useState(true);

  // エディタ用の状態
  const [editorTitle, setEditorTitle] = useState('');
  const [editorContent, setEditorContent] = useState('');
  const [editorCategory, setEditorCategory] = useState('general');
  const [editorTags, setEditorTags] = useState('');
  const [editorIsPinned, setEditorIsPinned] = useState(false);

  // API呼び出し関数
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  // メモ一覧取得
  const fetchMemos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/memos`);
      const data = await response.json();
      
      if (data.success) {
        setMemos(data.data);
        setFilteredMemos(data.data);
      } else {
        console.error('メモの取得に失敗:', data.message);
      }
    } catch (error) {
      console.error('API通信エラー:', error);
    } finally {
      setLoading(false);
    }
  };

  // カテゴリ一覧取得
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/memos/categories/list`);
      const data = await response.json();
      
      if (data.success) {
        setCategories(['all', ...data.data]);
      }
    } catch (error) {
      console.error('カテゴリの取得に失敗:', error);
    }
  };

  // メモ作成
  const createMemo = async () => {
    try {
      const response = await fetch(`${API_BASE}/memos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editorTitle,
          content: editorContent,
          category: editorCategory,
          tags: editorTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          isPinned: editorIsPinned
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMemos();
        resetEditor();
        setShowEditor(false);
      } else {
        alert('メモの作成に失敗しました: ' + data.message);
      }
    } catch (error) {
      console.error('メモ作成エラー:', error);
      alert('メモの作成中にエラーが発生しました');
    }
  };

  // メモ更新
  const updateMemo = async () => {
    try {
      const response = await fetch(`${API_BASE}/memos/${editingMemo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editorTitle,
          content: editorContent,
          category: editorCategory,
          tags: editorTags.split(',').map(tag => tag.trim()).filter(tag => tag),
          isPinned: editorIsPinned
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMemos();
        resetEditor();
        setShowEditor(false);
      } else {
        alert('メモの更新に失敗しました: ' + data.message);
      }
    } catch (error) {
      console.error('メモ更新エラー:', error);
      alert('メモの更新中にエラーが発生しました');
    }
  };

  // メモ削除
  const deleteMemo = async (id) => {
    if (!confirm('このメモを削除してもよろしいですか？')) return;

    try {
      const response = await fetch(`${API_BASE}/memos/${id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMemos();
      } else {
        alert('メモの削除に失敗しました: ' + data.message);
      }
    } catch (error) {
      console.error('メモ削除エラー:', error);
      alert('メモの削除中にエラーが発生しました');
    }
  };

  // ピン留め切り替え
  const togglePin = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/memos/${id}/pin`, {
        method: 'PATCH',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchMemos();
      } else {
        alert('ピン留めの切り替えに失敗しました: ' + data.message);
      }
    } catch (error) {
      console.error('ピン留め切り替えエラー:', error);
    }
  };

  // エディタのリセット
  const resetEditor = () => {
    setEditorTitle('');
    setEditorContent('');
    setEditorCategory('general');
    setEditorTags('');
    setEditorIsPinned(false);
    setEditingMemo(null);
  };

  // メモ編集開始
  const startEdit = (memo) => {
    setEditingMemo(memo);
    setEditorTitle(memo.title);
    setEditorContent(memo.content);
    setEditorCategory(memo.category);
    setEditorTags(memo.tags.join(', '));
    setEditorIsPinned(memo.isPinned);
    setShowEditor(true);
  };

  // 新規メモ作成開始
  const startCreate = () => {
    resetEditor();
    setShowEditor(true);
  };

  // エディタ保存
  const handleSave = () => {
    if (!editorTitle.trim() || !editorContent.trim()) {
      alert('タイトルと内容を入力してください');
      return;
    }

    if (editingMemo) {
      updateMemo();
    } else {
      createMemo();
    }
  };

  // 検索・フィルタリング
  useEffect(() => {
    let filtered = [...memos];

    // カテゴリフィルタ
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(memo => memo.category === selectedCategory);
    }

    // 検索フィルタ
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(memo => 
        memo.title.toLowerCase().includes(term) || 
        memo.content.toLowerCase().includes(term) ||
        memo.tags.some(tag => tag.toLowerCase().includes(term))
      );
    }

    setFilteredMemos(filtered);
  }, [memos, searchTerm, selectedCategory]);

  // 初期データ取得
  useEffect(() => {
    fetchMemos();
    fetchCategories();
  }, []);

  // 日付フォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* テスト用 - この赤い箱が画面幅いっぱいなら他に原因がある */}
      <div className="max-w-4xl mx-auto bg-red-500 h-20 mb-4"></div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* ヘッダー */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full mb-4 shadow-lg">
            <span className="text-2xl">📝</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-2">MemoFlow TEST</h1>
          <p className="text-gray-600">あなたの思考を整理する、美しいメモアプリ</p>
        </div>

        {/* 検索・フィルタ・作成ボタン */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-6 border border-white/20">
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              {/* 検索バー */}
              <div className="flex-1 w-full">
                <input
                  type="text"
                  placeholder="メモを検索..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                />
              </div>

              {/* カテゴリフィルタ */}
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-32"
              >
                <option value="all">すべて</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>

              {/* 新規作成ボタン */}
              <button
                onClick={startCreate}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl font-medium"
              >
                + 新規メモ
              </button>
            </div>
          </div>
        </div>

        {/* メモ一覧 - max-w-6xlからmax-w-4xlに変更 */}
        <div className="max-w-xl mx-auto">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">読み込み中...</p>
            </div>
          ) : filteredMemos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredMemos.map((memo) => (
                <div
                  key={memo._id}
                  className={`group bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/30 overflow-hidden ${
                    memo.isPinned ? 'ring-2 ring-yellow-400' : ''
                  }`}
                >
                  {/* メモヘッダー */}
                  <div className="p-6 pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-bold text-gray-800 flex-1 line-clamp-2">
                        {memo.title}
                      </h3>
                      <div className="flex gap-1 ml-3">
                        {memo.isPinned && (
                          <span className="text-yellow-500 text-lg">📌</span>
                        )}
                        <button
                          onClick={() => togglePin(memo._id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-yellow-500 transition-all p-1"
                          title={memo.isPinned ? 'ピン留め解除' : 'ピン留め'}
                        >
                          📌
                        </button>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 line-clamp-3 mb-4 min-h-18">
                      {memo.content}
                    </p>

                    {/* タグ */}
                    {memo.tags && memo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {memo.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* メタ情報 */}
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                      <span className="bg-gray-100 px-2 py-1 rounded-full">
                        {memo.category}
                      </span>
                      <span>{formatDate(memo.updatedAt)}</span>
                    </div>

                    {/* アクションボタン */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => startEdit(memo)}
                        className="flex-1 py-2 px-4 bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors rounded-lg font-medium"
                      >
                        編集
                      </button>
                      <button
                        onClick={() => deleteMemo(memo._id)}
                        className="flex-1 py-2 px-4 bg-red-100 text-red-700 hover:bg-red-200 transition-colors rounded-lg font-medium"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <p className="text-gray-500 text-lg">
                {searchTerm || selectedCategory !== 'all' 
                  ? '条件に一致するメモが見つかりません' 
                  : 'まだメモがありません。最初のメモを作成しましょう！'
                }
              </p>
            </div>
          )}
        </div>
      </div>

      {/* メモエディタモーダル */}
      {showEditor && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">
                {editingMemo ? 'メモを編集' : '新規メモ作成'}
              </h2>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="space-y-4">
                {/* タイトル */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    タイトル *
                  </label>
                  <input
                    type="text"
                    value={editorTitle}
                    onChange={(e) => setEditorTitle(e.target.value)}
                    placeholder="メモのタイトルを入力..."
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* 内容 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    内容 *
                  </label>
                  <textarea
                    value={editorContent}
                    onChange={(e) => setEditorContent(e.target.value)}
                    placeholder="メモの内容を入力..."
                    rows={10}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* カテゴリ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      カテゴリ
                    </label>
                    <input
                      type="text"
                      value={editorCategory}
                      onChange={(e) => setEditorCategory(e.target.value)}
                      placeholder="general"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* タグ */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      タグ (カンマ区切り)
                    </label>
                    <input
                      type="text"
                      value={editorTags}
                      onChange={(e) => setEditorTags(e.target.value)}
                      placeholder="仕事, プライベート, アイデア"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                {/* ピン留め */}
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    id="isPinned"
                    checked={editorIsPinned}
                    onChange={(e) => setEditorIsPinned(e.target.checked)}
                    className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="isPinned" className="text-sm font-medium text-gray-700">
                    このメモをピン留めする
                  </label>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-200 flex gap-4">
              <button
                onClick={() => setShowEditor(false)}
                className="flex-1 py-3 px-6 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                キャンセル
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium"
              >
                {editingMemo ? '更新' : '作成'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}