const request = require('request');
const dialogflow = require('dialogflow');
const uuid = require('uuid');

function handleMessage(senderPsid, receivedMessage) {
    let response;

    // Check if the message contains text
    if (receivedMessage) {

        getIntent(receivedMessage, senderPsid)
            .then(response => {
                const data = response[0].queryResult;

                if (data.intent.action) {
                    if (!data.allRequiredParamsPresent) {
                        response = {
                            "text": data.fulfillmentText
                        };

                        callSendAPI(senderPsid, response);
                    } else {

                        //get params
                    }
                }

                console.log(response[0].intent);
                console.log('--------response1--------');
                console.log(response);
            })
            .catch(err => {
                console.error('ERROR:', err);
            });

    } else {
        response = {
            "text": 'Your message should contain text'
        };

        addButtonsToResponse(response);
        callSendAPI(senderPsid, response);
    }
}

async function getIntent(message, senderPsid) {
    const config = {
        credentials: {
            private_key: JSON.parse(`"${process.env.DIALOGFLOW_PRIVATE_KEY}"`),
            client_email: process.env.DIALOGFLOW_CLIENT_EMAIL
        }
    };
    const projectId = process.env.PROJECT_ID;
    // const sessionId = uuid.v4();
    const sessionId = senderPsid;
    const sessionClient = new dialogflow.SessionsClient(config);
    const sessionPath = sessionClient.sessionPath(projectId, sessionId);
    const request = {
        session: sessionPath,
        queryInput: {
            text: {
                text: message,
                languageCode: 'en-US',
            },
        },
    };

    return sessionClient
        .detectIntent(request);
}

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

function addButtonsToResponse(response) {
    response.message = {
        "attachment":{
            "type":"template",
            "payload":{
                "template_type":"button",
                "text":"Select action",
                "buttons":[
                    {
                        "type":"postback",
                        "title":"Add reminder",
                        "payload":"add_reminder"
                    },
                    {
                        "type":"postback",
                        "title":"Reminder list",
                        "payload":"reminder_list"
                    },
                    {
                        "type":"postback",
                        "title":"Delete reminder",
                        "payload":"delete_reminder"
                    },
                ]
            }
        }
    };

    return response;
}

module.exports = {
    handleMessage: handleMessage
};