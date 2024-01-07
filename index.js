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
const emp = require("./models/employee");
const bcrypt = require("bcrypt");
const path = require('path');
const adminModel = require('./models/admin');
const multer = require('multer');
const Image = require('./models/image');
const LogModel = require('./models/logModel');
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
    console.log('Server started at port 8000');
   })




// Log Model
const logModel = new LogModel();

// Middleware for logging route access
app.use(async (req, res, next) => {
    const routeAccessDetails = {
        method: req.method,
        path: req.path,
        query: req.query,
        params: req.params,
    };

    await logModel.logEvent('route_access', routeAccessDetails);
    next();
});



// Displaying all the logs
app.get('/_logs', async (req, res) => {
  try {
    const logs = await logModel.getAllLogs();
    console.log(logs);
    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});



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
        const businessCard = await BusinessCard.findByIdAndDelete(cardId);
    
        if (businessCard) {
          const s3 = new AWS.S3();
        
          const deleteObject = async (objectKey) => {
            const decodedObjectKey = decodeURIComponent(objectKey);
            const key1 = decodedObjectKey.split('.com/')[1];
            const params = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: key1, // Specify the folder path
            };
        
            try {
              await s3.deleteObject(params).promise();
              console.log(`Object deleted successfully: ${key1}`);
            } catch (error) {
              console.error(`Error deleting object: ${key1}`, error);
              throw error;
            }
          };
        
          await deleteObject(businessCard.Image);
          await deleteObject(businessCard.bgImg);
        }
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


app.post('/businesscard/:userId', upload.fields([
  { name: 'Image', maxCount: 1 },
  { name: 'bgImage', maxCount: 1 }
]), async (req, res) => {
  try {
    const userId = req.params.userId;
    const selectedItems = req.body.selectedItems;
    const selectedItemsObject = JSON.parse(selectedItems);
    const businessid = selectedItemsObject._id;

    const subscriptionPlan = selectedItemsObject.subscriptionPlan || {};
    const plan = subscriptionPlan.plan || '';
    const templateId = selectedItemsObject.template;
    const cardid = selectedItemsObject.cardType;
    const occasion = selectedItemsObject.occasion;
    const template = await temp.findById(templateId).lean();

    // Extract the files from req.files
    const images = req.files['Image'] ? req.files['Image'][0] : null;
    const bgImage = req.files['bgImage'] ? req.files['bgImage'][0] : null;

    const templateFields = template.fields && template.fields.map(field => ({
      fieldName: field.name,
      fieldValue: req.body[field.name] || '',
    }));

    const uploadToS3 = async (file, folder, filenamePrefix) => {
      const key = `${userId}_${cardid}_${templateId}_${plan}_${occasion}_${filenamePrefix}`;
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `${folder}/${key}`,
        Body: file.buffer,
        ContentType: file.mimetype,
      };
      const s3UploadResponse = await s3.upload(s3Params).promise();
      return s3UploadResponse.Location;
    };

    const image1Url = images ? await uploadToS3(images, 'cards_img', 'image') : null;
    const image2Url = bgImage ? await uploadToS3(bgImage, 'cards_img', 'bgimage') : null;

    console.log(templateFields);

    const filter = {
      user: userId,
      selectedCardType: cardid,
      selectedTemplate: templateId,
      selectedSubscriptionPlan: plan,
      _id: businessid
    };

    const update = {
      user: userId,
      selectedCardType: cardid,
      selectedTemplate: templateId,
      selectedSubscriptionPlan: plan,
      templateFields: templateFields,
      Image: image1Url,
      bgImg: image2Url,
      bgColor: req.body.bgColor || '',
    };

    const options = {
      upsert: true, // Creates a new document if no documents match the filter
      new: true, // Returns the modified document if found or the upserted document if created
    };

    const savedBusinessCard = await BusinessCard.findOneAndUpdate(filter, update, options);
    console.log(savedBusinessCard);

    const users1 = await fetchUserData();
    res.render('admin/user', { users1 });
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
    const uniqueid = new ObjectId();
    const key = `${uniqueid}_${req.params.id}`;
  
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `custompages_img/${key}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };
  
    const s3UploadResponse = await s3.upload(params).promise();

    const logoUrl = s3UploadResponse.Location;


    // Save the image to MongoDB
    const customizablePage = new cpages({
        _id: uniqueid,
        user: req.params.id,
        image: logoUrl,
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


app.get('/add-company',async(req,res)=>{
res.render('admin/add-company');
});


app.post('/company-details', upload.single('logo'),async(req, res) => {
    const { name, cname, cnum, cmail } = req.body;
    console.log(req.body);
    const file = req.file;
    
    const uniqueFilename = new ObjectId();
    const key = `${uniqueFilename}`;
  
    const params = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: `company_logo/${key}`,
      Body: file.buffer,
      ContentType: file.mimetype
    };
  
    const s3UploadResponse = await s3.upload(params).promise();

    const logoUrl = s3UploadResponse.Location;
    console.log(logoUrl);
    try{
    const newCompany = new mcompany({
        _id : uniqueFilename,
        logo: logoUrl,
        name,
        ceo: { name: cname, contact: cnum, email: cmail },
       
      });
  
      await newCompany.save();
      res.status(201).json({ message: 'Company added successfully', company: newCompany });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


app.get('/add-employee', async (req, res) => {

    const company= await mcompany.find();
    res.render('admin/add-employee',{company});
}   
);

app.post('/add-employee', upload.single('photo'), async (req, res) => {
    try {
      const { name, company, contact, email,address,rank, designation, empid, bid, area, teamSize, experience, achievements } = req.body;
      console.log(req.body);
      

      const file = req.file;
      const employeeId = new ObjectId();
      const key = `${company}_${employeeId}`;
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: `employee_img/${key}`,
        Body: file.buffer,
        ContentType: file.mimetype
        
      };
      const s3UploadResponse = await s3.upload(s3Params).promise();
      console.log(s3UploadResponse);
      const photoUrl = s3UploadResponse.Location;
      const newEmployee = new emp({
        _id : employeeId,
        photo: photoUrl,
        name,
        contact,
        email,
        address,
        rank,
        designation,
        employeeid : empid,
        branchid : bid,
        area,
        teamSize: teamSize || 0, // Set default value to 0 if not provided
        experience: experience || 0, // Set default value to 0 if not provided
        achievements: achievements || '', // Set default value to empty string if not provided
        company,
        name:name,
        company:company,
        contact:contact,
        email:email,
        address:address,
        rank:rank,
        designation:designation,
        employeeid:empid,
        branchid:bid,
        area:area,
        teamSize:teamSize,
        experience:experience,
        achievements:achievements,

      });
  
      // Save the document to the database
      await newEmployee.save();
      const employees = await emp.find();
      const companies = await mcompany.find();
      res.render('admin/employees-list',{employees,companies});
      res.status(201).json({ message: 'Employee added successfully', employee: newEmployee });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  app.get('/:companyName/:id', async (req, res) => {
    try {
      const companyName = req.params.companyName;
      const employeeid = req.params.id;
      const company = await mcompany.findOne({
        name: companyName,status: 1
      });
      console.log(company)
      if (!company) {
        return res.status(404).json({ message: 'Company not found' });
      }
  
      const employee = await emp.findOne({ _id: employeeid, company: company._id });
      console.log(employee);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }
      
      res.render('templates/company-auth/index', { employee,company });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

app.get('/global/:name', async function (req, res) {
    try {
      
      const user = await User.find({username: req.params.name});
      console.log(user);
      const pageData = await cpages.find( {user: user[0].id });
      console.log(pageData[0]);
      // Render the page with the retrieved data
      res.render('admin/globalpage', { pageData: pageData[0] });
    } catch (error) {
      console.error('Error executing Mongoose query:', error);
      // Handle the error appropriately (send an error response, etc.)
      res.status(500).send('Internal Server Error');
     }
  });


app.get('/companies-list', async (req, res) => {
    try {
     
      const companies = await mcompany.find();
  
      res.render('admin/companies-list', { companies});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

app.put('/update-company-status/:companyId', async (req, res) => {
    try {
      const companyId = req.params.companyId;
      const { action } = req.body;
  
      let status;
      if (action === 'activate') {
        status = 1;
      } else if (action === 'deactivate') {
        status = 0;
      } else {
        return res.status(400).json({ message: 'Invalid action' });
      }
  
      await mcompany.findByIdAndUpdate(companyId, { status });
      res.json({ message: `Company ${action}d successfully` });
      // const companies = await mcompany.find();
      // res.render('admin/companies-list', { companies});
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });

  
  app.get('/invitation',async(req,res)=>{
    res.render('admin/invitations');
  });


app.get('/employee-list',async(req,res)=>{
   const employees = await emp.find();
   const companies = await mcompany.find();
    res.render('admin/employees-list',{employees,companies});

    }
  );

// Post request to update employee details
app.post('/edit-employee/:employeeId', upload.single('photo'), async (req, res) => {
  const employeeId = req.params.employeeId;

  try {
      // Retrieve the employee by ID
      const employee = await emp.findById(employeeId);
      const companies = await mcompany.find();

      if (!employee) {
          return res.status(404).json({ error: 'Employee not found' });
      }

      // Update employee fields
      employee.name = req.body.name;
      employee.company = req.body.company;
      employee.contact = req.body.contact;
      employee.email = req.body.email;
      employee.address = req.body.address;
      employee.rank = req.body.rank;
      employee.designation = req.body.designation;
      employee.employeeid = req.body.empid;
      employee.branchid = req.body.bid;
      employee.area = req.body.area;
      employee.teamSize = req.body.teamSize || 0;
      employee.experience = req.body.experience || 0;
      employee.achievements = req.body.achievements || '';

      // Update employee photo if a new one is provided
      if (req.file) {
          const key = `${employee.company}_${employeeId}`;
          const s3Params = {
              Bucket: process.env.S3_BUCKET_NAME,
              Key: `employee_img/${key}`,
              Body: req.file.buffer,
              ContentType: req.file.mimetype
          };
          const s3UploadResponse = await s3.upload(s3Params).promise();
          employee.photo = s3UploadResponse.Location;
      }

      // Save the updated employee to the database
      const updatedEmployee = await employee.save();

      // Redirect to the employee listing page or any other page after successful update
      const employees = await emp.find();
      res.render('admin/employees-list', { employees ,companies});
  } catch (error) {
      console.error('Error updating employee:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.get('/edit-employee/:employeeId', async (req, res) => {
  try {
      const employeeId = req.params.employeeId;
      const employee = await emp.findById(employeeId);
      const companies = await mcompany.find();

      if (!employee) {
          return res.status(404).json({ error: 'Employee not found' });
      }

      res.render('admin/edit-employee', { employee, companies }); // Include 'companies' here
  } catch (error) {
      console.error('Error fetching employee for editing:', error);
      res.status(500).send('Internal Server Error');
  }
});


app.get('/delete-employee/:employeeId', async (req, res) => {
  try {
    const employeeId = req.params.employeeId;
    const employee = await emp.findByIdAndDelete(employeeId);

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Delete the image from S3
    const key = `employee_img/${employee.company}_${employee._id}`;
    const s3DeleteParams = {
      Bucket: process.env.S3_BUCKET_NAME,
      Key: key,
    };

    await s3.deleteObject(s3DeleteParams).promise();


    // Fetch companies data
    const companies = await mcompany.find(); // Assuming you have a model named Company

    const employees = await emp.find();
    res.render('admin/employees-list', { employees, companies });
  } catch (error) {
    console.error('Error deleting employee:', error);
    res.status(500).send('Internal Server Error');
  }
});

app.get('/user-manager', async (req, res) => {
  try {
      const users1 = await fetchUserData();
      res.render('admin/user-manager', { users1 });
  } catch (error) {
      console.error(error);
      res.status(500).send("Internal Server Error");
  }
});

app.post('/user-manager/:userId', async (req, res) => {
const userId = req.params.userId;

try {
    // Find and delete the user by ID
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) {
        return res.status(404).json({ error: 'User not found' });
    }

    // Redirect back to the current page (admin/user-manager)
    res.redirect('/admin/user-manager');
} catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal server error' });
}
});




app.get('/view-user/:userId', async (req, res) => {
const userId = req.params.userId;

try {
  const user = await User.findById(userId)
    .populate('selectedItems.cardType')
    .populate('selectedItems.template');

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  // Render the view with the user data and populated cardType and template
  res.render('admin/view-user', { user });
} catch (error) {
  console.error(error);
  return res.status(500).json({ error: 'Internal server error' });
}
});

app.get('/invitations',async(req,res)=>{
  const employees = await emp.find();
  res.render('admin/invitations',{employees});
  });


app.get("/custompages",async(req,res)=>{
  const employees = await emp.find();
  res.render('admin/custompages',{employees});
}
);