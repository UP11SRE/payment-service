const { getChannel } = require('../config/rabbitmq');
const paymentService = require('../services/paymentService');

(async () => {
  const channel = getChannel();
  channel.consume('orderQueue', async (message) => {
    if (message !== null) {
      const content = JSON.parse(message.content.toString());
      console.log(`Received message: ${JSON.stringify(content)}`);
      await handleMessage(content);
      channel.ack(message);
    }
  });
})();

async function handleMessage(content) {
  try {
    const { action, data } = content;
    
    switch (action) {
      case 'processRefund':
        await paymentService.initiateRefund(data);
        break;
      default:
        console.error(`Unknown action: ${action}`);
    }
  } catch (error) {
    console.error(`Error processing message: ${error.message}`);
  }
}
