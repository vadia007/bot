const functions = require('../helpers/functions');

module.exports = (req, res) => {
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Get the webhook event. entry.messaging is an array, but
            // will only ever contain one event, so we get index 0
            // console.log(entry.messaging);
            let webhook_event = entry.messaging[0];
            let sender_psid = webhook_event.sender.id;
            console.log(webhook_event);

            if (webhook_event.message) {
                console.log(webhook_event.message);

                functions.handleMessage(webhook_event.sender.id, webhook_event.message.text);
            } else if (webhook_event.postback) {
                console.log(webhook_event.postback)
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        console.log('not page')
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};