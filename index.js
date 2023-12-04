const express = require('express');
const conn = require('./connection');
const session = require('express-session');
const bodyParser = require("body-parser");
const e = require('express');
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
// app.use(express.static(__dirname + "public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use('/public', express.static('public'));

const defaultSessionSecret = 'mydefaultsecretkey';

app.use(session({
    secret: defaultSessionSecret,
    resave: false,
    saveUninitialized: true
}));


app.get('/', function (req, res) {
    res.render('index');
});


app.get('/login', async (req, res) => {
    res.render('login');
}
);

app.get('/register', async (req, res) => {
    res.render('register');
}
);

app.post('/register', async (req, res) => {
    const data ={
        username: req.body.username,
        password: req.body.password
    }

    // check if username already exists and password matches

    const exisitingUser = await User.findOne({username: data.username});
    if(exisitingUser){
        res.send("User already exists . please try again");

    }
    else{

        // hashing the password 

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword;

       const user = new User(data);
         await user.save();
            res.send("User created successfully");
            console.log("user");
    }
});

//  user login route

app.post('/login', async (req, res) => {

    try {
        const check = await User.findOne({username: req.body.username});
        if(!check){
            res.send("User does not exist");
        }
        else{
            const validPassword = await bcrypt.compare(req.body.password, check.password);
            if(validPassword){
                res.redirect("/");
            }
            else{
                res.send("Invalid password");
            }
        }
    } catch  {
        res.status(400).send("Invalid username or password");

    }
});







app.listen(8000, function () {
    console.log('Server started at port 3000');
   })
