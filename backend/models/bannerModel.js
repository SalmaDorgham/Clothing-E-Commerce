const mongoose = require("mongoose");

const bannerSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    image: { type: String, required: true }, // single image url
    enabled: { type: Boolean, default: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
});


const bannerModel = mongoose.models.banner || mongoose.model("banner", bannerSchema);
module.exports = bannerModel