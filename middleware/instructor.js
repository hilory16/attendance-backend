const jwt =  require('jsonwebtoken');
const config = require('config');


function instructor(req, res, next){
    
    if(req.user.role !== "admin" && req.user.role !== "instructor" ) return res.status(403).send({message:'Access denied'})

    next()


}

module.exports = instructor