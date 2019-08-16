const dialogflow = require('dialogflow');

function getIntent(message, senderPsid) {
  const config = {
    credentials: {
      private_key: JSON.parse(`"${process.env.DIALOGFLOW_PRIVATE_KEY}"`),
      client_email: process.env.DIALOGFLOW_CLIENT_EMAIL,
    },
  };
  const projectId = process.env.PROJECT_ID;
  const sessionId = senderPsid;
  const sessionClient = new dialogflow.SessionsClient(config);
  const sessionPath = sessionClient.sessionPath(projectId, sessionId);
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text: message,
        languageCode: 'en-US',
      },
    },
  };

  return sessionClient.detectIntent(request);
}

module.exports = {
  getIntent,
};
