require('dotenv').config()//loads env vars

//___________________
//Dependencies
//___________________
const express = require('express');//import express
const morgan = require("morgan")// import morgan
const methodOverride = require('method-override');//to use destroy method 
const mongoose = require ('mongoose');
const db = mongoose.connection;
//___________________
//Port
//___________________
// Allow use of Heroku's port or your own local port, depending on the environment
const PORT = process.env.PORT;

//___________________
//Database
//___________________
// How to connect to the database either via heroku or locally
const MONGODB_URI = process.env.MONGODB_URI;

// Connect to Mongo &
// Fix Depreciation Warnings from Mongoose
// May or may not need these depending on your Mongoose version
mongoose.connect(MONGODB_URI , { 
    useNewUrlParser: true, 
    useUnifiedTopology: true }
);

// Error / success
mongoose.connection
.on("open", () => console.log("Connected to Mongo"))
.on("close", () => console.log("Disconnected From Mongo"))
.on("error", (error) => console.log(error))

/////////////////////////////////////////
// Our Model
/////////////////////////////////////////
const {Schema, model} = mongoose

const logSchema = new Schema({
    name: String,
    weight: Number,
    noteToSelf: String,
})

const Log = model("Log", logSchema)
///////////////////////////////////////////////////////////////////////

//create app object 
const app = express();

//___________________
//Middleware
//___________________

app.use(morgan("huge"))//logging 

//use public folder for static assets
app.use(express.static('public'));

// populates req.body with parsed info from forms - if no data from forms will return an empty object {}
app.use(express.urlencoded({ extended: false }));// extended: false - does not allow nested objects in query strings
app.use(express.json());// returns middleware that only parses JSON - may or may not need it depending on your project

//use method override
app.use(methodOverride('_method'));// allow POST, PUT and DELETE from a form


//___________________
// Routes
//___________________
//localhost:3000
app.get("/" , (req, res) => {
  res.send('Hello World!');
});

app.get("/logs/seed", (req,res) =>{
    //array of starter log 
    const startLogs = [
        {name: "Blake", weight: 190, noteToSelf: "I want to be as muscular as Zen and I hate Kombucha"},
        {name: "Matt", weight: 150, noteToSelf: "I want to be as muscular as Zen and I hate coke...cain"},
        {name: "Ira", weight: 165, noteToSelf: "I want to be as muscular as Zen and he gives me imposter syndrome"},
    ]

    //delete all log 
    Log.deleteMany({}, (err, data) => {
        Log.create(startLogs, (err,data) =>{
            res.json(data)
        })
    })
})

///////////////////////////////////////
//Index Route (Get => /logs)
///////////////////////////////////
app.get("/logs", (req,res) => {
    Log.find({}, (err, logs) => {
        res.render("logs/index.ejs", {logs})
    })
})


///////////////////////////////////
//Show route (Get => /logs/:id)
/////////////////////////////////////
app.get("/logs/:id", (req,res) => {
    //grab the id params
    const id = req.params.id 

    Log.findById(id, (err, log) =>{
        res.render("logs/show.ejs", {log})
    })

})




//___________________
//Listener
//___________________
app.listen(PORT, () => console.log('express is listening on:', PORT));