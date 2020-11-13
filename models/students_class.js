const mongoose = require('mongoose');
const Joi = require('joi');

const studentClassesSchema = mongoose.Schema({
    student_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    class_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'class'
    }
},{timestamps:true})

const StudentsClass = mongoose.model('studentclasses', studentClassesSchema);

function validate(data){
    const schema = {
        student_id: Joi.string().required(),
        class_id: Joi.string().required(),
    }
    return Joi.validate(data, schema)
}
module.exports = { StudentsClass, validate}