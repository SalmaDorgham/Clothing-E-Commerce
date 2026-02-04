const bcrypt = require("bcrypt");
const validator = require ("validator");
const jwt = require ("jsonwebtoken")
const userModel = require("../models/userModel");

const createToken = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET)
}

/*
    user login
    user register
    user reset password
    admin login
*/

const loginUser = async (req, res) => {
    try {

        const {email, password} = req.body;

        const user = await userModel.findOne({email});

        if (!email || !password) {
            return res.json({ success: false, message: "Missing fields" });
        }

        if (!user) {
            return res.json({success:false, message:"User doesn't exist"})
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (isMatch) {
            const token = createToken(user._id)
            res.json({success:true, message:token, user:{id: user._id,cartData: user.cartData,},});
        } 
        else {
            res.json({success:false, message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//=================================================================//

const registerUser = async (req, res) => {
    try {
        const {email, password, confirmPassword} = req.body;

        if (!email || !password || !confirmPassword) {
            return res.json({ success: false, message: "Missing fields" });
        }

        // check user exists or not
        const exists = await userModel.findOne({email});
        if (exists) {
            return res.json({success:false, message:"User already exists"})
        }

        // email validation
        if (!validator.isEmail(email)) {
            return res.json({success:false, message:"Enter a valid email"})
        }

        // password validation
        if ( password.length < 8 || password.length > 28 || !/[A-Za-z]/.test(password) || !/[0-9]/.test(password) ) {
            return res.json({ success: false, message: "Password must be 8–28 characters and contain both letters and numbers"});
        }

        // confirm password
        if (confirmPassword !== password) {
            return res.json({success:false, message:"Confirm password must match"});
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel ({
            email,
            password: hashedPassword
        })

        const user = await newUser.save()
        const token = createToken(user._id)
        res.json({success:true, token, user:{id: user._id,cartData: user.cartData,},})

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

//=================================================================//

const resetPassword = async (req, res) => {
  try {
    const { email, newPassword, confirmPassword } = req.body;

    if (!email || !newPassword || !confirmPassword) {
      return res.json({ success: false, message: "Missing fields" });
    }

    // email validation
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Enter a valid email" });
    }

    // user exists
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User doesn't exist" });
    }

    // password validation
    if ( newPassword.length < 8 || newPassword.length > 28 || !/[A-Za-z]/.test(newPassword) || !/[0-9]/.test(newPassword) ) {
      return res.json({ success: false, message: "Password must be 8–28 characters and contain both letters and numbers"});
    }

    // confirm password
    if (confirmPassword !== newPassword) {
      return res.json({ success: false, message: "Confirm password must match" });
    }

    // no reusing same password
    const sameAsOld = await bcrypt.compare(newPassword, user.password);
    if (sameAsOld) {
      return res.json({ success: false, message: "New password must be different from the old password" });
    }

    // hash + update
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    return res.json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.log(error);
    return res.json({ success: false, message: error.message });
  }
};

//=================================================================//

const loginAdmin = async (req, res) => {
    try {
        
        const {email, password} = req.body

        if (email===process.env.ADMIN_EMAIL && password===process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email+password, process.env.JWT_SECRET);
            res.json({success:true, token})
        }else {
            res.json({success:false, message:"Invalid credentials"})
        }

    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message})
    }
}

module.exports = {loginUser, registerUser, resetPassword, loginAdmin}