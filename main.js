const express = require('express');
const app = express();
const paymentRoutes = require('./routes/paymentRoutes');
const {connect} = require('./config/rabbitmq')


app.use(express.json());
app.get('/', (req, res) => {
    res.status(200).send("Welcome to the Payment Service"); // Combine status() and send() calls
  });
  
app.use('/api/payment', paymentRoutes );

connect().then(() => {
    console.log('Connected to RabbitMQ');
  }).catch((error) => {
    console.error('Failed to connect to RabbitMQ:', error);
  });

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
