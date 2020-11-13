const express = require('express');
const router = express.Router();
const Joi = require('joi');
const bcrypt = require('bcrypt')
const {User} = require('../models/user');

router.post('/', async(req, res) =>{
    const {error} = validate(req.body)
    if(error) return res.status(400).send({message:error.details[0].message});

    try{
        const user = await User.findOne({email:req.body.email})
        if(!user) return res.status(400).send({message:"Invalid email or password!"})

        const validPassword = await bcrypt.compare(req.body.password, user.password)

        if(!validPassword) return res.status(400).send({message:"Invalid email or password!"})

        const token = user.generateAuthToken()
        res.send({message:"Login Success!", token, admin:user.isAdmin})
    }
    catch(e){

    }
})


const validate = (data) =>{
    const schema = {
        email:Joi.string().required().email(),
        password:Joi.string().required()
    }

    return Joi.validate(data, schema)
}
module.exports = router;