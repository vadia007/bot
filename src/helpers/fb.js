const request = require('request');
const reminderModel = require('../db/models/reminder');
const templates = require('./fb-templates');
const {
  facebook: { pageAccessToken },
} = require('../../config');

function callSendAPI(senderPsid, requestBody) {
  requestBody.recipient = {
    id: senderPsid,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: pageAccessToken },
      method: 'POST',
      json: requestBody,
    },
    err => {
      if (err) {
        console.error(`Unable to send message:${err}`);
      } else {
        console.log('message sent!');
        // console.log(res);
      }
    },
  );
}

function send(senderPsid, text, withDefaultButtons) {
  let response;

  if (withDefaultButtons) {
    response = templates.defaultButtonsResponse(text);
  } else {
    response = {
      message: {
        text,
      },
    };
  }

  callSendAPI(senderPsid, response);
}

function sendList(senderPsid, reminders, withDeleteBtn) {
  const response = templates.getListResponse(reminders, withDeleteBtn);

  callSendAPI(senderPsid, response);
}

async function sendDeleteConfirmationBtn(senderPsid, reminderId) {
  try {
    const reminderRecord = await reminderModel.getReminder(reminderId);
    const response = templates.getDeleteConfirmationBtnResponse(reminderId, reminderRecord);

    callSendAPI(senderPsid, response);
  } catch (error) {
    console.error(error);
  }
}

function sendReminderNotification(reminderRecord) {
  const response = templates.getReminderNotificationResponse(reminderRecord);

  callSendAPI(reminderRecord.userPsid, response);
}

module.exports = {
  send,
  sendList,
  sendDeleteConfirmationBtn,
  sendReminderNotification,
};
