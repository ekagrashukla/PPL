const jwt = require('jsonwebtoken')
const { User } = require('../models/User')

const authenticate = async (req,res,next) => {
    try{
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token,'verysecretvalue')
        console.log(decode.email)
        try {
            const dbtoken = await User.find({email:decode.email})
            const alltokens = (dbtoken[0].Authtokens)
            if(alltokens.includes(token)){
                let jwtExp = decode.exp
                let d = new Date()
                let currSec = Math.round(d.getTime()/1000)
                let timeLeft = (jwtExp-currSec)
                console.log(timeLeft)
                if(timeLeft < 300){
                    let refreshtoken = jwt.sign({email:decode.email}, 'refreshtokensecretvalue', {expiresIn: '10d'})
                    let msz = `Token about to expire in ${timeLeft} seconds...Here's the refresh token=> ${refreshtoken}`
                    res.header({"message":msz})
                    next()
                }
                else{
                    req.user = decode
                    next()
                }
            }
            else{
                res.send("User has been logged out!!! Login to continue")
            }
        } catch (error) {
            res.send("User has been logged out!!! Login to continue")
        }
        

    }
    catch(error){
        if(error.name == "TokenExpiredError") {
            res.status(401).json({
                message:"Token Expired!! Use refresh token or login again"
            })
        }
        else {
            res.json({
                message: error
            })
        }
    }
}

module.exports = authenticate