const mongoose = require('mongoose');
const Listing = require("../models/listing.js");
const initData = require("./data.js");

main()
    .then(() => {
        console.log("connection established.");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect("mongodb://127.0.0.1:27017/wanderlust");
}

const initDB = async() => {
    await Listing.deleteMany({});
    initData.data = initData.data.map((obj) => ({...obj, owner: '67653a542045f31dbcf2206a'}));
    await Listing.insertMany(initData.data);
};

initDB();