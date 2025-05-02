const express = require('express');
const app = express();
const PORT = 3000;

//let Express understand JSON and form data
app.use(express.json());
app.use(express.urlencoded({extended: true}));

// In memory items
 let items = [];
 let nextId = 1;
