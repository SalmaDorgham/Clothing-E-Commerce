const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const connectDB = require ("./config/mongodb");
const connectCloudinary = require ("./config/cloudinary");
const userRouter = require("./routes/userRoute");
const productRouter = require("./routes/productRoute");
const cartRouter =require("./routes/cartRoute");
const orderRouter =require("./routes/orderRoute");
const bannerRouter =require("./routes/bannerRoute");

const app = express();
const port = process.env.PORT || 5000
app.use(cors());
app.use(express.json());
connectDB();
connectCloudinary();

app.get("/", (req, res) => {res.send("API is working")});
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);
app.use("/api/banner", bannerRouter);

app.listen(port, "0.0.0.0", () => console.log("Server is running on port: "+ port));

//=================================================================//

// Contact page route + controller
const nodemailer = require("nodemailer");
const validator = require ("validator");
app.post("/api/contact/send", async (req, res) => {
    try {
    const { name, surname, email, subject, message } = req.body;

    if (!name || !surname || !email || !subject || !message) {
      return res.json({ success: false, message: "All fields are required"});
    }

    if (!validator.isEmail(email)) {
        return res.json({success:false, message:"Enter a valid email"})
    }

    // Create transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.CONTACT_EMAIL, // sender email
        pass: process.env.CONTACT_EMAIL_PASS, // app password
      },
    });

    // Email content
    const mailOptions = {
      from: `"Fashion Customer Contact" <${process.env.CONTACT_EMAIL}>`,
      to: "s.soliman@leaptechkw.com",
      replyTo: email,
      subject: subject,
      html: `
        <h3>${subject}</h3>
        <p><strong>Name:</strong> ${name} ${surname}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    res.json({success: true,message: "Message sent successfully"});

  } catch (error) {
    console.error(error);
    res.json({success: false, message: "Failed to send message"});
  }
});