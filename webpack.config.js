const merge = require('webpack-merge').merge;
const baseConfig = require('./config/webpack/base.config');

const envConfig = require(`./config/webpack/${process.NODE_ENV || 'development'}.config`);

module.exports = merge(baseConfig, envConfig);
