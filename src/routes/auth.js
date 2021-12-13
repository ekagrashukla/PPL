const express = require('express')
const router = express.Router()
const multer = require('multer')
const {upload} = require('../services/AuthService')

const AuthController = require('../controllers/AuthController')
const authenticate = require('../middlewares/authenticate')

router.post('/register', AuthController.register)
router.get('/verifyuserbyemail/:token', AuthController.verifyuserbyemail)
router.post('/login', AuthController.login)
router.post("/forgotpassword/:emailid", AuthController.forgotpassword)
router.post("/resetpassword/:emailid", AuthController.resetpassword)
router.post("/post", upload.single('post'),authenticate, AuthController.addpost)
router.get("/post/:postid", AuthController.getpostbyid)
router.get("/getpost", AuthController.getpost)
router.put("/post/like/:postid", authenticate, AuthController.likepost)
router.put("/post/unlike/:postid", authenticate,AuthController.unlikepost)
router.get("/myprofile", authenticate, AuthController.userprofile)
router.put("/updateprofile",authenticate, AuthController.editProfile)
router.post("/comment", authenticate, AuthController.addComment)
router.post("/changepassword", authenticate, AuthController.changePassword)
router.get('/comments', AuthController.getComments)
router.put("/post/flag/:postid", AuthController.flagPost)
router.post("/logout", authenticate,AuthController.logout)
router.put("/post/:postid", AuthController.editpost)

module.exports = router