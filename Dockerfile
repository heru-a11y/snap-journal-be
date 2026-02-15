FROM node:20-alpine

RUN apk add --no-cache \
    ffmpeg \
    x264-libs \
    libvpx \
    libwebp \
    libass \
    libvorbis \
    libvpx-dev \
    opus

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3001

CMD ["node", "src/main.js"]
