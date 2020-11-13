const express = require('express')
const router = express.Router()
const {Order, validate} = require('../models/order');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin')
const axios = require("axios");

// ADD ORDER

router.post('/',auth, async(req, res) =>{
    const {error} = validate(req.body);
    if(error) return res.status(400).send({message:error.details[0].message})
    
    req.body.user = req.user._id
    try{
        const order = new Order(req.body)
        const result  = await order.save()

        return res.status(200).send({message:"Your order has been taken!", data:result})
    }
    catch(e){
        res.status(400).send(e)
    }
})



router.get('/',[auth, admin], async(req, res) =>{
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    const order = req.query.order
    const sortBy = req.query.sortBy
    try{
        const order =  await Order.find().sort(sortBy).limit(limit).skip(skip).populate("user")
        if(!order) return res.status(404).send({message:"No Order yet!"})

        res.status(200).send(order)
    }
    catch(e){
        console.log(e)
    }
})

router.get('/type/:type',[auth, admin], async(req, res) =>{
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    const order = req.query.order
    const type = req.params.type
    const sortBy = req.query.sortBy
    try{
        const order =  await Order.find({order_status:type}).sort(sortBy).limit(limit).skip(skip).populate("user")
        if(!order) return res.status(404).send({message:"No Order yet!"})

        res.status(200).send(order)
    }
    catch(e){
        console.log(e)
    }
})

//GET ALL ORDERS FOR A SINGLE CUSTOMER
router.get('/user',auth, async(req, res) =>{
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    const order = req.query.order
    const sortBy = req.query.sortBy
    try{
        const order =  await Order.find({user:req.user._id}).sort(sortBy).limit(limit).skip(skip).populate("user")
        if(!order) return res.status(404).send({message:"No Order yet!"})

        res.status(200).send({message:"Order fetch success!", order})
    }
    catch(e){
        console.log(e)
    }
})

// GET SINGLE ORDER

router.get('/:id',auth, async (req, res)=>{
    try{
        const order =  await Order.findById(req.params.id)
        if(!order) return res.status(404).send({message:"Order not found!"})

        res.status(200).send(order)
    }
    catch(e){
        res.status(400).send(e)
    }
   
})

router.get('/verifytransactionid/:id',auth, async(req, res) =>{
    const id = req.params.id
    try{
        const order =  await Order.findOne({transaction_id: id})
        if(order) return res.status(200).send({message:"Id exists, try another", status:false, order})
        res.status(200).send({message:"Id not found", status:true})


    }
    catch(e){
        console.log(e)
    }
})

// Update ORDER
router.put('/:id',[auth, admin], async (req, res) =>{
    
    try{
        const order =  await Order.findByIdAndUpdate(req.params.id,req.body,{new:true})
        if(!order) return res.status(404).send({message:"Not Found"})

        res.status(200).send({message:"Status Update Successful!", order})
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

//UPDATE PAYMENT STATUS
router.put('/payment_status/:id/:reference',auth, async (req, res) =>{
    const {id,reference} = req.params
    const {value} = req.body
    
    try{
        const order =  await Order.findById(id).sort({_id:"desc"})
        if(!order) return res.status(404).send({message:"Not Found"})

        const url = `https://api.paystack.co/transaction/verify/${reference}`;

        const config = {
            headers: {
                Authorization: 'Bearer sk_test_138ba49e76e9a844c35837f697d92e57030b6693'
            } 
        }

        const response = await axios.get(url,config);
        const data = response.data;
        console.log(data);

        if(data.data.status !== "success") return res.status(400).send({message:"You are yet to complete your payment!"})

        order.payment_status = true
        order.amount_paid = data.data.amount / 100
        order.payment_date = data.data.paid_at
        const result = await order.save()

        res.status(200).send({message:"Payment status updated!", data:data})
    }
    catch(e){
        res.status(400).send(e)
    }
    
})


// DELETE ORDER
router.delete('/:id',[auth, admin], async (req, res) =>{
    try{
        const order = await Order.findByIdAndDelete(req.params.id)

        if(!order) return res.status(400).send({message: "Order doesn't exist!"})

        res.status(200).send({
            message:"Order Deleted!",
            product
        })
    }
    catch(e){
        res.status(400).send(e)
    }
    
})
module.exports = router
