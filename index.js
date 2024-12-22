if(process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const methodOverride = require("method-override");

const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const ejsMate = require('ejs-mate');
const app = express();
const port = 3000;
const Listing = require("./models/listing.js");
const Review = require("./models/review.js");

/* Requiring the routes */
const listingRouter = require("./routes/listing.js"); //the listing route
const reviewRouter = require("./routes/review.js"); //the review route
const userRouter = require("./routes/user.js"); //the user route

const {listingSchema, reviewSchema} = require("./schema.js");

const wrapAsync = require('./utils/wrapAsync.js');
const ExpressError = require('./utils/ExpressError.js');

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.engine("ejs", ejsMate);

app.use(methodOverride("_method"));

const dbUrl = process.env.ATLASDB_URL;

main()
    .then(() => {
        console.log("connection established.");
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET
    },
    touchAfter: 24*60*60
});

store.on("error", () => {
    console.log("ERROR IN MONGO SESSION STORE");
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true /* This is done to prevent the cookie from being accessed by the client side javascript also known as cross-scripting attacks */
    }
};

app.use(session(sessionOptions));
app.use(flash()); /* Use flash before the routes */


app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    /* If we have a flash message with the key "success" then we will have a variable success in the res.locals */
    res.locals.error = req.flash("error");
    /* res.locals.success is a variable that is available in all the routes and templates */
    res.locals.currUser = req.user;
    /* req.user is the user that is involved in the ongoing session */
    next(); /* If we forget this, we will get stuck in the middleware */
});

/* Connecting the server to port 3000 */
app.listen(port, () => {
    console.log("Server is on at port", port);
});

/* Checking connection at the root route */
/* app.get("/", (req, res) => {
    res.send("I have got your response.");
}); ----------> Although this is commented, make a page to create a welcome page for root */

/* Using the /listings route */
app.use("/listings", listingRouter);
/* Using the reviews route */
app.use("/listings/:id/reviews", reviewRouter);
/* Using the users route */
app.use("/", userRouter); /* path is yet to be decided */

app.all("*", (req, res, next) => {
    let err = {status: 404, message: "Page not found!"};
    res.render("listings/error.ejs", {err});
    /* next(new ExpressError(404, "Page not found")); */
});

app.use((err, req, res, next) => {
    let {status=500, message="Something went wrong!"} = err;
    /* Way of asigning a default value if not present otherwise */
    //res.status(status).send(message);
    res.render("listings/error.ejs", {err});
});