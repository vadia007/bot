const functions = require('../helpers/functions');

module.exports = (req, res) => {
    const { body } = req;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {
        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(entry => {
            // Get the webhook event. entry.messaging is an array, but
            // will only ever contain one event, so we get index 0
            // console.log(entry.messaging);
            const webhookEvent = entry.messaging[0];
            // let sender_psid = webhook_event.sender.id;

            if (webhookEvent.message) {
                console.log('message event');
                let quickReply;

                if (webhookEvent.message.quick_reply) {
                    quickReply = webhookEvent.message.quick_reply.payload;
                }

                functions.handleMessage(
                    webhookEvent.sender.id,
                    webhookEvent.message.text,
                    quickReply,
                );
            } else if (webhookEvent.postback) {
                functions.handlePostback(webhookEvent.sender.id, webhookEvent.postback.payload);
            }
        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');
    } else {
        console.log('not page');
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};
