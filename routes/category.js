const express = require('express')
const router = express.Router()
const {Category, validate} = require('../models/attendance_signed');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')

// ADD CATEGORY

router.post('/',  [auth, admin], async(req, res) =>{
    const {error} = validate(req.body);

    if(error) return res.status(400).send(error.details[0].message)

    try{
        let category =  await Category.findOne({name: req.body.name})
        if(category) return res.status(400).send({message:"Category exists!"})

        category = new Category(req.body)
        const result  = await category.save()

        return res.status(200).send({message:"New category added!",result})
    }
    catch(e){
        res.status(400).send(e)
    }
})



router.get('/', async(req, res) =>{
    const skip = parseInt(req.query.skip)
    const limit = parseInt(req.query.limit)
    const order = parseInt(req.query.order)
    const sortBy = req.query.sortBy

    try{
        const category =  await Category.find().skip(skip).limit(limit).sort(sortBy)
        if(!category) return res.status(404).send({message:"No Category yet!"})

        res.status(200).send(category)
    }
    catch(e){
        console.log(e)
    }
})


// GET SINGLE CATEGORY

router.get('/:id', async (req, res)=>{
    try{
        const category =  await Category.findById(req.params.id)
        if(!category) return res.status(404).send({message:"Category not found!"})

        res.status(200).send({message:"Category Fetched!",category})
    }
    catch(e){
        res.status(400).send(e)
    }
   
})

// Update CATEGORY
router.put('/:id', [auth, admin], async (req, res) =>{
    
    try{
        let category =  await Category.findOne({name: req.body.name})
        if(category) return res.status(400).send({message:"Category exists!"})

        category =  await Category.findByIdAndUpdate(req.params.id,req.body,{new:true})
        if(!category) return res.status(404).send({message:"Not Found"})

        res.status(200).send({message:"Category Updated!",category})
    }
    catch(e){
        res.status(400).send(e)
    }
    
})


// DELETE CATEGORY
router.delete('/:id', [auth, admin], async (req, res) =>{
    try{
        const category = await Category.findByIdAndDelete(req.params.id)

        if(!category) return res.status(400).send({message: "Category doesn't exist!"})

        res.status(200).send({
            message:"Category Deleted!",
            category
        })
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

module.exports = router
