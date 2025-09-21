const initData = require("./data.js");
const express = require("express");
const Listing = require("../model/listing.js")
const app = express();
const mongoose = require('mongoose');

main().catch(err => console.log(err));

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/wonderlust');
}

const initDb = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj,owner: "68cce7e8482405536f0f228e"}));
    await Listing.insertMany(initData.data); 
    console.log("Data initialize");
}

initDb();