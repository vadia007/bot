const moment = require('moment');

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

function getDeleteConfirmationBtnResponse(reminderId, reminderRecord) {
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

module.exports = {
  defaultButtonsResponse,
  getReminderNotificationResponse,
  getDeleteConfirmationBtnResponse,
  getListResponse,
};
