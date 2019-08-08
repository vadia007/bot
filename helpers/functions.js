const moment = require('moment-timezone');
const reminder = require('./reminder');
const nlu = require('./nlu');
const fb = require('./fb');
const timeZone = 'Europe/Kiev';

function handleMessage(senderPsid, receivedMessage) {
    let response;

    // Check if the message contains text
    if (receivedMessage) {
        nlu.getIntent(receivedMessage, senderPsid)
            .then(response => {
                const data = response[0].queryResult;

                if (data.action) {
                    if (!data.allRequiredParamsPresent) {
                        fb.send(senderPsid, data.fulfillmentText);
                    } else {
                        switch (data.action) {
                            case 'input.welcome':
                            case 'input.unknown':
                                fb.send(senderPsid, data.fulfillmentText, true);
                                break;
                            case 'input.addRemainder':
                                addReminder(senderPsid, data);
                                break;
                            case 'input.list':
                                reminderList(senderPsid);
                                break;
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
    switch (true) {
        case (type == 'addReminder'):
            const defaultText = 'Add reminder';

            handleMessage(senderPsid, defaultText);
            break;
        case (type == 'reminderList'):
            break;
        case (type == 'deleteReminder'):
            break;
            //delete with id
        default:
            console.log('default');
    }
}

function addReminder(senderPsid, data) {
    let reminderTimeMoment = moment.parseZone(data.parameters.fields.time.stringValue);
    const reminderDay = data.parameters.fields.date ?
        data.parameters.fields.date.stringValue.split('T')[0] :
        null;
    const reminderName = data.parameters.fields.name.stringValue;
    const currentTimestamp = moment().unix();
    const currentDay = moment().tz(timeZone).format('YYYY-MM-DD');

    if (reminderDay) {
        if (reminderDay > currentDay) {
            reminderTimeMoment = moment(reminderDay + ' ' + reminderTimeMoment.format('HH:mm;SS Z'));
        } else if (reminderDay < currentDay) {
            const responseText = 'The day couldn`t be less than today';

            fb.send(senderPsid, responseText, true);

            return;
        }
    } else {
        //set reminder for tomorrow if time is less then current time
        if (reminderTimeMoment.unix() < currentTimestamp) {
            reminderTimeMoment = reminderTimeMoment.add(1, 'day');
        }
    }

    const reminderTimestamp = reminderTimeMoment.unix();

    reminder.addReminder(reminderName, senderPsid, reminderTimestamp)
        .then(() => {
            const responseText = `${reminderName} was added successfully added at `
                + reminderTimeMoment.format('DD MMM HH:mm');

            fb.send(senderPsid, responseText);
        })
        .catch((error) => {
            console.error(error);

            const responseText = 'Sorry, can`t add reminder at this moment';

            fb.send(senderPsid, responseText);
        });
}

function reminderList(senderPsid) {
    reminder.getReminderList(senderPsid)
        .then((reminders) => {
            if (!reminders.length) {
                const responseText = 'There are no reminders';

                fb.send(senderPsid, responseText);
            } else {
                fb.sendList(senderPsid, reminders);
            }
        });
}

module.exports = {
    handleMessage: handleMessage,
    handlePostback: handlePostback
};

