const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

let userSchema = new Schema({
    email: {
        type: String,
        required: true,
    }
    /* The password and the username will automatically be added by the passport-local-mongoose plugin */
});

userSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", userSchema);