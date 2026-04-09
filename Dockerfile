FROM node:20

WORKDIR /app

COPY package.json yarn.lock ./

# Install deps for build layer (optional but speeds up)
RUN yarn install

COPY . .

COPY docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]

CMD ["yarn", "start"]
