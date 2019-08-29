const express = require('express');
const bodyParser = require('body-parser');

const verificationController = require('./controllers/verification');
const messageController = require('./controllers/message');
const cronJobs = require('./cron-jobs');
const { port } = require('../config');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.get('/webhook', verificationController);
app.post('/webhook', messageController);

cronJobs();

app.listen(port, () => console.log(`Express server is listening on port ${port}`));
