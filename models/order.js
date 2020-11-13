const mongoose = require('mongoose');
const Joi = require('joi');

const orderSchema = mongoose.Schema({
    items_purchased:{
        type:Array,
        required:true
    },
    user:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"user"
    },
    amount:{
        type:Number,
        required:true,
    },
    amount_paid:{
        type:Number,
        required:true,
    },
    payment_date:{
        type:Date
    },
    order_status:{
        type:String,
        required:true,
        default:'pending',
        lowercase:true
    },
    payment_status:{
        type:Boolean,
        required:true,
        default:false
    },
    mark_as_seen:{
        type:Boolean,
        default:false
    },
    coupon_used:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"coupon"
    },
    billing_details:{
        type:Object,
        required:true
        
    },
    transaction_id:{
        type:String,
        required:true,
        unique:true
    }
}, {timestamps: true})

const Order = mongoose.model('orders', orderSchema)

const validate = (data) =>{

    const schema = {
        items_purchased:Joi.array().required(),
        payment_date:Joi.string().allow(""),
        order_status:Joi.string(),
        payment_status:Joi.boolean().required(),
        mark_as_seen:Joi.string(),
        coupon_used:Joi.string(),
        billing_details:Joi.object().required(),
        amount:Joi.number().required(),
        amount_paid:Joi.number().required(),
        transaction_id:Joi.string().required()

    }
    return Joi.validate(data, schema)

}

module.exports = { Order, validate }