const conn = require('./connection');
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const e = require('express');
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const SubscriptionPlan = require("./models/subplan");
const Bcard1 = require("./models/bcard");
const cardt = require("./models/card");
const temp = require("./models/templates");
const bcrypt = require("bcrypt");
const path = require('path');
const adminModel = require('./models/admin');
const multer = require('multer');


// app.set("views", __dirname + "/views");
// app.set("view engine", "ejs");
const { ObjectId } = require('mongodb');

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");
//const { ObjectId } = require('mongodb');
//app.set("views", __dirname + "/views");
//app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  


app.use('/public', express.static(__dirname + "/public"));


const defaultSessionSecret = 'mydefaultsecretkey';

app.use(session({
    secret: defaultSessionSecret,
    resave: false,
    saveUninitialized: true
}));


// multer confuguration

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });




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
    console.log('Server started at port 3000');
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
            res.render('admin/index');  
        } else {
            res.send("Invalid password");
        }
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

app.get('/index',async(req,res)=>{
   res.render('admin/index');
});


app.get('/subscription',async (req, res) =>{

    const subscriptionPlans = await SubscriptionPlan.find();
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

app.post('/edit-subscription', async (req, res) => {
    try {
        const { name, price, duration } = req.body;

        await SubscriptionPlan.findByIdAndUpdate(req.params.id, { name, price, duration });

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
        
      const { name, price, features } = req.body;

      const newPlan = new SubscriptionPlan({
        name,
        price,
        features: features.map(feature => ({ logoUrl: feature })),
      });
  
      // Save the document to MongoDB
      await newPlan.save();
  
      res.status(200).send('Subscription plan added successfully!');
    } catch (error) {
      console.error('Error saving subscription plan:', error);
      res.status(500).send('Internal Server Error');
    }
  });



app.get('/edit-subscription/:id', async (req, res) => {
    try {
        const plan = await SubscriptionPlan.findById(req.params.id);
        if (!plan) {
            return res.status(404).send('Subscription plan not found');
        }
        res.render('admin/edit-subscription', { plan });
    } catch (error) {
        console.error('Error fetching subscription plan:', error);
        res.status(500).send('Internal Server Error');
}
});

app.post('/edit-subscription/:id', async (req, res) => {
    const planId = req.params.id;
  
  try {
    
    const existingPlan = await SubscriptionPlan.findById(planId);

    if (!existingPlan) {
      return res.status(404).json({ error: 'Subscription plan not found' });
    }

   
    const { name, price, existingFeatures } = req.body;

    
    const updatedFeatures = existingFeatures.split(',');

   
    existingPlan.name = name;
    existingPlan.price = price;
    existingPlan.features = updatedFeatures;

    
    await existingPlan.save();
    const subscriptionPlans = await SubscriptionPlan.find();
    res.render('admin/subscription', { subscriptionPlans });
  } catch (error) {
    console.error('Error updating subscription plan:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
    });
    




    app.get('/add-user', async (req, res) => {
        try {
            // Fetch subscription plans, card types, and templates from the database
            const subscriptionPlans = await SubscriptionPlan.find();
            const cardTypes = await cardt.find();
            const templates = await temp.find();
    
            res.render('admin/add-user', { subscriptionPlans, cardTypes, templates });
        } catch (error) {
            console.error('Error fetching data for user form:', error);
            res.status(500).send('Internal Server Error');
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


app.get("/delete/:id",async(req,res)=>{
    let planid = req.params.id;
    try {
        
        if (!ObjectId.isValid(planid)) {
          return res.status(400).json({ error: 'Invalid ObjectId' });
        }
    
        
        const deletedPlan = await SubscriptionPlan.findByIdAndDelete(planid);
        const subscriptionPlans = await SubscriptionPlan.find();
    
        if (!deletedPlan) {
          return res.status(404).json({ error: 'Subscription plan not found' });
        }
    
        res.render('admin/subscription', { subscriptionPlans });
      } catch (error) {
        console.error('Error deleting subscription plan:', error);
        res.status(500).json({ error: 'Internal Server Error' });
      }
    

});


app.post('/add-user', async (req, res) => {
    try {
        const { username, email, number, subscriptionPlan, occasion, cardType, template } = req.body;
        console.log(req.body);
        // Validate the form data
        // if (!username || !email || !phoneNumber || !subscriptionPlan || !occasion || !cardType || !template) {
        //     return res.status(400).json({ error: 'Username, email, phone number, subscription plan, occasion, card type, and template are required' });
        // }

        // Create a new user
        const Plan= new ObjectId(subscriptionPlan);
        const card=new ObjectId(cardType);
        const temp= new ObjectId(template);
        const newUser = new User({
            username,
            email,
            number,
            selectedItems: [
                {
                    occasion,
                    cardType: card,
                    template: temp,
                    subscriptionPlan: { 
                        plan:Plan,
                    },
                },
            ],
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Redirect or respond as needed
        console.log(savedUser);
        res.render('admin/user'); // Redirect to a success page
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
});
