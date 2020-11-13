const express = require('express')
const router = express.Router()
const {Comment, validate, validateReply} = require('../models/attendance_list');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const {Product} = require('../models/class')

// ADD COMMENT

router.post('/', async(req, res) =>{
    const {error} = validate(req.body);

    if(error) return res.status(400).send(error.details[0].message)

    try{
        const comment = new Comment(req.body)
        const result  = await comment.save()

        return res.status(200).send(result)
    }
    catch(e){
        res.status(400).send(e)
    }
})

// Reply Comment

router.post('/reply/:id', [auth, admin], async(req, res) =>{
    const {error} = validateReply(req.body);

    if(error) return res.status(400).send(error.details[0].message)

    try{
        const comment = await Comment.findById(req.params.id)
        if(!comment) return res.status(400).send({message:"Comment doesn't exist!"})

        comment.reply.push(req.body)
        const result  = await comment.save()

        return res.status(200).send({message:"Reply taken", data:result})
    }
    catch(e){
        res.status(400).send(e)
    }
})

// Delete Reply
router.delete('/reply/:id', [auth, admin], async(req, res) =>{

    try{
        const comment = await Comment.findById(req.params.id)
        if(!comment) return res.status(400).send({message:"Comment doesn't exist!"})

        comment.reply = []
        const result  = await comment.save()

        return res.status(200).send({message:"Reply deleted!", data:result})
    }
    catch(e){
        res.status(400).send(e)
    }
})



router.get('/', async(req, res) =>{
    const skip = parseInt(req.query.skip);
    const limit = parseInt(req.query.limit);
    const order = req.query.order

    try{
        const comments =  await Comment.find().skip(skip).limit(limit).sort({_id:order}).populate('product_id')
        if(!comments) return res.status(404).send({message:"No comment available yet!"})

        res.status(200).send(comments)
    }
    catch(e){
        res.status(400).send(e)
    }
})


// GET SINGLE COMMENT/

router.get('/:id', async (req, res)=>{
    try{
        const comment =  await Comment.findById(req.params.id)
        if(!comment) return res.status(404).send({message:"Comment not found!"})

        res.status(200).send(comment)
    }
    catch(e){
        res.status(400).send(e)
    }
   
})

// GET COMMENTS FOR SINGLE PRODUCT/
router.get('/product/:id', async (req, res)=>{
    try{
        const comment =  await Comment.find({product_id: req.params.id})
        // if(!product) return res.status(404).send({message:"Product not found!"})

        res.status(200).send(comment)
    }
    catch(e){
        res.status(400).send(e)
    }
   
})

// Update Product
// router.put('/:id', async (req, res) =>{
    
//     try{
//         const product =  await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})
//         if(!product) return res.status(404).send({message:"Not Found"})

//         res.status(200).send(product)
//     }
//     catch(e){
//         res.status(400).send(e)
//     }
    
// })


// DELETE COMMENT
router.delete('/:id',  [auth, admin], async (req, res) =>{
    try{
        const comment = await Comment.findByIdAndDelete(req.params.id)

        if(!comment) return res.status(400).send({message: "comment doesn't exist!"})

        res.status(200).send({
            message:"Comment Deleted!",
            comment
        })
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

module.exports = router
