const reminder = require('./reminder');
const nlu = require('./nlu');
const fb = require('./fb');

function handleMessage(senderPsid, receivedMessage, quickReply) {
  // Check if it's quick reply
  if (quickReply) {
    switch (true) {
      case quickReply.indexOf('confirmDeleteReminder_') !== -1: {
        const reminderId = quickReply.split('_')[1];

        reminder
          .deleteReminder(reminderId)
          .then(result => {
            let responseText;

            if (result.isDeleted) {
              responseText = `${result.reminderRecord.name} was successfully deleted.`;
            } else {
              responseText = `Sorry, can't delete ${result.reminderRecord.name} reminder.`;
            }

            fb.send(senderPsid, responseText);
          })
          .catch(error => {
            console.error(error);
          });
        break;
      }
      default:
        console.log(`${quickReply} quick reply  wasn't processed`);
    }

    // Check if the message contains text
  } else if (receivedMessage) {
    nlu
      .getIntent(receivedMessage, senderPsid)
      .then(response => {
        const data = response[0].queryResult;

        if (data.action) {
          if (!data.allRequiredParamsPresent) {
            fb.send(senderPsid, data.fulfillmentText);
          } else {
            switch (data.action) {
              case 'input.welcome':
              case 'input.unknown':
              case 'input.start':
                fb.send(senderPsid, data.fulfillmentText, true);
                break;
              case 'input.addRemainder':
                reminder.addReminder(senderPsid, data);
                break;
              case 'input.list':
                reminder.reminderList(senderPsid);
                break;
              case 'input.delete':
                reminder.reminderList(senderPsid, true);
                break;
              default:
                console.log(`${data.action} action  wasn't processed`);
            }
          }
        }
      })
      .catch(err => {
        console.error('ERROR:', err);
      });
  } else {
    const responseText = 'Your message should contain text';

    fb.send(senderPsid, responseText, true);
  }
}

function handlePostback(senderPsid, type) {
  let defaultText;
  let reminderId;

  switch (true) {
    case type === 'addReminder':
      defaultText = 'Add reminder';
      handleMessage(senderPsid, defaultText);
      break;
    case type === 'reminderList':
      defaultText = 'list';
      handleMessage(senderPsid, defaultText);
      break;
    case type === 'deleteReminder':
    case type === 'cancelDelete':
      defaultText = 'delete';
      handleMessage(senderPsid, defaultText);
      break;
    case type.indexOf('deleteReminder_') !== -1:
      [, reminderId] = type.split('_');

      fb.sendDeleteConfirmationBtn(senderPsid, reminderId).catch(error => {
        console.error(error);
      });
      break;
    case type.indexOf('accept_') !== -1:
      [, reminderId] = type.split('_');

      reminder.deleteReminder(reminderId).catch(error => {
        console.error(error);
      });
      break;
    case type.indexOf('snooze_') !== -1:
      [, reminderId] = type.split('_');

      fb.snoozeReminder(reminderId).catch(error => {
        console.error(error);
      });
      break;
    default:
      console.log('default');
  }
}

module.exports = {
  handleMessage,
  handlePostback,
};
