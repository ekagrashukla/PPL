const mongoose = require('mongoose');
const config = require("../../config.json")

const uri = config.URI

mongoose.connect(uri)
const db = mongoose.connection 

db.on('error',(err) => {
    console.log(err)
})
db.once('open',()=> {
    console.log("Database Connection Established")
})