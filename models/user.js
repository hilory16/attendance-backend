const mongoose = require('mongoose');
const Joi = require('joi');
const jwt = require('jsonwebtoken')
const config = require('config')

const userSchema = mongoose.Schema({
    firstname:{
        type:String,
        required:true
    },
    lastname:{
        type:String,
        required:true
    },
    email:{
        type:String,
        unique:true,
        required:true,
        trim:true,
        lowercase:true
    },
    password:{
        type:String,
        required:true
    },
    phone:{
        type:String,
        required:true,
        unique:true
    },
    role:{
        type:String,
        required:true,
    },
    regNo:{
        type:String,
        required:true
    },
    image:{
        type:String,
    },
    dob:{
        type:String,
    },
    reset_token:{
        type:String,
        default:''
    }
},{timestamps:true})

userSchema.methods.generateAuthToken = function(){

    const token = jwt.sign({_id:this._id, role:this.role}, config.get('jwtPrivateKey'))
    return token
}

// userSchema.methods.hashPassword = function(){
//     const salt = await bcrypt.genSalt(10)
//     const hashed = await bcrypt.hash(req.body.password, salt)
//     req.body.password = hashed;
// }

const User = mongoose.model('user', userSchema);

function validate(data){
    const schema = {
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        email: Joi.string().email().required(),
        password: Joi.string().required(),
        phone: Joi.string().required(),
        role: Joi.string().required(),
        regNo:Joi.string().required(),
        dob: Joi.string().allow(''),
        image: Joi.string().allow(''),
    }

    return Joi.validate(data, schema)
}

module.exports = { User, validate};