const nodemailer = require("nodemailer");
const config = require("../../config.json");

var fs = require('fs');

function base64_encode(file) {
    var bitmap = fs.readFileSync(file);
    return (bitmap).toString('base64');
}

const sendmailService = async (userEmail, userName, reason ,verificationToken = null, postContents) => {

    console.log(reason)
    let testAccount = await nodemailer.createTestAccount();
    let transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.EMAIL,
        pass: config.PASS, 
      },
      tls:{
          rejectUnauthorized:false
      }
    });

    if(reason=="welcomeEmail"){
        var info = await transporter.sendMail({
            from: `"PPL 🐶" ${config.EMAIL}>`, 
            to: userEmail,
            subject: `Hello ${userName}!! Welcome to PPL 🐶` ,
            html: "<center><h1>🌼 Hello " +userName+ "!! 🌼</h1><h2>We are glad that you joined PPL.</h2>"+
            "Please verify your email here<br/><a href = 'http://localhost:3000/verifyuserbyemail/"+verificationToken+"'>"+
            "<img src='https://www.nutakugold.club/NUTAKUGenerator/images/verify.png'/></a></center><br/><br/>"+
            "Can't see the button? Copy & Paste this link in your browser<br/>"+
            "<a href = 'http://localhost:3000/verifyuserbyemail/"+verificationToken+"'"+">http://localhost:3000/verifyuserbyemail/"+verificationToken+"</a>"+
            "<br/><br/>PLease note that this link is valid only for 10 minutes, So Hurry Up!!"+
            "<h3>Team PPL</h3>"
        });
  
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
    else if(reason=="forgotPassword"){
        var info = await transporter.sendMail({
            from: `"PPL 🐶 " ${config.EMAIL}>`, 
            to: userEmail,
            subject: `Password Reset Link - PPL 🐶` ,
            html: "<center><h1>🌼 Hello " +userName+ "!! 🌼</h1><h2>Forgot your password?</h2>"+
            "No worries..Click here to reset your password<br/><a href = 'http://localhost:3000/resetpassword/"+userEmail+"'>"+
            "<img src='http://www.clker.com/cliparts/r/w/3/2/9/N/reset-button-blue-hi.png' width='250px'/></a></center><br/><br/>"+
            "Can't see the button? Copy & Paste this link in your browser<br/>"+
            "<a href = 'http://localhost:3000/resetpasswod/"+userEmail+"'"+">http://localhost:3000/resetpassword/"+userEmail+"</a>"+
            "<br/><br/>PLease note that this link is valid only for 10 minutes, So Hurry Up!!"+
            "<h3>Team PPL</h3>"
          });
  
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }

    else if(reason==="newPost"){
        var imageAsBase64 = fs.readFileSync(postContents.addr, 'base64');
        let source = 'data:image/jpg;base64,'+imageAsBase64
        var info = await transporter.sendMail({
            from: `"PPL 🐶 " ${config.EMAIL}>`, 
            to: userEmail,
            subject: `New Post Added- PPL 🐶` ,
            html: "<center><h1>🌼 Hello " +userName+ "!! 🌼</h1><h2>Your post was added successfully</h2>"+
            "<h3>Title: "+postContents.title+"</h3>"+
            "<h3>Category: "+postContents.catType+"</h3>"+
            "<img src='cid:xtx2pevfan@nodemailer.com' width='400px'/>"+
            "<h5>Thanks and regards</h5>"+
            "<h5>Team PPL</h5>",
            attachments: [{
                filename: postContents.filename,
                path: source,
                cid: 'xtx2pevfan@nodemailer.com' 
            }]
          });
    
    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
  }

  module.exports = {sendmailService}