const paymentService = require('../services/paymentService');
const shortUrl = require("node-url-shortener");


module.exports = {
    async processTransaction(req, res) {
        try {
          const { amnt, email, productId,orderid, quantity } = req.body;
          const stripeUrl = await paymentService.initiatePayment(amnt, email, productId, orderid,quantity);
          
          // Shorten the URL and handle the callback
          shortUrl.short(stripeUrl, function (err, url) {
            if (err) {
              console.error(err);
            }
      
            // Send the shortened URL as JSON response
            return res.status(200).json({ url: url, message : "Please pay through this link" });
          });
        } catch (error) {
          console.error(error);
          return res.status(500).json({ success: false, error: 'Transaction processing failed' });
        }
      },
      
      async transectionUpdate(req,res){
       
        try{
         const status = req.query.payment;
         const sessionId = req.query?.session_id

         const response = await paymentService.transactionUpdate(status,sessionId);


         if(status == "sucess"){
            return res.status(200).json({ message : "payment done"})
         }
         else{
            return res.status(200).json({message : "payment Failed"})

         }
        
        }
        catch(error){
         console.log("error", error.message);
         return res.status(400).json({success : false, message : "something went wrong"})
        }
      },
    }
