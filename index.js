const conn = require('./connection');
const express = require('express');
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

app.get("/health", async (req, res) => {
    try {
        // Check MongoDB connection
        await conn.connection.db.admin().ping();
        res.status(200).json({ status: 'MongoDB connection is healthy and running sucessful' });
    } catch (error) {
        console.error('MongoDB connection error during health check:', error);
        res.status(500).json({ status: 'MongoDB connection error'});
    }
});


app.get("/",(req,res)=>{
    res.render("index.ejs");
})



app.listen(8000, function () {
    console.log('Server started at port 3000');
   })