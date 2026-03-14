FROM node:20-alpine

RUN apk add --no-cache \
    ffmpeg \
    ca-certificates \
    x264-libs

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "src/main.js"]