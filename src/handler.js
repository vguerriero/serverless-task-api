'use strict';

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const TABLE_NAME = 'Tasks';
const docClient = new AWS.DynamoDB.DocumentClient();

module.exports.getTasks = async () => {
  const data = await docClient.scan({ TableName: TABLE_NAME }).promise();
  return {
    statusCode: 200,
    body: JSON.stringify(data.Items),
  };
};

module.exports.createTask = async (event) => {
  let body;
  try {
    body = JSON.parse(event.body);
  } catch (err) {
    return { statusCode: 400 };
  }

  if (!body || typeof body.title !== 'string') {
    return { statusCode: 400 };
  }

  const item = {
    id: uuidv4(),
    title: body.title,
  };

  await docClient.put({ TableName: TABLE_NAME, Item: item }).promise();

  return {
    statusCode: 201,
    body: JSON.stringify(item),
  };
};
