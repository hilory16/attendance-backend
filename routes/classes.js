const express = require('express');
const router = express.Router();
const {Classes, validate} = require('../models/class');
const _ = require('lodash');
const bcrypt = require('bcrypt');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin')
const student = require('../middleware/student')
const instructor = require('../middleware/instructor')
const jwt = require('jsonwebtoken')
const config = require('config')
const nodemailer = require("nodemailer");
const Joi = require('joi')



//ADD A NEW CLASS - ACCESS = INSTRUCTOR And ADMIN
router.post('/',[auth, instructor], async(req, res) =>{
    const { error} = validate(req.body)
    if(error) return res.status(400).send({message:error.details[0].message})

    req.body.instructor_id = req.user._id

    try{
        let classes = await Classes.findOne({class_name:req.body.class_name, instructor_id:req.user._id})
        if(classes){
            return res.status(400).send({
                message:`You have an active ${req.body.class_name} class!`
            })
        }

        classes = new Classes(req.body)
        const result  = await classes.save()

        return res.status(200).send({message:`${req.body.class_name} class has been created successfully!`, result})
    }
    catch(e){
        res.status(400).send(e)
        console.log(e)
    }
})


// GET ALL CLASSES ---- ACCESSS = ADMIN ONLY
router.get('/',[auth, admin], async (req, res)=>{
    
    const order = req.query.order
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)

    try{
        const classes =  await Classes
        .find()
        .sort({_id:order})
        .limit(limit)
        .select("-password")
        .skip(skip)

        if(!classes) return res.status(404).send({message:"Class list is empty!"})
        res.status(200).send(classes)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
   
})

// GET ALL CLASSES BY AN INSTRUCTOR ---- ACCESSS = INSTRUCTOR ONLY
router.get('/instructor/',[auth, instructor], async (req, res)=>{
    
    const order = req.query.order
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)

    try{
        const classes =  await Classes
        .find({instructor_id:req.user._id})
        .sort({_id:order})
        .limit(limit)
        .select("-password")
        .skip(skip)

        if(!classes || classes.length < 1) return res.status(404).send({message:"Your class list is empty!"})
        res.status(200).send(classes)
    }
    catch(e){
        console.log(e)
        res.status(400).send(e)
    }
   
})


// GET SINGLE CLASS -- ACCESS = REGISTERED USER
router.get('/:id', auth, async (req, res)=>{

    try{
        const classes =  await Classes.findById(req.params.id)
        if(!classes) return res.status(404).send({message:"Class doesn't exist!"})

        res.status(200).send({message:"Class fetched successful!", classes})
    }
    catch(e){
        res.status(400).send(e)
    }
   
})

// UPDATE CLASS --- ACCESS = INSTRUCTOR (Later: Try to use .save() so users can't update role)
router.put('/:id', [auth, instructor], async (req, res) =>{
    try{
        const result = await Classes.findById(req.params.id)
        if(!result) return res.status(404).send({message:"Class Not Found!"})

        if(result.instructor_id != req.user._id) return res.status(403).send({message: "You cannot update a class you didn't create!"})


        result.isOpened = req.body.isOpened

        const classes = await result.save()

        res.status(200).send({
            message:"Class status updated!",
            classes
        })

    }
    catch(e){
        res.status(400).send(e)
    }
    
})


// DELETE CLASS -- ACCESS = ACCESS = INSTRUCTOR
router.delete('/:id',[auth, instructor], async (req, res) =>{
    try{
        const result = await Classes.findById(req.params.id)
        if(!result) return res.status(404).send({message: "Class doesn't exist!"})

        if(result.instructor_id != req.user._id) return res.status(403).send({message: "You cannot delete a class you didn't create!"})


        const classes = await Classes.findByIdAndDelete(req.params.id)

        res.status(200).send({
            message:"Class Deleted!",
            classes
        })
    }
    catch(e){
        res.status(400).send(e)
    }
})


module.exports = router