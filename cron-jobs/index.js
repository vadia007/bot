const cron = require('node-cron');
const fb = require('../helpers/fb');

module.exports = function () {
    cron.schedule('* * * * *', () => {
        console.log('cron is running');

        fb.sendReminders()
            .catch((error) => {
                console.error(error);
            });
    })
};