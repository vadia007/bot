const cron = require('node-cron');
const fb = require('../helpers/fb');

module.exports = () => {
    cron.schedule('* * * * *', () => {
        console.log('cron is running');

        fb.sendReminders().catch(error => {
            console.error(error);
        });
    });
};
