const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const http = require('http');
const OpenApiValidator = require('express-openapi-validator');
const multer = require('multer');
const { port } = require('../config');
const logger = require('./logger');

const app = express();
const apiSpec = path.join(__dirname, '../config/openapi.yml');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.text());
app.use(bodyParser.json());

app.use('/spec', express.static(apiSpec));

app.use(
  OpenApiValidator.middleware({
    apiSpec,
    validateRequests: true,
    validateResponses: true,
    fileUploader: { storage: multer.memoryStorage() },
    operationHandlers: path.join(__dirname, '../api/controllers'),
  }),
);

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
  });
});

http.createServer(app).listen(port);
logger.info(`Listening on port ${port}`);

module.exports = app;
