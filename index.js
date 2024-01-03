const conn = require('./connection');
const express = require('express');
const session = require('express-session');
const bodyParser = require("body-parser");
const e = require('express');
const app = express();
const mongoose = require("mongoose");
const User = require("./models/user");
const SubscriptionPlan = require("./models/subplan");
const BusinessCard = require("./models/bcard");
const cardt = require("./models/card");
const temp = require("./models/templates");
const cpages = require("./models/custompages");
const mcompany = require("./models/company");
const bcrypt = require("bcrypt");
const path = require('path');
const adminModel = require('./models/admin');
const multer = require('multer');
const Image = require('./models/image');
const Employee = require('./models/employeeschema');

const { ObjectId } = require('mongodb');
const AWS = require('aws-sdk');
const dotenv = require('dotenv');

dotenv.config();

app.set("views", __dirname + "/views");
app.set("view engine", "ejs");

app.use(express.static(__dirname + "/public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));  


app.use('/public', express.static(__dirname + "/public"));

const fs = require('fs');
const defaultSessionSecret = 'mydefaultsecretkey';

app.use(session({
    secret: defaultSessionSecret,
    resave: false,
    saveUninitialized: true
}));

AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
  });
  
const s3 = new AWS.S3();


const storage = multer.memoryStorage();
const upload = multer({ storage: storage });


app.get('/', function (req, res) {
    res.render('landing/index');
});


app.get('/login', async (req, res) => {
    res.render('login/login');
}
);

app.get('/register', async (req, res) => {
    res.render('register/register');
}
);



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

// getting subscription details 

app.get('/add-subscription', async (req, res) => {
    try {
        res.render('admin/add-subscription');
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});

//add subscription plan

app.post('/add-subscription', async (req, res) => {
    try {
        const { name, price, featureNames } = req.body;
    
        
        if (!name || !price || !featureNames || !Array.isArray(featureNames)) {
          return res.status(400).json({ error: 'Invalid data format' });
        }
    
        
        const newSubscriptionPlan = new SubscriptionPlan({
          name,
          price,
          features: featureNames,
        });
    
        
        await newSubscriptionPlan.save();
    
        const subscriptionPlans = await SubscriptionPlan.find();
        res.render('admin/subscription', { subscriptionPlans });
      } catch (error) {
        console.error('Error adding subscription plan:', error);
        res.status(500).json({ error: 'Internal Server Error' });
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

app.post('/add-card', async (req, res) => {

    const mobileNumber = req.body.phoneNumber; // Get the entered mobile number
  
    try {
      // Check if the user already exists based on the mobile number
      const existingUser = await User.findOne({ number: mobileNumber });
      console.log(existingUser);
      if (existingUser) {
        // If the user exists, you can redirect to the add-card page or perform necessary actions
        const subscriptionPlans = await SubscriptionPlan.find();
        const cardTypes = await cardt.find();
        const templates = await temp.find();
    
        res.render('admin/add-card', { existingUser, subscriptionPlans, cardTypes, templates });
         // Redirect to the add-card page with the user ID
      } else {
        // If the user doesn't exist, you can handle it as needed, such as displaying an error message
        res.send('User not found. Please register.');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  });

app.post('/update-cards', async (req, res) => {
    const { username, email, number, subscriptionPlan, occassion, cardType, template } = req.body
    console.log(req.body);
  try {
    // Find the user by mobile number
    const user = await User.findOne({ number: number });

    if (!user) {
      return res.status(404).send('User not found');
    }

    // Push the new card details and subscription plan to the user's selectedItems array
    const newSelectedItem = {
        occasion:occassion,
        cardType: cardType,
        template: template,
        subscriptionPlan: {
          plan: subscriptionPlan,
        },
        // Add other necessary fields for the new item
      };
  
      // Push the new item to the selectedItems array
      user.selectedItems.push(newSelectedItem);
  
      // Save the updated user object
      await user.save();
      const users1 = await fetchUserData();
      res.render('admin/user', { users1 });
    
  } catch (error) {
    console.error('Error adding card:', error);
    return res.status(500).send('Internal Server Error');
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


const fetchUserData = async () => {
    try {
        const users = await User.find()
            .populate({
                path: 'selectedItems.subscriptionPlan.plan',
                model: 'SubscriptionPlan',
                select: 'name',
            })
            .populate({
                path: 'selectedItems.cardType',
                model: 'CardType',
                select: 'name',
            })
            .populate({
                path: 'selectedItems.template',
                model: 'Template',
                select: 'name',
            });
        return users;
    } catch (error) {
        throw error;
    }
};

app.get('/user', async (req, res) => {
    try {
        const users1 = await fetchUserData();
        res.render('admin/user', { users1 });
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
          


// app.post('/add-user', async (req, res) => {
//     try {
//         const { username, email, number, subscriptionPlan, occasion, cardType, template } = req.body;
//         console.log(req.body);

//         // Create a new user
//         const Plan = new ObjectId(subscriptionPlan);
//         const card = new ObjectId(cardType);
//         const temp = new ObjectId(template);

//         const newUser = new User({
//             username,
//             email,
//             number,
//             selectedItems: [
//                 {
//                     occasion,
//                     cardType: card,
//                     template: temp,
//                     subscriptionPlan: {
//                         plan: Plan,
//                     },
//                 },
//             ],
//         });

//         // Save the user to the database
//         const savedUser = await newUser.save();

//         // Redirect to the edit page for the newly created user
//         res.redirect(`/template1?userId=${savedUser._id}`);
//     } catch (error) {
//         console.error('Error creating user:', error);
//         res.status(500).send('Internal Server Error');
//     }
// });

app.get('/imageupload', async (req, res) => {
    try {
      const data = await Image.find({});
      res.render('admin/image', { items: data });
    } catch (err) {
      console.error(err);
      res.status(500).send('Internal Server Error');
    }
  });
  
//   app.post('/imageupload', upload.single('image'), async (req, res) => {
//     try {
//       const obj = {
//         name: req.body.name,
//         desc: req.body.desc,
//         img: {
//           data: await fs.readFileAsync(path.join(__dirname, 'uploads', req.file.filename)),
//           contentType: 'image/png',
//         },
//       };
//       await Image.create(obj);
//       res.redirect('/');
//     } catch (err) {
//       console.error(err);
//       res.status(500).send('Internal Server Error');
//     }
//   });





  app.post('/add-user', async (req, res) => {
    try {
        // ... (validate and sanitize user input)

        // Extract selected values
        const subscriptionPlanId = req.body.subscriptionPlan;
        const templateId = req.body.template;
        const cardTypeId = req.body.cardType;

        // Create a new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            number: req.body.number,
            selectedItems: [
                {
                    occasion: req.body.occassion,
                    cardType: cardTypeId,
                    template: templateId,
                    subscriptionPlan: {
                        plan: subscriptionPlanId,
                        expiresAt: req.body.expiresAt,
                    },
                },
            ],
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Redirect to the template page with selected values as query parameters
        const users1 = await fetchUserData();
        res.render('admin/user', { users1 });
    } catch (error) {
        // Handle errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

  


app.get('/edit-user/:userId', async (req, res) => {
    try {
        const userId = req.params.userId;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const subscriptionPlans = await SubscriptionPlan.find();
        const cardTypes = await cardt.find();
        const templates = await temp.find();
    
        res.render('admin/edit-user', { user,subscriptionPlans, cardTypes, templates });
    } catch (error) {
        console.error('Error fetching user for editing:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/edit-user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Retrieve the user by ID
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Update user fields
        user.username = req.body.username;
        user.email = req.body.email;
        user.number = req.body.number;

        // Clear existing selectedItems array
        user.selectedItems = [];

        // Get the number of selectedItems from the hidden field
        const selectedItemsCount = parseInt(req.body.selectedItemsCount, 10);

        // Iterate over form fields to reconstruct selectedItems array
        for (let index = 0; index < selectedItemsCount; index++) {
            user.selectedItems.push({
                occasion: req.body[`occasion_${index}`],
                cardType: new ObjectId(req.body[`cardType_${index}`]),
                template: new ObjectId(req.body[`template_${index}`]),
                subscriptionPlan: {
                    plan: new ObjectId(req.body[`subscriptionPlan_${index}`]),
                },
                // Add other fields if needed
            });
        }

        // Save the updated user to the database
        const updatedUser = await user.save();

        // Redirect to the user listing page or any other page after successful update
        const users1 = await fetchUserData();
        res.render('admin/user', { users1 });
    } catch (error) {
        console.error('Error updating user:', error);
        res.status(500).send('Internal Server Error');
    }
});

app.post('/delete-user/:userId', async (req, res) => {
    const userIdToDelete = req.params.userId;

    try {
        // Find the user by ID and remove it from the database
        const deletedUser = await User.findByIdAndDelete(userIdToDelete);

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Redirect to the user listing page or any other page after successful deletion
        const users1 = await fetchUserData(); // Replace with your data-fetching logic
        res.render('admin/user', { users1 });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.post('/generate-card',async(req,res)=>
{
    console.log(req.body);
    res.json(req.body);
});