const {User,validateUser} = require('../models/User')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Post = require('../models/Post');
const { getMaxListeners } = require('../models/User');
const mongoose = require('mongoose')
const multer = require('multer')
const {sendmailService} = require('../helpers/helpers')
const config = require("../../config.json")

const storage = multer.diskStorage({
    destination: function(req,file, cb){
        cb(null, './uploads/')
    },
    filename: function(req,file, cb) {
        cb(null, new Date().toISOString()+file.originalname);
    }
})

const fileFilter = (req, file, cb) => {
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/jpg' || file.mimetype === 'image/png'){
        cb(null, true)
    }
    else {
        cb(null, false)
    }
}

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 *10
    }, 
    fileFilter: fileFilter
})



async function registerService(err, hashedPass, req, res){
    console.log(req.body)
    const {error} = validateUser(req.body)
    console.log(error)
    if(error) {
        return res.send(error)
    }
    if(err){
        res.json({
            error:err
        })
    }
    else if(req.body.password!=req.body.confirmpassword){
        res.json({
            error: "Password does not match with confirm password"
        })
    }
    else{
        try {
            const fname = req.body.firstname;
            const lname = req.body.lastname;
            const uname = fname+" "+lname
        let user = new User ({
            username: uname,
            email: req.body.email,
            password: hashedPass,
            role: req.body.role
        })
            await user.save()
            res.json({
                message: "User Added Successfully"
            })
            let verificationToken = jwt.sign({email:req.body.email}, config.SECRET, {expiresIn: '10m'})
            sendmailService(req.body.email, req.body.firstname,"welcomeEmail",verificationToken)

        } catch (error) {
            res.json({
                message: error
            })   
        }
    }
}

const verifyuserbyemailService = async(req,res) => {
    const {token} = req.params;
    const email = (jwt.verify(token.toString(),config.SECRET)).email
    try {
        const data = await User.findOne({email:email})
        console.log(data)
        data.isVerified = 1
        await data.save()
        res.send("EmailID Verified Successfully.. You may <a href='/login'>login </a> to continue.")
    } catch (error) {
        res.send(error)
    }
}

const loginService = (req,res) => {
    var email = req.body.email
    var password = req.body.password
    User.findOne({email:email})
    .then(user => {
        if(user){
            bcrypt.compare(password,user.password, async function(err,result){
                if(err) {
                    res.json({
                        error:err
                    })
                }
                if(result){
                    let token = jwt.sign({email:user.email}, config.SECRET, {expiresIn: '10d'})
                    let refreshtoken = jwt.sign({email:user.email}, 'refreshtokensecretvalue', {expiresIn: '10d'})
                    const data = await User.findOneAndUpdate(
                        {email:user.email},
                        { $push: {Authtokens:token}},
                        {new: false, useFindAndModify: true}
                    );
                    res.json({
                        message: 'Login Successful',
                        token:token,
                        refreshtoken:refreshtoken
                    })
                }else{
                    res.json({
                        message: 'Password does not match'
                    })
                }
            })
        }else{
            res.json({
                message: "No user found"
            })
        }
    })
}

const forgotpasswordService = async(req,res) => {
    const {emailid} = req.params
    try {
        const data = await User.findOne({email:emailid})
        let resettoken = jwt.sign({email:emailid}, config.SECRET, {expiresIn: '10m'})
        sendmailService(emailid, data.firstname, "forgotPassword",resettoken)
        res.send(resettoken)
    } catch (error) {
        res.send("No user with provided email id exists")
    }
}

const resetpasswordService = async (req,res) => {
    const newpassword = req.body.newpassword
    const token = req.body.token
    const emailid = (jwt.verify(token.toString(),config.SECRET)).email
    try {
        console.log(newpassword)
        const data = await User.findOne({email:emailid})
        console.log(data)
        bcrypt.hash(newpassword, 10, async (err, hashedPass) => {
            if(err){
                res.json({
                    error:err
                })
            }
                console.log(hashedPass)
                data.password = hashedPass
                await data.save()
                res.send("Password changed successfully")
            })
    } catch (error) {
        res.send(error)
    }
}

const addpostService = async(req,res) =>{
    try{
        const postemail = req.body.email
        const creatorname = req.body.creatorname

        let post = new Post ({
            postUser: postemail,
            title: req.body.title,
            creatorName: req.body.creatorname,
            catType: req.body.cattype,
            postBody: req.file.path
        })
        const postid = post._id
        await post.save()
        console.log("post added successfully")
        const data = await User.findOneAndUpdate(
            {email:postemail},
            { $push: {posts:postid}},
            {new: true, useFindAndModify: false}
        );
        console.log("Postid added to User successfully");
        sendmailService(postemail, creatorname, "newPost", null, {"title":req.body.title, "creatorname":creatorname, "catType": req.body.cattype, "addr":req.file.path})
        res.json({
            message: "Post Added Successfully and Post id added to User successfully"
        })
    } catch(error) {
        res.status(400).send(error)
    }
}

const getpostbypostidService = async (req,res) => {
    try{
        const postid = req.params.postid
        const postContent = await Post.findById({_id:postid})
        console.log(postid)
        res.send(postContent);
    }
    catch(error){
        res.send("Post with given id does not exists");
    }
}

const getpostService = async (req,res) => {
    const flagged = req.body.flagged;
    const category = req.body.category;
    const sortby = req.body.sortby;
    const limit = req.body.limit;
    const skip = req.body.skip;
    try {
        const postContent = await Post.find({catType:category}).limit(limit).skip(skip).sort({sortby: 1})
        res.send(postContent)
    } catch (error) {
        res.send(error)
    }
}

const likepostService = async(req,res) => {
    try {
        const postid = req.params.postid
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token,'verysecretvalue')
        const email = decode.email

        Post.aggregate([{$project:{"isPresent":{$in:[email,"$likedby"]}}}])
        .then((response)=>{
            console.log(response[0].isPresent)
            if(response[0].isPresent==true){
                res.send("already liked")
            }
            else{
                Post.findOneAndUpdate(
                    {_id:postid},
                    { $push: {likedby:email}},
                    {new: true, useFindAndModify: false}
                ).then((response)=> {
                    Post.findOneAndUpdate(
                        {_id:postid},
                        { $inc: { likecount: 1 }},
                        {new: true}
                    ).then((response)=>{
                        res.send("Post liked and counter updated (incremented)")
                    })
                })
                .catch((err)=> {
                    res.send("cannot like this post")
                })
            }
        })
    } catch (error) {
        res.send("Something went wrong")
    }
}

const unlikepostService = async(req,res) => {
    try {
        const postid = req.params.postid;
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token,'verysecretvalue')
        const email = decode.email;
        Post.aggregate([{$project:{"isPresent":{$in:[email,"$likedby"]}}}])
        .then((response)=>{
            console.log(response[0].isPresent)
            if(response[0].isPresent==false){
                res.send("not liked")
            }
            else{
                Post.findOneAndUpdate(
                    {"_id":postid},
                    { $pull: {likedby:email}},
                    {new: true, useFindAndModify: false}
                ).then((response)=> {
                    Post.findOneAndUpdate(
                        {_id:postid},
                        { $inc: { likecount: -1 }},
                        {new: true}
                    ).then((response)=>{
                        res.send("Post unliked and counter updated (decremented)")
                    })
                })
                .catch((err)=>{
                    res.send("cannot unlike this post")
                })
            }
        })
    } catch (error) {
        res.send("Something went wrong")
    }
}

const userprofileService = async (req,res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token,config.SECRET)
    const email = decode.email
    const profileData = await User.find({email:email})
    res.send(profileData)
}

const editprofileServices = async (req,res) => {
    let user = (req.body)

    try {
        if (typeof req.body.email !== 'undefined' || (typeof req.body.password !== 'undefined')){
            throw new Error
        }
         
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token,config.SECRET)
        const email = decode.email
        const update = await User.findOneAndUpdate(
            {email:email},
            user
        )
        res.send("User Profile Updated Successfully")
    } catch (error) {
        res.send("Email or password cannot be updated..Try using /changepassword endpoint for changing password")
    }  

}

const addcommentService = async (req,res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token,'verysecretvalue')
    console.log(decode)
    const comment = req.body.comment
    const postid = req.body.postid
    Post.findOneAndUpdate({"_id":postid},{$push:{"comments":{creatorId: decode.email,creatorName: req.body.name,comment: req.body.comment}}})
    .then((response)=>{
        Post.findOneAndUpdate(
            {_id:postid},
            { $inc: { commentcount: 1 }},
            {new: true}
        ).then((response)=>{
            res.send("Comment Added and counter updated (incremented)")
        })
    })
}

const changepasswordService = async (req,res) => {
    const newPassword = req.body.newpassword
    console.log(newPassword)
    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token,config.SECRET)
    const email = decode.email
    console.log(email)
    
    const data = await User.findOne({email:email})
        console.log(data)
        bcrypt.hash(newPassword, 10, async (err, hashedPass) => {
            if(err){
                res.json({
                    error:err
                })
            }
                console.log(hashedPass)
                data.password = hashedPass
                await data.save()
                res.send("Password changed successfully")
            })
}

const getcommentService = async (req,res) => {
    const postid = req.body.postid
    const limit = req.body.limit
    const skip = req.body.skip
    const data = await Post.findOne({"_id":postid},{comments:{$slice:[skip, limit]}})
    console.log(data.comments)
    res.send(data.comments)
}

const flagpostService = async(req,res) => {
    try {
        const postid = req.params.postid
        const token = req.headers.authorization.split(' ')[1]
        const decode = jwt.verify(token,'verysecretvalue')
        const email = decode.email

        Post.aggregate([{$project:{"isPresent":{$in:[email,"$flagby"]}}}])
        .then((response)=>{
            console.log(response[0].isPresent)
            if(response[0].isPresent==true){
                res.send("already flagged")
            }
            else{
                Post.findOneAndUpdate(
                    {_id:postid},
                    { $push: {flagby:email}},
                    {new: true, useFindAndModify: false}
                ).then((response)=> {
                    Post.findOneAndUpdate(
                        {_id:postid},
                        { $inc: { flagcount: 1 }},
                        {new: true}
                    ).then((response)=>{
                        res.send("Post flagged and counter updated (incremented)")
                    })
                })
                .catch((err)=> {
                    res.send("cannot flag this post")
                })
            }
        })
    } catch (error) {
        res.send("Something went wrong")
    }
}

const logoutService = async (req,res) => {
    const token = req.headers.authorization.split(' ')[1]
    const decode = jwt.verify(token,'verysecretvalue')
    const user = await User.findOneAndUpdate({email:decode.email},{Authtokens:[]})
    console.log(user)
    res.send("logged out")
} 

module.exports = {
    registerService, verifyuserbyemailService, 
    loginService, forgotpasswordService, 
    resetpasswordService, addpostService,
    getpostbypostidService, getpostService,
    likepostService, unlikepostService, userprofileService,
    editprofileServices, addcommentService, 
    changepasswordService, upload, getcommentService,
    flagpostService, logoutService
}