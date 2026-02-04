const orderRouter = require("express").Router();
const c = require("../controllers/orderController");
const adminAuth = require("../middleware/adminAuth");
const authUser = require("../middleware/auth");

// admin
orderRouter.post("/list", adminAuth, c.allOrders);
orderRouter.post("/status", adminAuth, c.updateStatus);

// user
orderRouter.post("/userorders", authUser, c.userOrders);

//payment
orderRouter.post("/place", authUser, c.placeOrder);
orderRouter.post("/stripe", authUser, c.placeOrderCreditCard);

//verify
orderRouter.post("/verifyStripe", authUser, c.verifyStripe);

module.exports = orderRouter;
