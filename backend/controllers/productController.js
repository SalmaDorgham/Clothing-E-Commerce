const cloudinary = require('cloudinary').v2;
const productModel = require("../models/productModel");

/*
    add
    list
    remove
    single
*/

const addProduct = async (req, res) => {
    try {

        const {name, description, price, category, subCategory, color, sizes} = req.body

        const image1 = req.files.image1 && req.files.image1[0]
        const image2 = req.files.image2 && req.files.image2[0]
        const image3 = req.files.image3 && req.files.image3[0]
        const image4 = req.files.image4 && req.files.image4[0]

        const images = [image1, image2, image3, image4].filter((item)=> item !== undefined)

        let imagesUrl = await Promise.all (
            images.map(async (item) =>{
                let result = await cloudinary.uploader.upload(item.path,{resource_type:'image'});
                return result.secure_url;
            })
        )

        const productData = {
            name,
            description,
            category,
            subCategory,
            color,
            price: Number(price),
            sizes: JSON.parse(sizes),
            image: imagesUrl,
            date: Date.now()
        }

        console.log(productData);

        const product = new productModel (productData);
        await product.save()

        res.json({success:true, message:"Product added"})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//=================================================================//

const listProducts = async (req, res) => {
    try {
        
        const products = await productModel.find({});
        res.json({success:true, products})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//=================================================================//

const removeProduct = async (req, res) => {
    try {
        
        await productModel.findByIdAndDelete(req.body.id)
        res.json({success:true, message:"Product removed"})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//=================================================================//

const singleProduct = async (req, res) => {
    try {   
        const { productId } = req.query;
        if (!productId) {
            return res.json({ success: false, message: "Product ID is required" });
        }
        const product = await productModel.findById(productId)
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        res.json({success:true, product})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
} 

module.exports = {addProduct, listProducts, removeProduct, singleProduct}