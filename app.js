const express = require('express');
const dotenv = require('dotenv').config();
const errorHandler = require('./Middleware/errorHandlers'); 
const  connectDb = require('./Config/dbConnection');
const validateToken = require('./Middleware/validateTokenHandlers');
const app = express();


//connection to the database
connectDb()

//This middleware help to parse JSON data and converts it to javascript object.
//when applied, it makes it easy for the req.body to work in the routes.
app.use(express.json());

//since its the common api URL, we can create this middleware
//so we dont have to repeating it
app.use('/api/contact', require('./Routes/contactRoutes'))
app.use('/api/user', require('./Routes/userRoutes'));

//errorhandler function
app.use(errorHandler);
app.use('/api/user/current',validateToken)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
});