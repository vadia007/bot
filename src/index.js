require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const verificationController = require('../controllers/verification');
const messageController = require('../controllers/message');
require('../cron-jobs/index')();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(5000, () => console.log('Express server is listening on port 5000'));

app.get('/webhook', verificationController);
app.post('/webhook', messageController);
