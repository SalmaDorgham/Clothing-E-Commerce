const mongoose = require ('mongoose');

const productSchema = new mongoose.Schema({
    name: { type: String, required: true},
    description: { type: String, required: true},
    price: { type: Number, required: true},
    image: { type: Array, required: true},
    category: { type: String, required: true},
    subCategory: { type: String, required: true},
    color: { type: String, required: true},
    sizes: { type: Array, required: true},
    seller: { type: Number, required: true, default: 0},
    date: { type: Number, required: true},
})

const productModel = mongoose.models.product || mongoose.model("product", productSchema);
module.exports = productModel