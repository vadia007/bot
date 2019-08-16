const request = require('request');
const moment = require('moment');
const reminder = require('./reminder');

function callSendAPI(senderPsid, requestBody) {
  const { PAGE_ACCESS_TOKEN } = process.env;

  requestBody.recipient = {
    id: senderPsid,
  };

  // Send the HTTP request to the Messenger Platform
  request(
    {
      uri: 'https://graph.facebook.com/v2.6/me/messages',
      qs: { access_token: PAGE_ACCESS_TOKEN },
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

function defaultButtonsResponse(title) {
  return {
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title,
              subtitle: 'Available actions are.',
              buttons: [
                {
                  type: 'postback',
                  title: 'Add reminder',
                  payload: 'addReminder',
                },
                {
                  type: 'postback',
                  title: 'Reminder list',
                  payload: 'reminderList',
                },
                {
                  type: 'postback',
                  title: 'Delete reminder',
                  payload: 'deleteReminder',
                },
              ],
            },
          ],
        },
      },
    },
  };
}

function send(senderPsid, text, withDefaultButtons) {
  let response;

  if (withDefaultButtons) {
    response = defaultButtonsResponse(text);
  } else {
    response = {
      message: {
        text,
      },
    };
  }

  callSendAPI(senderPsid, response);
}

function getListResponse(reminders, withDeleteBtn) {
  const elements = [];

  reminders.forEach(reminderRecord => {
    const element = {
      title: reminderRecord.name,
      subtitle: moment.unix(reminderRecord.launchTime).format('DD MMM HH:mm'),
    };

    if (withDeleteBtn) {
      element.buttons = [
        {
          type: 'postback',
          title: 'Delete',
          payload: `deleteReminder_${reminderRecord.id}`,
        },
      ];
    }

    elements.push(element);
  });

  return {
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements,
        },
      },
    },
  };
}

function sendList(senderPsid, reminders, withDeleteBtn) {
  const response = getListResponse(reminders, withDeleteBtn);

  callSendAPI(senderPsid, response);
}

async function getDeleteConfirmationBtnResponse(reminderId) {
  const reminderRecord = await reminder.getReminder(reminderId);

  return {
    messaging_type: 'RESPONSE',
    message: {
      text: `Are you sure you want to delete ${reminderRecord.name}?`,
      quick_replies: [
        {
          content_type: 'text',
          title: 'Delete',
          payload: `confirmDeleteReminder_${reminderRecord.id}`,
        },
        {
          content_type: 'text',
          title: 'Cancel',
          payload: 'cancelDelete',
        },
      ],
    },
  };
}

async function sendDeleteConfirmationBtn(senderPsid, reminderId) {
  const response = await getDeleteConfirmationBtnResponse(reminderId);

  callSendAPI(senderPsid, response);
}

async function deleteReminder(reminderId) {
  return {
    reminderRecord: await reminder.getReminder(reminderId),
    isDeleted: await reminder.deleteReminder(reminderId),
  };
}

function getReminderNotificationResponse(reminderRecord) {
  return {
    message: {
      attachment: {
        type: 'template',
        payload: {
          template_type: 'generic',
          elements: [
            {
              title: `${reminderRecord.name} reminder`,
              buttons: [
                {
                  type: 'postback',
                  title: 'Accept',
                  payload: `accept_${reminderRecord.id}`,
                },
                {
                  type: 'postback',
                  title: 'Snooze',
                  payload: `snooze_${reminderRecord.id}`,
                },
              ],
            },
          ],
        },
      },
    },
  };
}

function sendReminderNotification(reminderRecord) {
  const response = getReminderNotificationResponse(reminderRecord);

  callSendAPI(reminderRecord.userPsid, response);
}

async function sendReminders() {
  const reminders = await reminder.getCurrentReminders();

  if (reminders.length) {
    reminders.forEach(reminderRecord => {
      sendReminderNotification(reminderRecord);
    });
  }
}

async function snoozeReminder(id) {
  try {
    let responseText;
    const snoozeMinutesCount = 2;
    const newLaunchTime = moment()
      .add(snoozeMinutesCount, 'minutes')
      .unix();
    const result = await reminder.updateLaunchTime(id, newLaunchTime);
    const reminderRecord = await reminder.getReminder(id);

    if (result) {
      responseText = `${reminderRecord.name} was snoozed for ${snoozeMinutesCount} minutes`;
    } else {
      responseText = `You can't snooze ${reminderRecord.name} reminder. It is already deleted.`;
    }

    send(reminderRecord.userPsid, responseText);
  } catch (e) {
    console.error(e.message);
  }
}

module.exports = {
  send,
  sendList,
  sendDeleteConfirmationBtn,
  deleteReminder,
  sendReminders,
  snoozeReminder,
};
