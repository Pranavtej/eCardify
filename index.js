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
const bcrypt = require("bcrypt");
const path = require('path');
const adminModel = require('./models/admin');
const multer = require('multer');
const Image = require('./models/image');
const Employee = require('./models/employeeschema');
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

const fs = require('fs');
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

app.get('/get-cards/:userId', async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await User.findById(userId)
      .populate({
        path: 'selectedItems.subscriptionPlan.plan',
        model: 'SubscriptionPlan',
        select: 'name',
    })
    .populate({
        path: 'selectedItems.cardType',
        model: 'CardType',
        select: 'name',
    });
      
      console.log(user);
      res.json({ cards: user.selectedItems });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

//card deletion code
app.post('/delete-card/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const cardId = req.body.cardId;

    await User.findByIdAndUpdate(userId, {
      $pull: { selectedItems: { _id: cardId } }
    });

    const users1 = await fetchUserData();
    res.render('admin/user', { users1 }); // Redirect to home or any desired route
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
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







app.get('/template1', (req, res) => {
    // Retrieve fixed values from query parameters
    const subscriptionPlanId = req.query.subscriptionPlan;
    const templateId = req.query.template;
    const cardTypeId = req.query.cardType;
  
    // Render the template.ejs file with fixed values
    res.render('template1', { subscriptionPlanId, templateId, cardTypeId });
  });
  



app.post('/template1', async (req, res) => {
    try {
        const { name, email, number, subscriptionPlan, occasion, cardType, template } = req.body;
        console.log(req.body);

        // Create a new user
        const Plan = new ObjectId(subscriptionPlan);
        const card = new ObjectId(cardType);
        const temp = new ObjectId(template);

        const newBusinnessCard = new BusinessCard({
            username,
            email,
            number,
            selectedItems: [
                {
                    occasion,
                    cardType: card,
                    template: temp,
                    subscriptionPlan: {
                        plan: Plan,
                    },
                },
            ],
        });

        // Save the user to the database
        const savedUser = await newUser.save();

        // Redirect to the edit page for the newly created user
        res.redirect(`/template1?userId=${savedUser._id}`);
    } catch (error) {
        console.error('Error creating user:', error);
        res.status(500).send('Internal Server Error');
    }
}
);

app.post('/generate-card/:userid', async (req, res) => {
    try {
        const cardId  = req.body.cardId;
        const userId = req.params.userid;
        
        
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Find the selected item with the given cardId
        const selectedItem = user.selectedItems.find(item => item._id.toString() === cardId);
        
        if (!selectedItem) {
            return res.status(404).json({ error: 'Selected item not found' });
        }

        const template = await temp.findById(selectedItem.template);
        

        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        const templateName = template.name;
        res.render(`admin/${templateName}`,{user,selectedItem});

    } catch (error) {
        console.error('Error generating card:', error);
        res.status(500).send('Internal Server Error');
    }
});



app.get('/cardlist', async (req, res) => {
    try {
        const users1 = await fetchUserData();
        res.render('admin/cardlist', { users1 });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
});


app.post('/businesscard/:userId',  upload.fields([  { name: 'Image', maxCount: 1 }, { name: 'bgImage', maxCount: 1 }
  ]), async (req, res) => {
     try {
        const  userId  = req.params.userId;
        const  selectedItems = req.body.selectedItems;       
        const selectedItemsObject = JSON.parse(selectedItems);
        const subscriptionPlan = selectedItemsObject.subscriptionPlan || {};
        const plan = subscriptionPlan.plan || '';
        const templateId=selectedItemsObject.template;
        const cardid=selectedItemsObject.cardType;
        const template =await temp.findById(templateId).lean();

        const imageUrl = req.files['Image'] ? req.files['Image'][0] : null;
        // path to the uploaded image
        const bgImage = req.files['bgImage'] ? req.files['bgImage'][0]: null; // path to the uploaded background image
        
        console.log(template);
        
const templateFields = template.fields && template.fields.map(field => ({
    fieldName: field.name,
    fieldValue: req.body[field.name] || '',
  }));
  console.log(templateFields);
        const businessCard = new BusinessCard({
            user: userId,
            selectedCardType: cardid,
            selectedTemplate: templateId,
            selectedSubscriptionPlan: plan,
            templateFields: templateFields,
            Image:imageUrl.buffer.toString('base64'),
            bgImg:bgImage.buffer.toString('base64'),
            bgColor:req.body.bgColor || '',
        });

        const savedBusinessCard = await businessCard.save();
        console.log(savedBusinessCard);
        res.render('admin/custompages',{userId});
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


app.post('/delete-user/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        // Find the user by ID and remove them
        const deletedUser = await User.findOneAndDelete({ _id: userId });;

        if (!deletedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        const users1 = await fetchUserData();
        res.render('admin/user', { users1 });
        
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});




function mapFields(formData, section) {
    const fieldNames = formData[`${section}Names`] || [];
    const fieldValues = formData[`${section}Values`] || [];
    const textColors = formData[`${section}TextColors`] || [];
    const textStyles = formData[`${section}TextStyles`] || [];
    const textSizes = formData[`${section}TextSizes`] || [];

    return fieldNames.map((name, idx) => {
      const fieldObj = {
        fieldName: name,
        value: fieldValues[idx] || '',
        textColor: textColors[idx] || '',
        textStyle: textStyles[idx] || '',
        textSize: textSizes[idx] || '',
      };
  
      // Additional fields based on section
      if (section === 'contactField') {
        fieldObj.icon = formData[`${section}Icons`] ? formData[`${section}Icons`][idx] : '';
      }
      
      return fieldObj;
    });
  }
  
 

app.post('/custompage/:id',upload.fields([{ name: 'image', maxCount: 1 }]),async(req,res)=>
{
    try{
    const formData = req.body;
    const imageFile = req.files['image'][0];
    const basicInformationFields = mapFields(formData, 'field');
    const contactInfoFields = mapFields(formData, 'contactField');
    const socialMediaFields = mapFields(formData, 'socialField');
    const buttons = [];


    // Iterate over the button fields in the form data
    for (let i = 0; i < formData.buttonFieldNames.length; i++) {
      const button = {
        fieldName: formData.buttonFieldNames[i],
        value: formData.buttonValues[i],
        textStyle: formData.buttonTextStyles[i],
        buttonColor: formData.buttonColors[i],
        buttonSize: formData.buttonSizes[i],
      };
      buttons.push(button);
    }
    

    // Save the image to MongoDB
    const customizablePage = new cpages({
        user: req.params.id,
        image: imageFile.buffer.toString('base64'),
        imageSize: formData.imageSize,
        basicInformationFields:basicInformationFields,
        contactInfoFields:contactInfoFields,
        additionalButtons: buttons,
        socialMediaFields:socialMediaFields,
      });

    // Save the data to MongoDB
    await customizablePage.save();
    console.log(customizablePage);
    res.status(201).send('Form submitted successfully!');
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }

});

