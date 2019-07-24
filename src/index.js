'use strict';

require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const request = require('request');


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.listen(5000, () => console.log('Express server is listening on port 5000 new'));

app.get('/', (req, res) => res.send('Hello World!'));

app.get('/webhook', (req, res) => {
    const VERIFY_TOKEN = process.env.VERIFY_TOKEN;
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    if (mode && token) {
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            res.status(200).send(challenge);

        } else {
            res.sendStatus(403);
        }
    }
});

app.post('/webhook', (req, res) => {
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Get the webhook event. entry.messaging is an array, but
            // will only ever contain one event, so we get index 0
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;
            console.log(webhook_event);

            if (webhook_event.message) {
                console.log(webhook_event.message);

                handleMessage(webhook_event.sender.id, webhook_event.message.text);
            } else if (webhook_event.postback) {
                console.log(webhook_event.postback)
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }

});

function handleMessage(sender_psid, received_message) {
    let response;

    // Check if the message contains text
    if (received_message) {

        // Create the payload for a basic text message
        response = {
            "text": `You sent the message: "${received_message}". Now send me an image!`
        }
    }

    // Sends the response message
    callSendAPI(sender_psid, response);
}

function callSendAPI(sender_psid, response) {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        } else {
            console.log('message sent!')
        }
    });
}