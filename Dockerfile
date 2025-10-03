# Stage 1: Build the front-end assets with Webpack
FROM node:lts-alpine AS build-stage
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . ./
RUN yarn build

# Stage 2: Serve the Sails application
FROM node:lts-alpine AS final-stage
WORKDIR /app
# Only copy production dependencies
COPY package.json yarn.lock ./
RUN yarn install --production
# Copy the built assets from the build stage
COPY --from=build-stage /app/.tmp/public ./.tmp/public
# Copy the rest of the application files
COPY . ./
# Expose the Sails port
EXPOSE 1337
# Command to start the Sails server
CMD ["node", "app.js"]
