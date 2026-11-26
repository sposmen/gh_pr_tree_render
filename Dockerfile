FROM node:26-bookworm

WORKDIR /app

COPY package.json package-lock.json ./

# Install deps for build layer (optional but speeds up)
RUN npm ci

COPY . .

RUN npm run build:prod && mkdir -p /data

ENV NODE_ENV=production
ENV SQLITE_PATH=/data/app.sqlite
EXPOSE 1337

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["node", "app.js"]
