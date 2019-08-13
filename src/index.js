'use strict';

require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const verificationController = require('../controllers/verification');
const messageController = require('../controllers/message');
require('../cron-jobs/index')();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(5000, () => console.log('Express server is listening on port 5000'));

app.get('/webhook', verificationController);
app.post('/webhook', messageController);

process.on('unhandledRejection', (reason, p) => {
    console.log('Unhandled Rejection at: Promise', p, 'reason:', reason);
    // application specific logging, throwing an error, or other logic here
});