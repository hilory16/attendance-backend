const mongoose = require('mongoose');
const Joi = require('joi');

const attendanceSignedSchema = mongoose.Schema({
    attendance_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'attendancelist'
    },
    user_id:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:'user'
    },
    phone_id:{
        type:String,
        required:true,
    },
    location:{
        type:String,
        required:true,
    }
},{timestamps:true})

const AttendanceSigned = mongoose.model('attendancesigned', attendanceSignedSchema);

function validate(data){
    const schema = {
        attendance_id: Joi.string().required(),
        user_id: Joi.string().required(),
        phone_id: Joi.string().required(),
        location: Joi.string().required(),
    }
    return Joi.validate(data, schema)
}
module.exports = { AttendanceSigned, validate}