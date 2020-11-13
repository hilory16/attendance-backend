const mongoose = require('mongoose');
const Joi = require('joi');

const classSchema = mongoose.Schema({
    class_name:{
        type:String,
        required:true
    },
    isOpened:{
        type:Boolean,
       required:true,
       default:true
    },
    description:{
        type:String,
        maxLenght:255,
        required:true
    },
    instructor_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user"
    }
},{timestamps:true})


const Classes = mongoose.model('class', classSchema);

function validate(data){
    const schema = {
        class_name: Joi.string().required(),
        isOpened: Joi.boolean().required(),
        description: Joi.string().allow('')
    }
    return Joi.validate(data, schema)
}

module.exports = { Classes, validate}