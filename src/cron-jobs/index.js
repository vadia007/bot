const cron = require('node-cron');
const reminder = require('../helpers/reminder');

module.exports = () => {
  cron.schedule('* * * * *', () => {
    console.log('cron is running');

    reminder.sendReminders().catch(error => {
      console.error(error);
    });
  });
};
