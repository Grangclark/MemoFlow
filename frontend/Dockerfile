FROM node:18-alpine

WORKDIR /app

# package.jsonをコピーして依存関係をインストール
COPY package*.json ./
RUN npm install

# Next.jsの最小構成を作成
RUN mkdir -p app
RUN echo 'export default function Home() { return <div><h1>MemoFlow</h1><p>Frontend is running!</p></div>; }' > app/page.js
RUN echo '{"name":"MemoFlow-frontend","version":"0.1.0","private":true,"scripts":{"dev":"next dev","build":"next build","start":"next start"},"dependencies":{"react":"^18","react-dom":"^18","next":"14.2.5"}}' > package.json

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]