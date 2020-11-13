const express = require('express');
const app = express();
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const config = require('config')
const _ = require('lodash');
const moment = require('moment');
const multer = require('multer');
const cloudinary = require('cloudinary');
const nodemailer = require("nodemailer");
const exphbs = require('express-handlebars')
const {User, validate} = require('./models/user');


const users = require('./routes/users');
const auth = require('./routes/auth');
const classes = require('./routes/classes');
const student_class = require('./routes/student_class');

const formidable = require('formidable');

const jwt = require('jsonwebtoken')
// const Attendance = require('./routes/attendance')


app.use(express.json());
app.use(function(req, res, next){
    res.header("Access-Control-Allow-Origin", "*")
    res.header("Access-Control-Allow-Methods", "*");
    res.header("Access-Control-Allow-Headers", "*");
    next()
})

app.use('/api/auth', auth)
app.use('/api/users', users)
app.use('/api/classes', classes)
app.use('/api/classes/join', student_class)
// app.use('/api/product', product);
// app.use('/api/comment', comment)
// app.use('/api/category', category)
// app.use('/api/order', order)

if(!config.get('jwtPrivateKey')){
    console.error('FATAL ERROR: jwtPrivateKey is not defined in environment variable!')

    process.exit(1)
}
// console.log("Hello" + config.get('jwtPrivateKey'))

mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/attendance')

app.get('/api', (req, res) =>{
    res.status(200).send({
        status:true
    })
})



const port = process.env.PORT || 5000


app.listen(port, () =>{
    console.log(`Server is running on port ${port}`)
})
