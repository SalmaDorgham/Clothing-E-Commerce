const userModel = require("../models/userModel");
/*
    add
    update
    get
*/

const addtoCart = async (req,res) => {
    try {
        const userId = req.userId;
        const {itemId, size} = req.body

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        if (cartData[itemId]) {
            if (cartData[itemId][size]) {
                cartData[itemId][size] +=1
            } else {
                cartData[itemId][size] =1
            }
        } else {
            cartData[itemId] = {}
            cartData[itemId][size] = 1
        }

        await userModel.findByIdAndUpdate (userId, {cartData})
        res.json({success: true, message:"Added to Cart!"})

    } catch (error) {
        console.log (error)
        res.json({success: false, message: error.message})
    }
}

//=================================================================//

const updateCart = async (req, res) => {
  try {
    const userId = req.userId;
    const { itemId, size, quantity } = req.body;

    const userData = await userModel.findById(userId);
    let cartData = userData.cartData || {};

    if (quantity <= 0) {
      if (cartData[itemId]) {
        delete cartData[itemId][size];

        if (Object.keys(cartData[itemId]).length === 0) {
          delete cartData[itemId];
        }
      }
    } 
    else {
      cartData[itemId] = cartData[itemId] || {};
      cartData[itemId][size] = quantity;
    }

    await userModel.findByIdAndUpdate(userId, { cartData });

    res.json({ success: true, message: "Cart Updated" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const getCart = async (req,res) => {
    try {
        
        const userId = req.userId;

        const userData = await userModel.findById(userId)
        let cartData = await userData.cartData;

        res.json({success: true, cartData});

    } catch (error) {
        console.log (error)
        res.json({success: false, message: error.message})
    }
}

module.exports = {addtoCart, updateCart, getCart}