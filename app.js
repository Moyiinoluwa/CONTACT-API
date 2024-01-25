const express = require('express');
const dotenv = require('dotenv').config();
const errorHandler = require('./Middleware/errorHandlers'); 
const  connectDb = require('./Config/dbConnection');
const validateToken = require('./Middleware/validateTokenHandlers');
const app = express();


//connection to the database
connectDb()

app.use(express.json());
app.use('/api/contact', require('./Routes/contactRoutes'))
app.use('/api/user', require('./Routes/userRoutes'));

//errorhandler function
app.use(errorHandler);
app.use('/api/user/current',validateToken)


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`server running on ${PORT}`)
});