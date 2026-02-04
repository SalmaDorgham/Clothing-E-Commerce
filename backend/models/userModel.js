const mongoose = require ('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true},
    password: { type: String, required: true, unique: true},
    cartData: { type: Object, default: {}}
}, {minimize:false})

const userModel = mongoose.models.user || mongoose.model("user", userSchema);
module.exports = userModel