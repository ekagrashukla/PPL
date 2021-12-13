const bcrypt = require("bcryptjs");
const { registerService, verifyuserbyemailService, loginService, forgotpasswordService, 
        resetpasswordService, addpostService, getpostbypostidService, getpostService, 
        likepostService, unlikepostService, userprofileService, editprofileServices, 
        addcommentService, changepasswordService, getcommentService, flagpostService, logoutService} = require('../services/AuthService');

const register = (req,res)          => bcrypt.hash(req.body.password, 10, (err,hashedPass)=> registerService(err, hashedPass,req,res));
const verifyuserbyemail = (req,res) => verifyuserbyemailService(req,res);
const login = (req,res)             => loginService(req,res);
const forgotpassword = (req,res)    => forgotpasswordService(req,res);
const resetpassword = (req,res)     => resetpasswordService(req,res);
const addpost = (req,res)           => addpostService(req,res);
const getpostbyid = (req,res)       => getpostbypostidService(req,res);
const getpost = (req,res)           => getpostService(req,res);
const likepost = (req,res)          => likepostService(req,res);
const unlikepost = (req,res)        => unlikepostService(req,res);
const userprofile = (req,res)       => userprofileService(req,res);
const editProfile = (req,res)       => editprofileServices(req,res);
const addComment = (req,res)        => addcommentService(req,res);
const changePassword = (req,res)    => changepasswordService(req,res);
const getComments = (req,res)       => getcommentService(req,res);
const flagPost = (req,res)          => flagpostService(req,res);
const logout = (req,res)            => logoutService(req,res)
module.exports = {
    register, userprofile, verifyuserbyemail,addpost, login, editProfile, forgotpassword, resetpassword, getpostbyid, getpost, likepost, unlikepost, addComment,
    changePassword, getComments, flagPost, logout
}