const express = require('express');
const User = require('../model/index')

const bcrypt = require('bcrypt');
const generateToken = require('../utils');
const nodemailer = require('nodemailer');
const verifyToken = require('../middleware/index')
const router = express.Router();




router.get('/test',(req,res) =>{
    res.json({message:"Api Testing Successful"})
    
});

router.post('/user',async(req,res) =>{
    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(!user){

        const hashedPassword = await bcrypt.hash(password,10);

        const newUser = new User({email,password:hashedPassword});

        await newUser.save();
       console.log(email,password);
        return res.status(201).json({message:"User Created"})
    }

    res.status(404).json({message:"User already Exists"});
})

router.post('/authenticate',async(req,res) => {
    const {email,password} = req.body;

    const user = await User.findOne({email});

    if(!user){
        return res.status(404).json({message:"User not found"});

    }

    const isMatch = await bcrypt.compare(password,user.password);

    if(!isMatch){
        return res.status(401).json({message:"Incorrect Password"})
    }

    const token = generateToken(user);
    res.json({token});
});

router.get('/data',verifyToken,(req,res) =>{
    res.json({message:`welcome,${req.user.email}! This is protected data`})

})

router.post('/reset-password',async(req,res) =>{
    const user = await User.findOne({email});

    if(!user){

        return res.status(404).json({message:"User not found"});
    }

    const token = Math.random().toString(36).slice(-8);

    user.restPasswordToken = token;
    user.restPasswordExpires = Date.now()+36000;

    await user.save();

    const transport = nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:"pp3662504@gmail.com",
            pass:"Prakash@12"
        },

    })

    const message ={
        from:'pp3662504@gmail.com',
        to:user.email,
        Subject:"Password rest request",
        text:`You are receiving this email because you(or someone else) has request a password reset for your account.\n\n Please use the token to reset your password.${token} \n\n If you did not request a password reset,Please ignore this email`
    
    }

    transport.sendMail(message,(err,info) =>{
        if(err){
            res.status(404).json({message:"something went wrong ,Try again!"})
        }

        res.status(200).json({message:"Password reset Email sent" + info.response});
    })
})

module.exports = router;