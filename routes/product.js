const express = require('express')
const router = express.Router()
const {Product, validate} = require('../models/class');
const auth = require('../middleware/auth')
const admin = require('../middleware/admin')
const formidable = require('formidable');
const cloudinary = require('cloudinary');
// ADD PRODUCT

router.post('/', [auth, admin], async(req, res) =>{
    
    // try{
        
        const form = formidable({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }
            const {error} = validate(fields);

            if(error) return res.status(400).send(error.details[0].message)
            const existingProduct = await Product.findOne({name:fields.name})
            if(existingProduct) return res.status(400).send({message:"This product exists!"})

            let image2 =""
            let image3 ="" 
            try{
                if(!files.image1) return res.status(400).send({message:"Cover Image cannot be empy!"})
                const image1 = await cloudinary.v2.uploader.upload(files.image1.path, {resource_type: "image", public_id: "",overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"});

                if(files.image2){
                    image2 = await cloudinary.v2.uploader.upload(files.image2.path, {resource_type: "image", public_id: "",overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"});

                }
                if(files.image3){
                    image3 = await cloudinary.v2.uploader.upload(files.image3.path, {resource_type: "image", public_id: "",overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"});
                }

                const images = [{url:image1.url, public_id:image1.public_id}, {url:image2.url, public_id:image2.public_id}, {url:image3.url, public_id:image3.public_id}]

                req.body = fields
                req.body.images = images

                const product = new Product(req.body)
                const result  = await product.save()
                // res.json({ fields, data:req.body, images });
                return res.status(200).send({message:"Product added successfully!", product: result})

            }
            catch(e){
                res.status(400).send(e)
            }
        });
       
    // }
    // catch(e){
    //     res.status(400).send(e)
    // }
})



router.get('/', async(req, res) =>{
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    const order = req.query.order
    const sortBy = req.query.sortBy
    // console.log(sortBy)
    try{
        const products =  await Product.find().sort(sortBy).limit(limit).skip(skip).populate("category")
        if(!products) return res.status(404).send({message:"No Product yet!"})

        res.status(200).send(products)
    }
    catch(e){
        console.log(e)
    }
})

router.get('/category/:categoryId', async(req, res) =>{
    const limit = parseInt(req.query.limit)
    const skip = parseInt(req.query.skip)
    const order = req.query.order
    const sortBy = req.query.sortBy
    const category = req.params.categoryId
    // console.log(sortBy)
    try{
        const products =  await Product.find({category}).sort(sortBy).limit(limit).skip(skip).populate("category")
        if(products.length < 1) return res.status(404).send({message:"No Product has been added to this category yet!"})

        res.status(200).send(products)
    }
    catch(e){
        console.log(e)
    }
})


// GET SINGLE PRODUCT

router.get('/:id', async (req, res)=>{
    try{
        const product =  await Product.findById(req.params.id).populate("category")
        if(!product) return res.status(404).send({message:"Product not found!"})

        res.status(200).send(product)
    }
    catch(e){
        res.status(400).send(e)
    }
   
})

// Update Product
router.put('/:id',  [auth, admin], async (req, res) =>{
        const form = formidable({ multiples: true });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                next(err);
                return;
            }
            // const {error} = validate(fields);

            // if(error) return res.status(400).send(error.details[0].message)

            
            let image1 = ""
            let image2 =""
            let image3 =""
            

            try{
                const product =  await Product.findById(req.params.id)
                if(!product) return res.status(404).send({message:"Not Found"})
                
                // return res.status(200).send({message:"Product!", product})

                const existingProduct = await Product.findOne({name:{$eq: fields.name}, _id: {$ne:req.params.id}})
                if(existingProduct) return res.status(400).send({message:"Product name already exists!"})

                // if(!files.image1) return res.status(400).send({message:"Cover Image cannot be empty!"})
                const {images} = product
                if(files.image1 || fields.image1){
                    
                    image1 = await cloudinary.v2.uploader.upload(files.image1 ? files.image1.path : fields.image1, {resource_type: "image", public_id:"sample" ,overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"});
                    console.log({img:image1})
                }
                
                if(files.image2 || fields.image2){
                    image2 = await cloudinary.v2.uploader.upload(files.image2 ? files.image2.path : fields.image2, {resource_type: "image", public_id: images[1] ? images[1].public_id : '',overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"});

                }
                
                if(files.image3 || fields.image3){
                    image3 = await cloudinary.v2.uploader.upload(files.image3 ? files.image3.path : fields.image3, {resource_type: "image", public_id: images[2] ? images[2].public_id : '',overwrite: true, notification_url: "https://mysite.example.com/notify_endpoint"});
                }
                // return res.status(200).send({message:"Product!"})


                const newImages = [{url:image1.url, public_id:image1.public_id}, {url:image2.url, public_id:image2.public_id}, {url:image3.url, public_id:image3.public_id}]




                req.body = fields
                req.body.images = newImages

                // const modifiedProduct = new Product(req.body)
                // const result  = await modifiedProduct.save()
                // res.json({ fields, data:req.body, images });
                const modifiedProduct =  await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})
                if(!modifiedProduct) return res.status(404).send({message:"Not Found"})
                return res.status(200).send({message:"Product updated successfully!", product: modifiedProduct})

            }
            catch(e){
                res.status(400).send(e)
            }
        });

    // const {error} = validate(req.body);

    // if(error) return res.status(400).send(error.details[0].message)
    
    // try{
    //     const product =  await Product.findByIdAndUpdate(req.params.id,req.body,{new:true})
    //     if(!product) return res.status(404).send({message:"Not Found"})

    //     res.status(200).send({message:"Product updated successfully", product})
    // }
    // catch(e){
    //     res.status(400).send(e)
    // }
    
})


// DELETE PRODUCT
router.delete('/:id',  [auth, admin], async (req, res) =>{
    try{
        const product = await Product.findByIdAndDelete(req.params.id)
        if(!product) return res.status(400).send({message: "Product doesn't exist!"})
        if(product.images[0].public_id){
            await cloudinary.uploader.destroy(product.images[0].public_id, function(result) { console.log(result) });
        }
        if(product.images[1].public_id){
            await cloudinary.uploader.destroy(product.images[1].public_id, function(result) { console.log(result) });
        }
        if(product.images[2].public_id){
            await cloudinary.uploader.destroy(product.images[2].public_id, function(result) { console.log(result) });
        }
        res.status(200).send({
            message:"Product Deleted!",
            product
        })
    }
    catch(e){
        res.status(400).send(e)
    }
    
})

module.exports = router
