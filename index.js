const express = require('express');
const conn = require('./connection');
const session = require('express-session');
const bodyParser = require("body-parser");
const e = require('express');
const app = express();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "public"));
app.use(bodyParser.urlencoded({ extended: true }));

const defaultSessionSecret = 'mydefaultsecretkey';

app.use(session({
    secret: defaultSessionSecret,
    resave: false,
    saveUninitialized: true
}));


app.get("/",(req,res)=>{
    res.render("index.ejs");
})

app.get('/pranav',(req,res)=>{
    res.send("hello");
}

app.listen(8000, function () {
    console.log('Server started at port 3000');
   })
