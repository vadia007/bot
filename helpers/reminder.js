const connection = require('./connection');
const tableName = 'reminders';
const moment = require('moment');

function addReminder(name, userPsid, launchTime) {
    return new Promise((resolve, reject) => {
        const reminder = {
            userPsid: userPsid,
            name: name,
            launchTime
        };

        connection.query(`INSERT INTO ${tableName} SET ?`, reminder, function (error, results, fields) {
            if (error) {
                reject(error);
            }

            resolve();
        });
    });
}

function getReminderList(senderPsid) {
    return new Promise(function (resolve, reject) {
        const values = [
            senderPsid,
            moment().unix(),
            0
        ];

        connection.query(
            `SELECT * FROM ${tableName}
             WHERE userPsid = ? 
             AND launchTime > ? 
             AND isDeleted = ?
             ORDER BY launchTIme ASC`, values, function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            });
    })
}

module.exports = {
    addReminder: addReminder,
    getReminderList: getReminderList
};