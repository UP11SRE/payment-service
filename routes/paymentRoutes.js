const express = require('express');
const router = express.Router();
const paymentController = require('../controller/paymentController');

router.post('/payment', paymentController.processTransaction);
router.get('/pay', paymentController.transectionUpdate);

// router.post('/refund', paymentController.processRefund);

module.exports = router;
