FROM node:18-alpine

WORKDIR /app

# アプリケーションファイルをコピー
COPY . .

# 依存関係をインストール
RUN npm install

EXPOSE 8000

# 開発サーバー起動
CMD ["npm", "run", "dev"]