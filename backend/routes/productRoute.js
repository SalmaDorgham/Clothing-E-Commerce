const productRouter = require("express").Router();
const c = require("../controllers/productController");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/multer")

productRouter.post("/add",adminAuth, upload.fields([{name:'image1', maxCount:1}, {name:'image2', maxCount:1}, {name:'image3', maxCount:1}, {name:'image4', maxCount:1}]), c.addProduct);
productRouter.post("/remove",adminAuth, c.removeProduct);
productRouter.get("/single", c.singleProduct);
productRouter.get("/list", c.listProducts);

module.exports = productRouter;