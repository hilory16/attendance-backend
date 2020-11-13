const jwt =  require('jsonwebtoken');
const config = require('config');


function student(req, res, next){
    
    if(req.user.role !== "admin" && req.user.role !== "student" ) return res.status(403).send({message:'Access denied'})

    next()


}

module.exports = student