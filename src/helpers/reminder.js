const moment = require('moment-timezone');

const fb = require('./fb');
const reminderModel = require('../db/models/reminder');

const timeZone = 'Europe/Kiev';

function addReminder(senderPsid, data) {
  let reminderTimeMoment = moment.parseZone(data.parameters.fields.time.stringValue);
  const reminderDay = data.parameters.fields.date
    ? data.parameters.fields.date.stringValue.split('T')[0]
    : null;
  const reminderName = data.parameters.fields.name.stringValue;
  const currentTimestamp = moment().unix();
  const currentDay = moment()
    .tz(timeZone)
    .format('YYYY-MM-DD');

  if (reminderDay) {
    if (reminderDay > currentDay) {
      reminderTimeMoment = moment(`${reminderDay} ${reminderTimeMoment.format('HH:mm;SS Z')}`);
    } else if (reminderDay < currentDay) {
      const responseText = 'The day couldn`t be less than today';

      fb.send(senderPsid, responseText, true);

      return;
    }
    // set reminder for tomorrow if time is less then current time
  } else if (reminderTimeMoment.unix() < currentTimestamp) {
    reminderTimeMoment = reminderTimeMoment.add(1, 'day');
  }

  const reminderTimestamp = reminderTimeMoment.unix();

  reminderModel
    .addReminder(reminderName, senderPsid, reminderTimestamp)
    .then(() => {
      const responseText = `${reminderName} was added successfully added at ${reminderTimeMoment.format(
        'DD MMM HH:mm',
      )}`;

      fb.send(senderPsid, responseText);
    })
    .catch(error => {
      console.error(error);

      const responseText = 'Sorry, can`t add reminder at this moment';

      fb.send(senderPsid, responseText);
    });
}

function reminderList(senderPsid, withDeleteBtn) {
  reminderModel.getReminderList(senderPsid, withDeleteBtn).then(reminders => {
    if (!reminders.length) {
      const responseText = 'There are no reminders';

      fb.send(senderPsid, responseText);
    } else {
      fb.sendList(senderPsid, reminders, withDeleteBtn);
    }
  });
}

async function deleteReminder(reminderId) {
  try {
    return {
      reminderRecord: await reminderModel.getReminder(reminderId),
      isDeleted: (await reminderModel.deleteReminder(reminderId)).changedRows,
    };
  } catch (error) {
    console.error(error);
    return false;
  }
}

async function snoozeReminder(id) {
  try {
    let responseText;
    const snoozeMinutesCount = 2;
    const newLaunchTime = moment()
      .add(snoozeMinutesCount, 'minutes')
      .unix();
    const result = await reminderModel.updateLaunchTime(id, newLaunchTime);
    const reminderRecord = await reminderModel.getReminder(id);

    if (result.changedRows) {
      responseText = `${reminderRecord.name} was snoozed for ${snoozeMinutesCount} minutes`;
    } else {
      responseText = `You can't snooze ${reminderRecord.name} reminder. It is already deleted.`;
    }

    fb.send(reminderRecord.userPsid, responseText);
  } catch (e) {
    console.error(e.message);
  }
}

async function sendReminders() {
  try {
    const reminders = await reminderModel.getCurrentReminders();

    if (reminders.length) {
      reminders.forEach(reminderRecord => {
        fb.sendReminderNotification(reminderRecord);
      });
    }
  } catch (error) {
    console.error(error);
    return false;
  }
  return true;
}

module.exports = {
  addReminder,
  reminderList,
  deleteReminder,
  snoozeReminder,
  sendReminders,
};
