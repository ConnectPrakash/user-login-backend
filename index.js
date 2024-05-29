require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const routes = require('./route/index')
const cors = require('cors');
//const routes = require('routes');
const app = express();
app.use(cors());
app.use(express.json())
app.use('/api',routes);
//connect to Mongodb
mongoose.connect(process.env.DB_CONNECTION_STRING,{
    useNewUrlParser:true,
    useUnifiedTopology:true,
})

const database = mongoose.connection

database.on('error',(err) =>console.log(err));

database.on("connected",()=>console.log("Database Connected.."))

app.listen(3000,()=>{
    console.log("Server started on localhost:3000");
})