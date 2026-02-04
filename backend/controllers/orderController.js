const orderModel = require("../models/orderModel");
const userModel = require("../models/userModel");
const productModel = require("../models/productModel");
const Stripe = require('stripe')

const currency = 'usd'
const deliveryCharge = 10
const taxCharge = 5

/*
    initialize gateway
    place order via:
        COD
        stripe
          verify stripe
    list (admin)
    list (user)
    update status
*/

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

const placeOrder = async (req, res) => {
  try {
    const userId = req.userId;
    const { items, amount, address } = req.body;
    const orderData = {
      userId,
      items,
      amount,
      address,
      paymentMethod: "COD",
      payment: false,
      date: Date.now(),
    };

    const newOrder = new orderModel(orderData);
    await newOrder.save();

    // increment selling value for each item with quantity bought
    const orderItems = Array.isArray(items) ? items : [];

    const ops = [];
    for (const it of orderItems) {
      const productId = it?._id;
      const qty = Number(it?.quantity || 0);

      if (!productId || !Number.isFinite(qty) || qty <= 0) continue;

      ops.push({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { seller: qty } },
        },
      });
    }

    if (ops.length) {
      await productModel.bulkWrite(ops, { ordered: false });
    }

    await userModel.findByIdAndUpdate(userId, { cartData: {} });
    res.json({ success: true, message: "Order Placed!" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const placeOrderCreditCard= async (req, res) => {
    try {
        const userId = req.userId;
        const { items, amount, address} = req.body;
        const { origin } = req.headers;
        const orderData = {
            userId,
            items,
            amount,
            address,
            paymentMethod: 'Stripe',
            payment: false,
            date: Date.now()
        }

        const newOrder = new orderModel (orderData)
        await newOrder.save()

        const line_items = items.map((item) => ({
            price_data: {
                currency:currency,
                product_data: {
                    name: item.name
                },
                unit_amount: item.price * 100
            },
            quantity: item.quantity
        }))

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name: 'Delivery Charges'
                },
                unit_amount: deliveryCharge * 100
            },
            quantity: 1
        })

        line_items.push({
            price_data: {
                currency:currency,
                product_data: {
                    name: 'Taxes'
                },
                unit_amount: taxCharge * 100
            },
            quantity: 1
        })

        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        })

        res.json({success:true, session_url:session.url})

    } catch (error) {
        console.log(error)
        res.json ({success:false, message:error.message})
    }
}

//=================================================================//

const verifyStripe = async (req, res) => {

  const userId = req.userId;
  const { orderId, success } = req.body;

  try {
    if (success !== "true") {
      await orderModel.findByIdAndDelete(orderId);
      return res.json({ success: false });
    }

    const order = await orderModel.findById(orderId);
    if (!order) {
      return res.json({ success: false, message: "Order not found" });
    }

    if (order.payment === true) {
      return res.json({ success: true });
    }

    // increment selling value for each item with quantity bought
    const items = Array.isArray(order.items) ? order.items : [];

    const ops = [];
    for (const it of items) {
      const productId = it?._id;
      const qty = Number(it?.quantity || 0);

      if (!productId || !Number.isFinite(qty) || qty <= 0)
        continue;

      ops.push({
        updateOne: {
          filter: { _id: productId },
          update: { $inc: { seller: qty } },
        },
      });
    }

    if (ops.length) {
      await productModel.bulkWrite(ops, { ordered: false });
    }

    await orderModel.findByIdAndUpdate(orderId, { payment: true });
    await userModel.findByIdAndUpdate(userId, { cartData: {} });

    return res.json({ success: true });

  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const allOrders = async (req, res) => {
    try {
        
        const orders = await orderModel.find({})
        res.json({success: true, orders})

    } catch (error) {
        console.log(error)
        res.json ({success:false, message:error.message})
    }
}

//=================================================================//

const userOrders = async (req, res) => {
    try {
        
        const userId = req.userId;

        const orders = await orderModel.find({userId})
        res.json({success: true, orders})

    } catch (error) {
        console.log(error)
        res.json ({success:false, message:error.message})
    }
}

//=================================================================//

const updateStatus = async (req, res) => {
    try {
        
        const {orderId, status} = req.body

        await orderModel.findByIdAndUpdate(orderId, {status})
        const orders = await orderModel.find({orderId})
        res.json({success: true, message:"Status Updated!"})

    } catch (error) {
        console.log(error)
        res.json ({success:false, message:error.message})
    }
}

module.exports = {placeOrder, placeOrderCreditCard, verifyStripe, allOrders, userOrders, updateStatus}
