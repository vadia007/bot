const moment = require('moment');
const connection = require('./connection');

const tableName = 'reminders';

function addReminder(name, userPsid, launchTime) {
    return new Promise((resolve, reject) => {
        const reminder = {
            userPsid,
            name,
            launchTime,
        };

        connection.query(`INSERT INTO ${tableName} SET ?`, reminder, error => {
            if (error) {
                reject(error);
            }

            resolve();
        });
    });
}

function getReminderList(senderPsid) {
    return new Promise((resolve, reject) => {
        const values = [senderPsid, moment().unix(), 0];

        connection.query(
            `SELECT * FROM ${tableName}
             WHERE userPsid = ? 
             AND launchTime > ? 
             AND isDeleted = ?
             ORDER BY launchTIme ASC`,
            values,
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            },
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
        connection.query(
            `UPDATE ${tableName}
            SET isDeleted = 1
            WHERE id = ?`,
            [id],
            function(error, results) {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.changedRows);
                }
            },
        );
    });
}

function getCurrentReminders() {
    return new Promise((resolve, reject) => {
        const startOfMinuteTimestamp = moment()
            .startOf('minute')
            .unix();
        const endOfMinuteTimestamp = startOfMinuteTimestamp + 59;

        connection.query(
            `SELECT * FROM ${tableName} 
            WHERE isDeleted = 0
            AND launchTime BETWEEN ${startOfMinuteTimestamp} AND ${endOfMinuteTimestamp}`,
            [],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results);
                }
            },
        );
    });
}

function updateLaunchTime(id, launchTime) {
    return new Promise((resolve, reject) => {
        connection.query(
            `UPDATE ${tableName}
            SET launchTime = ?
            WHERE id = ?
            AND isDeleted = ?`,
            [launchTime, id, 0],
            (error, results) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(results.changedRows);
                }
            },
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
