const eventHandler = require('../helpers/processEvents');

module.exports = (req, res) => {
  const { body } = req;

  // Check the webhook event is from a Page subscription
  if (body.object === 'page') {
    // Iterate over each entry - there may be multiple if batched
    body.entry.forEach(entry => {
      entry.messaging.forEach(webhookEvent => {
        if (webhookEvent.message) {
          console.log('message event');
          let quickReply;

          if (webhookEvent.message.quick_reply) {
            quickReply = webhookEvent.message.quick_reply.payload;
          }

          eventHandler.handleMessage(webhookEvent.sender.id, webhookEvent.message.text, quickReply);
        } else if (webhookEvent.postback) {
          eventHandler.handlePostback(webhookEvent.sender.id, webhookEvent.postback.payload);
        }
      });
    });

    // Return a '200 OK' response to all events
    res.status(200).send('EVENT_RECEIVED');
  } else {
    console.log('not page');
    // Return a '404 Not Found' if event is not from a page subscription
    res.sendStatus(404);
  }
};
