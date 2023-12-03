const express = require('express');
const conn = require('./connection');
const session = require('express-session');
const bodyParser = require("body-parser");
const e = require('express');
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const bcrypt = require("bcrypt");
const path = require('path');


app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());


app.use('/public', express.static(__dirname + "/public"));


const defaultSessionSecret = 'mydefaultsecretkey';

app.use(session({
    secret: defaultSessionSecret,
    resave: false,
    saveUninitialized: true
}));

app.get("/health", async (req, res) => {
    try {
        // Check MongoDB connection
        await mongoose.connection.db.admin().ping();
        res.status(200).json({ status: 'MongoDB connection is healthy' });
    } catch (error) {
        console.error('MongoDB connection error during health check:', error);
        res.status(500).json({ status: 'MongoDB connection error' });
    }
});


app.get('/', function (req, res) {
    res.render('index');
});


app.get('/login', async (req, res) => {
    res.render('login/login');
}
);

app.get('/register', async (req, res) => {
    res.render('register/register');
}
);

app.post('/register', async (req, res) => {
    const data = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password
    }

    // check if username or email already exists
    const existingUser = await User.findOne({ $or: [{ username: data.username }, { email: data.email }] });

    if (existingUser) {
        res.send("Username or email already exists. Please try again");
    } else {
        // hashing the password
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);

        data.password = hashedPassword;

        const user = new User(data);
        await user.save();

        res.redirect('/login');
    }
});


app.post('/login', async (req, res) => {
    try {
        const input = req.body.usernameOrEmail;
        const isEmail = /\S+@\S+\.\S+/.test(input);

        let check;
        if (isEmail) {
            check = await User.findOne({ email: input });
        } else {
            check = await User.findOne({ username: input });
        }

        if (!check) {
            res.send("User does not exist");
        } else {
            const validPassword = await bcrypt.compare(req.body.password, check.password);
            if (validPassword) {
                res.redirect("/");
            } else {
                res.send("Invalid password");
            }
        }
    } catch (error) {
        res.status(400).send("Invalid username or password");
    }
});


app.get('/about', function (req, res) {
    res.render('/views/about/about.ejs');
});

app.get('/contact', function (req, res) {
    res.render('/views/contact/contact.ejs');
}
);



app.get('/admin', function (req, res) {
    res.sendFile(path.join(__dirname,'views','admin','index.html'));
}
);

app.listen(8000, function () {
    console.log('Server started at port 3000');
   })

//admin login

