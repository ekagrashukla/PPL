const mongoose = require('mongoose')

const Post = mongoose.model(
    "Post",
    new mongoose.Schema({
        postUser:{
            type: String,
            required: true
        },
        title:{
            type: String
        },
        creatorImage:{
            type: String
        },
        creatorName:{
            type:String,
            default:"Anonymous"
        },
        createdOn:{
            type: Date,
            default: Date.now
        },
        catType:{
            type: String
        },
        comments:[
            {
                creatorId: {
                    type: String
                },
                creatorName: {
                    type: String
                },
                comment:{
                    type: String
                },
                commentedOn:{
                    type: Date,
                    default: Date.now
                }
            }
        ],
        commentcount:{
            type:Number,
            default:0
        },
        likecount:{
            type:Number,
            default:0
        },
        flagcount:{
            type:Number,
            default:0
        },
        flagby:[
            String
        ],
        postBody:{
            type: String
        },
        likedby:[
            String
        ] 
    })
)

module.exports = Post