require('dotenv').config();

switch (true) {
  case !process.env.PAGE_ACCESS_TOKEN:
    throw new Error('Facebook access token is required');
  case !process.env.VERIFY_TOKEN:
    throw new Error('Facebook verify token is required');
  case !process.env.PROJECT_ID:
    throw new Error('Dialog flow project id is required');
  case !process.env.DIALOGFLOW_PRIVATE_KEY:
    throw new Error('Dialog flow private key is required');
  case !process.env.DIALOGFLOW_CLIENT_EMAIL:
    throw new Error('Dialog flow client email is required');
  case !process.env.DB_NAME:
    throw new Error('DB name is required');
  case !process.env.DB_USER:
    throw new Error('DB user is required');
  case !process.env.DB_PASS:
    throw new Error('DB pass is required');
  case !process.env.DB_HOST:
    throw new Error('DB host is required');
}

module.exports = {
  facebook: {
    pageAccessToken: process.env.PAGE_ACCESS_TOKEN,
    verifyToken: process.env.VERIFY_TOKEN,
  },
  dialogFlow: {
    projectId: process.env.PROJECT_ID,
    privateKey: JSON.parse(`"${process.env.DIALOGFLOW_PRIVATE_KEY}"`),
    clientEmail: process.env.DIALOGFLOW_CLIENT_EMAIL,
  },
  db: {
    name: process.env.DB_NAME,
    user: process.env.DB_USER,
    pass: process.env.DB_PASS,
    host: process.env.DB_HOST,
  },
  port: process.env.PORT || 5000,
};
