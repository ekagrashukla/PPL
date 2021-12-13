const mongoose = require('mongoose')
const Joi = require('joi');

const User = mongoose.model(
    "User",
    new mongoose.Schema({
        username: {
            type:String
        },
        email: {
            type : String
        },
        password: {
            type: String,
        },
        confirmpassword:{
            type: String,
        },
        isVerified: {
            type: Number,
            default: 0
        },
        role: {
            type: String,
        },
        posts:[
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Post"
            }
        ],
        Authtokens:[
            {
                type: String
            }
        ]
    })
)

function validateUser(user) {
    const schema = Joi.object(
        {email: Joi.string().min(6).required().email(),
        firstname: Joi.string().min(2),
        lastname: Joi.string().min(2),
        password: Joi.string().min(3),
        confirmpassword: Joi.string().min(3),
        role: Joi.string()
    }
        );
    const validation = schema.validate(user)
    return validation
}

module.exports = {User, validateUser}