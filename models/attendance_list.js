
const mongoose = require('mongoose');
const Joi = require('joi');

// console.log(Product)

const attendanceSchema = mongoose.Schema({
    end_date:{
        type:String,
        required:true,
    },
    class_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'class'
    },
    isOpened:{
        type:Boolean,
        required:true
    },
    link:{
        type:String,
    },
    location:{
        type:String,
    },
}, {timestamps:true})

const AttendanceList = mongoose.model('attendancelist', attendanceSchema)

const validate = (data) =>{

    const schema = {
        end_date:Joi.string().required(),
        class_id:Joi.string().required(),
        isOpened:Joi.boolean().required(),
        link:Joi.string().allow(""),
        location:Joi.number().allow("")
    }

    return Joi.validate(data, schema)

}

const validateReply = (data) =>{

    const schema = {
        userId:Joi.string(),
        reply:Joi.string().required().max(500),
        // /comment_id:Joi.string().required(),
    }

    return Joi.validate(data, schema)

}
module.exports = { AttendanceList, validate, validateReply }