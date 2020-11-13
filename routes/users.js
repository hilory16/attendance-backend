const express = require('express');
const router = express.Router();
const {User, validate} = require('../models/user');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin')
const student = require('../middleware/student')
const instructor = require('../middleware/instructor')
const jwt = require('jsonwebtoken')
const config = require('config')
const nodemailer = require("nodemailer");
const Joi = require('joi')


// GET LOGGED IN USER - ACCESS = LOGGED IN USER
router.get('/profile', auth, async (req,res) =>{
    try{
        const user = await User.findById(req.user._id).select('-password')
       
        if(!user) return res.status(404).send({message:"No user found!"})

        res.status(200).send(user)
    }
    catch(e){ 
        res.status(400).send(e)
    }
    // res.status(200).send(req.user._id)

   
    
})


//ACCESS - ANYBODY
router.post('/', async(req, res) =>{
    const { error} = validate(req.body)
    if(error) return res.status(400).send({message:error.details[0].message})

    // res.status(200).send({status:"Success"})
    try{
        let user = await User.findOne({email:req.body.email})
        if(user){
            return res.status(400).send({
                message:"Email already exist!"
            })
        }
        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(req.body.password, salt)
        req.body.password = hashed;
        
        user = new User(req.body)
        await user.save()

        const token = user.generateAuthToken()
        
        res.status(200).header({"Authorization":token}).send({
            message:"Registration Successful!",
            data: _.pick(user, ["firstname", "lastname","email", "phone","_id", "regNo", "role", "image"]),
            token
        })

    }
    catch(e){
        console.log(e)
    }
})


// GET ALL USERS ---- ACCESSS = ADMIN ONLY
// [auth, admin]
router.get('/',[auth, admin], async (req, res)=>{
    
    const order = req.query.order
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)

    try{
        const user =  await User
        .find()
        .sort({_id:order})
        .limit(limit)
        .select("-password")
        .skip(skip)

        if(!user) return res.status(404).send({message:"User list is empty!"})
        res.status(200).send(user)
    }
    catch(e){
        console.log(e)
    }
   
})


// GET SINGLE USER -- ACCESS = ANY REGISTERED USER
router.get('/:id', auth, async (req, res)=>{

    try{
        const user =  await User.findById(req.params.id)
        if(!user) return res.status(404).send({message:"User doesn't exist!"})

        res.status(200).send(_.pick(user, ["firstname", "lastname","email", "phone","_id", "regNo", "role", "image"]))
    }
    catch(e){
        res.status(400).send(e)
    }
   
})

// UPDATE USER --- ACCESS = REGISTERED USER (Later: Try to use .save() so users can't update role)
router.put('/profile', auth, async (req, res) =>{
    try{
        const result =  await User.findByIdAndUpdate(req.user._id,req.body,{new:true})
        if(!result) return res.status(404).send({message:"Not Found"})

        res.status(200).send({
            message:"Profile Update",
            data:_.pick(result, ["firstname", "lastname","email", "phone","_id", "regNo", "role", "image"])
        })

    }
    catch(e){
        res.status(400).send(e)
    }
    
})


// DELETE USER -- ACCESS = ADMIN ONLY
router.delete('/:id',[auth, admin], async (req, res) =>{
    try{
        const result = await User.findByIdAndDelete(req.params.id)

        if(!result) return res.status(400).send({message: "User doesn't exist!"})

        res.status(200).send({
            message:"User Deleted!",
            user:_.pick(result, ["firstname", "lastname","email", "phone","_id", "regNo", "role", "image"])
        })
    }
    catch(e){
        res.status(400).send(e)
    }
})



// FORGOT PASSWORD
router.put('/forgot-password', async(req, res)=>{
    const {email} = req.body;

    try{
        const user = await User.findOne({email})

        if(!user) return res.status(400).send({message:"User doesn't exist!"})

        const token = jwt.sign({_id:user._id}, config.get('jwtPrivateKey'), {expiresIn:'10m'});

        // const data = {
        //     from:"noreply@hello.com",
        //     to:email,
        //     subject:'Password Reset Link',
        //     html:`
        //         <h2> Please click on the link below to reset your password</h2>
        //         <a href="http://localhost:4000/resetpassword/${token}">http://localhost:4000/resetpassword/${token}</a>
        //     `
        // }

            let transporter = nodemailer.createTransport({
                host: "premium77.web-hosting.com",
                port: 465,
                secure: true,
                auth: {
                    user: config.get('MAIL_CLIENT_USERNAME'),
                    pass: config.get('MAIL_CLIENT_PASSWORD')
                },
                tls:{
                    rejectUnauthorized:false
                }
            });
    
            
            let info = await transporter.sendMail({
                from: `"Boss Divva Glow" ${config.get('MAIL_CLIENT_USERNAME')}`,
                to:email,
                subject:'Password Reset Link',
                html:`
                    <h1 style="margin-bottom:25px;">Hey ${user.fullname}!</h1>
                    <h3> Please click on the link below to reset your password. Token expires in 10 minutes</h3>
                    <a href="http://localhost:4000/resetpassword/${token}">http://localhost:4000/resetpassword/${token}</a>
                `
            });
            const updateResetLink = await User.findOneAndUpdate({_id:user._id},{reset_token:token})

            // console.log("Message sent: %s", info.messageId);
            
            res.status(200).send({message:`Password reset link has been sent to your email. Token expires in 10 minutes`})

    }
    catch(e){
        res.status(400).send({message:"Password Reset failed! Try again."})
    }

    
})


router.put('/reset-password', auth, async(req,res) =>{
    schema ={
        // reset_token:Joi.string().required(),
        newPassword:Joi.string().required()
    }

    const {newPassword} = req.body
    const result = Joi.validate(req.body, schema);

    const { error} = result
    if(error) return res.status(400).send({message:error.details[0].message})

    try{
        // const user =  jwt.verify(reset_token, config.get('jwtPrivateKey'))

        const salt = await bcrypt.genSalt(10)
        const hashed = await bcrypt.hash(newPassword, salt)
        // req.body.newPassword = hashed;

        const updatePassword = await User.findOneAndUpdate({_id:req.user._id},{password:hashed},{new:true})
        console.log(updatePassword)

        if(!updatePassword) return res.status(404).send({message:"User doesn't exist or invalid token!"})

        res.status(200).send({
            message:"Password reset successful!",
            user:_.pick(updatePassword, ["fullname", "username","email", "phone","_id"])
        })

        
    }   
    catch(e){
        res.status(401).send({message:e || "Invalid or expired token sent!"})
    }

    


})



module.exports = router