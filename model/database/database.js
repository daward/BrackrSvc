const dynamo = require('dynamodb');
dynamo.AWS.config.update({
  accessKeyId: process.env.ACCESS_ID,
  secretAccessKey: process.env.ACCESS_KEY,
  region: "us-west-2"
});

module.exports = dynamo;