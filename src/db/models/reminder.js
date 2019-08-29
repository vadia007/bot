const moment = require('moment');
const connection = require('../connection');

const tableName = 'reminders';

function generalQueryTemplate(query, args, resolve, reject) {
  connection.query(query, args, (error, results) => {
    if (error) {
      reject(error);
    } else {
      resolve(results);
    }
  });
}

function addReminder(name, userPsid, launchTime) {
  return new Promise((resolve, reject) => {
    const reminder = {
      userPsid,
      name,
      launchTime,
    };

    generalQueryTemplate(`INSERT INTO ${tableName} SET ?`, reminder, resolve, reject);
  });
}

function getReminderList(senderPsid) {
  return new Promise((resolve, reject) => {
    const values = [senderPsid, moment().unix(), 0];

    generalQueryTemplate(
      `SELECT * FROM ${tableName}
             WHERE userPsid = ? 
             AND launchTime > ? 
             AND isDeleted = ?
             ORDER BY launchTIme ASC`,
      values,
      resolve,
      reject,
    );
  });
}

function getReminder(id) {
  return new Promise((resolve, reject) => {
    connection.query(
      `SELECT * FROM ${tableName}
            WHERE id = ?
            LIMIT 1`,
      [id],
      (error, results) => {
        if (error) {
          reject(error);
        } else {
          const reminder = results.length ? results[0] : null;

          resolve(reminder);
        }
      },
    );
  });
}

function deleteReminder(id) {
  return new Promise((resolve, reject) => {
    generalQueryTemplate(
      `UPDATE ${tableName}
            SET isDeleted = 1
            WHERE id = ?`,
      [id],
      resolve,
      reject,
    );
  });
}

function getCurrentReminders() {
  return new Promise((resolve, reject) => {
    const startOfMinuteTimestamp = moment()
      .startOf('minute')
      .unix();
    const endOfMinuteTimestamp = startOfMinuteTimestamp + 59;

    generalQueryTemplate(
      `SELECT * FROM ${tableName} 
            WHERE isDeleted = 0
            AND launchTime BETWEEN ${startOfMinuteTimestamp} AND ${endOfMinuteTimestamp}`,
      [],
      resolve,
      reject,
    );
  });
}

function updateLaunchTime(id, launchTime) {
  return new Promise((resolve, reject) => {
    generalQueryTemplate(
      `UPDATE ${tableName}
            SET launchTime = ?
            WHERE id = ?
            AND isDeleted = ?`,
      [launchTime, id, 0],
      resolve,
      reject,
    );
  });
}

module.exports = {
  addReminder,
  getReminderList,
  getReminder,
  deleteReminder,
  getCurrentReminders,
  updateLaunchTime,
};
