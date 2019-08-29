const dialogflow = require('dialogflow');

const { dialogFlow: dialogFlowConfig } = require('../../config');

function getIntent(message, senderPsid) {
  const config = {
    credentials: {
      private_key: dialogFlowConfig.privateKey,
      client_email: dialogFlowConfig.clientEmail,
    },
  };
  const sessionId = senderPsid;
  const sessionClient = new dialogflow.SessionsClient(config);
  const sessionPath = sessionClient.sessionPath(dialogFlowConfig.projectId, sessionId);
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
