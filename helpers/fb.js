const request = require('request');
const moment = require('moment');

function callSendAPI(senderPsid, response) {
    const PAGE_ACCESS_TOKEN = process.env.PAGE_ACCESS_TOKEN;
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": senderPsid
        },
        "message": response
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v2.6/me/messages",
        "qs": { "access_token": PAGE_ACCESS_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (err) {
            console.error("Unable to send message:" + err);
        } else {
            console.log('message sent!')
        }
    });
}

function defaultButtonsResponse(title) {
    return  {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "generic",
                "elements": [{
                    "title": title,
                    "subtitle": "Available actions are.",
                    "buttons":[
                        {
                            "type":"postback",
                            "title":"Add reminder",
                            "payload":"addReminder"
                        },
                        {
                            "type":"postback",
                            "title":"Reminder list",
                            "payload":"reminderList"
                        },
                        {
                            "type":"postback",
                            "title":"Delete reminder",
                            "payload":"deleteReminder"
                        },
                    ]
                }]
            }
        }
    };
}

function send(senderPsid, text, withDefaultButtons) {
    let response;

    if (withDefaultButtons) {
        response = defaultButtonsResponse(text);
    } else {
        response = {
            "text": text
        };
    }

    callSendAPI(senderPsid, response);
}

function getListResponse(reminders) {
    let elements = [];

    reminders.forEach(function (reminder) {
        elements.push({
            title: reminder.name,
            subTitle: moment(reminder.launchTime).format('DD MMM HH:mm')
        });
    });

    return {
        "attachment": {
            "type": "template",
            "payload": {
                "template_type": "list",
                "top_element_style": "compact",
                "elements": elements
            }
        }
    }
}

function sendList(senderPsid, reminders) {
    const response = getListResponse(reminders);

    callSendAPI(senderPsid, response);
}

module.exports = {
    send: send,
    sendList: sendList
};