const amqp = require('amqplib');
require('dotenv').config();


let connection;
let channel;

async function connect() {
  connection = await amqp.connect(process.env.RABBITMQ_URL);
  channel = await connection.createChannel();
  await channel.assertQueue('orderQueue');
}

function getChannel() {
  return channel;
}

async function sendMessage(message) {
    if (!channel) {
      throw new Error('Channel is not initialized. Call connect() first.');
    }
    channel.sendToQueue('orderQueue', Buffer.from(JSON.stringify(message)), {}, function(err, ok) {
      if (err !== null) {
        console.error("Message nacked");
      } else {
        console.log("Message acked");
      }
    });  
  }

module.exports = { connect, getChannel, sendMessage };
