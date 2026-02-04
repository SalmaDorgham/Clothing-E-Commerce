const bannerModel = require("../models/bannerModel");
const cloudinary = require("cloudinary").v2;

// check active date
const isWithinRange = (now, start, end) => {
  const n = now.getTime();
  return n >= new Date(start).getTime() && n <= new Date(end).getTime();
};

/*
    add
    list
    list active
    delete
    update
*/

const addBanner = async (req, res) => {
  try {
    const { name, startDate, endDate } = req.body;

    if (!name || !startDate || !endDate) {
      return res.json({ success: false, message: "Missing required fields." });
    }

    const imageFile = req.files?.image?.[0];
    if (!imageFile) {
      return res.json({ success: false, message: "Banner image is required." });
    }

    const s = new Date(startDate);
    const e = new Date(endDate);
    if (isNaN(s.getTime()) || isNaN(e.getTime())) {
      return res.json({ success: false, message: "Invalid date format." });
    }
    if (e < s) {
      return res.json({ success: false, message: "Ending date must be after starting date." });
    }

    const uploadRes = await cloudinary.uploader.upload(imageFile.path, {
      resource_type: "image",
    });

    const banner = new bannerModel({
      name: name.trim(),
      image: uploadRes.secure_url,
      enabled: true,
      startDate: s,
      endDate: e,
    });

    await banner.save();
    res.json({ success: true, message: "Banner added"});
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const listBanners = async (req, res) => {
  try {
    const banners = await bannerModel.find({}).sort({ createdAt: -1 });
    res.json({ success: true, banners });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const listActiveBanners = async (req, res) => {
  try {
    const now = new Date();

    const banners = await bannerModel
      .find({
        enabled: true,
        startDate: { $lte: now },
        endDate: { $gte: now },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, banners });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const deleteBanner = async (req, res) => {
  try {
    const { id } = req.body;
    if (!id) return res.json({ success: false, message: "Missing banner id." });

    await bannerModel.findByIdAndDelete(id);
    res.json({ success: true, message: "Banner deleted" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const updateBannerEnabled = async (req, res) => {
  try {
    const { id, enabled } = req.body;
    if (!id) return res.json({ success: false, message: "Missing banner id." });

    const banner = await bannerModel.findById(id);
    if (!banner) return res.json({ success: false, message: "Banner not found." });

    if (typeof enabled === "boolean") {
      banner.enabled = enabled;
    } else {
      banner.enabled = !banner.enabled;
    }

    await banner.save();
    res.json({ success: true, message: "Banner updated", banner });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

module.exports = {addBanner, listBanners, listActiveBanners, deleteBanner, updateBannerEnabled};
