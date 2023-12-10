const conn = require('./connection');
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const e = require('express');
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const Subplan1 = require("./models/subplan");
const Bcard1 = require("./models/bcard");
const cardt = require("./models/card");
const temp = require("./models/templates");
const bcrypt = require("bcrypt");
const path = require('path');
const adminModel = require('./models/admin');


// app.set("views", __dirname + "/views");
// app.set("view engine", "ejs");
const { ObjectId } = require('mongodb');
app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  


app.use('/public', express.static(__dirname + "/public"));


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
        password: req.body.password,
        subscription : {
            plan: fixedSubscriptionPlanId,
            expiresAt: fixedExpiresAt
        }
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






app.listen(8000, function () {
    console.log('Server started at port 8000');
   })

//admin login




app.get('/admin', async (req, res) => {
    try {
        const admin = await adminModel.findOne({ username: 'admins', password: 'admin' });

        if (admin) {
            // If the admin credentials are found, render the admin dashboard using EJS
            res.render('admin/index');  
        } else {
            // If admin credentials are not found, serve the login page from the admin folder using EJS
            res.render('admin/login');
        }
    } catch (error) {
        // Handle any errors, e.g., display an error page or redirect to login
        console.error(error);
        res.redirect('/');
    }
});

app.post('/admin', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await adminModel.findOne({ username });

        if (!user) {
            res.send("User does not exist");
        } else if (password === user.password) {
            res.render('admin/index');  // Render the admin dashboard using EJS
        } else {
            res.send("Invalid password");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/subscription',async (req, res) =>{

    const subscriptionPlans = await Subplan1.find();
    res.render('admin/subscription', { subscriptionPlans });
});

app.post('/subscription', async (req, res) => {
    try {
        const { name, price, duration } = req.body;

        const subscriptionPlan = new Subplan1({ name, price, duration });
        await subscriptionPlan.save();

        res.redirect('/subscription');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

// app.get('edit-subscription', async (req, res) => {
//     try {
//         // const subscriptionPlan = await Subplan1.findById(req.params.id);

//         res.render('admin/edit-subscription');
//     } catch (error) {
//         console.error(error);
//         res.status(500).send("Internal Server Error");
//     }
// });

app.post('/edit-subscription/:id', async (req, res) => {
    try {
        const { name, price, duration } = req.body;

        await Subplan1.findByIdAndUpdate(req.params.id, { name, price, duration });

        res.redirect('/subscription');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/add-subscription', async (req, res) => {
    try {
        res.render('admin/add-subscription');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});



app.post('/add-subscription', async (req, res) => {
    try {
        const { id, name, price, features } = req.body;

        // Handle the case where features might not be a valid JSON string
        let parsedFeatures;
        try {
            parsedFeatures = JSON.parse(features);
        } catch (jsonError) {
            console.error('Error parsing JSON:', jsonError);
            return res.status(400).send('Invalid JSON in features field');
        }

        const subscriptionPlan = new SubscriptionPlan({ id, name, price, features: parsedFeatures });
        await subscriptionPlan.save();

        res.redirect('/subscription');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});


app.get('/edit-subscription', async (req, res) => {
    try {
        // Your logic for fetching subscription plan data if needed
        // const subscriptionPlan = await Subplan1.findById(req.params.id);

        res.render('admin/edit-subscription');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/add-user', async (req, res) => {
    try {
        // Your logic for fetching subscription plan data if needed
        // const subscriptionPlan = await Subplan1.findById(req.params.id);

        res.render('admin/add-user');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/user-details', async (req, res) => {
    try {
        // Your logic for fetching subscription plan data if needed
        // const subscriptionPlan = await Subplan1.findById(req.params.id);

        res.render('admin/user-details');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.get('/user', async (req, res) => {
    try {
        // Your logic for fetching subscription plan data if needed
        // const subscriptionPlan = await Subplan1.findById(req.params.id);

        res.render('admin/user');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/user-grid', async (req, res) => {
    try {
        // Your logic for fetching subscription plan data if needed
        // const subscriptionPlan = await Subplan1.findById(req.params.id);

        res.render('admin/user-grid');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});