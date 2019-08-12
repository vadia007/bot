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

function getReminder(id) {
    return new Promise(function (resolve, reject) {
        connection.query(
            `SELECT * FROM ${tableName}
            WHERE id = ?
            LIMIT 1`, [id], function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    const  reminder = results.length ? results[0] : null;

                    resolve(reminder);
                }
            }
        )
    })
}

function deleteReminder(id) {
    return new Promise(function (resolve, reject) {
        connection.query(
            `UPDATE ${tableName}
            SET isDeleted = 1
            WHERE id = ?`, [id], function (error, results, fields) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.changedRows);
                }
            }
        )
    })
}

module.exports = {
    addReminder: addReminder,
    getReminderList: getReminderList,
    getReminder: getReminder,
    deleteReminder: deleteReminder
};