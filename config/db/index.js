const mongoose = require('mongoose');
require("dotenv").config();

const connectionString = process.env.CONNECTION_STRING;

function connect() {
    mongoose.connect(connectionString, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
        .then(() => {
            console.log("Connect successful");
        })
        .catch((e) => {
            console.log("connect failed" + e.message);
        });
}

module.exports = { 
    connect
};