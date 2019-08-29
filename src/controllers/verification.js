const {
  facebook: { verifyToken },
} = require('../../config');

module.exports = (req, res, next) => {
  const mode = req.query['hub.mode'];
  const requestToken = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode && requestToken) {
    if (mode === 'subscribe' && requestToken === verifyToken) {
      res.status(200).send(challenge);
    } else {
      res.sendStatus(403);
    }
  } else {
    next();
  }
};
