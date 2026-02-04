const bannerRouter = require("express").Router();
const c = require("../controllers/bannerController");
const adminAuth = require("../middleware/adminAuth");
const upload = require("../middleware/multer")

bannerRouter.get("/active", c.listActiveBanners);
bannerRouter.get("/list", c.listBanners);

//admin
bannerRouter.post("/add", adminAuth, upload.fields([{ name: "image", maxCount: 1 }]), c.addBanner);
bannerRouter.post("/remove", adminAuth, c.deleteBanner);
bannerRouter.post("/update-enabled", adminAuth, c.updateBannerEnabled);

module.exports = bannerRouter;