const cartRouter = require("express").Router();
const c = require("../controllers/cartController");
const authUser = require("../middleware/auth");

cartRouter.post("/get", authUser, c.getCart);
cartRouter.post("/add", authUser, c.addtoCart);
cartRouter.post("/update", authUser,  c.updateCart);

module.exports = cartRouter;
