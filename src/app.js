const express = require('express');
const path = require('path');
const morgan = require('morgan');
const index = require("./index")
require('./db/conn');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(morgan('dev'))
app.use(express.json());
app.use(express.urlencoded({extended:false}));
app.use('/', index.AuthRoute)


app.get("/", (req,res) => {
    res.send("hello")
})

app.listen(PORT, () => {
    console.log(`Express Running ${PORT}`)
})