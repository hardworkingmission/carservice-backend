const jwt=require('jsonwebtoken')

const verifyToken = (req,res,next) => {
    const authorizationToken=req.headers.authorization
    if(authorizationToken){
        const token=authorizationToken.split(' ')[1]
        jwt.verify(token,process.env.ACCESS_SECRET,(err,decoded)=>{
            if(err){
                return res.status(403).send({message:"Forbidden access"})
            }else{
                req.decoded=decoded
                console.log(decoded)
                next()
            }
        })

    }else{
        return res.status(401).send({message:"Unauthorized access"})
    }
    //console.log(authorizationToken)
    
};

module.exports={verifyToken}