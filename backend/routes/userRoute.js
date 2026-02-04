const userRouter = require("express").Router();
const c = require("../controllers/userController");

userRouter.post("/register", c.registerUser);
userRouter.post("/login", c.loginUser);
userRouter.post("/reset", c.resetPassword);
userRouter.post("/admin", c.loginAdmin);

module.exports = userRouter;