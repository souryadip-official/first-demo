const express = require('express');
const router = express.Router(); 

const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const ExpressError = require('../utils/ExpressError.js');
const Review = require("../models/review.js");

const { isLoggedIn } = require("../middleware.js");
const { isOwner} = require("../middleware.js");
const { validateListing } = require("../middleware.js");

const multer  = require('multer');
const listingController  = require("../controllers/listings.js");

const { storage, cloudinary } = require('../cloudConfig.js');
const upload = multer({ storage });

/* To require an entire file which has multiple functions, we can directly require the file and then access the functions using the dot operator. This means, we don't need to export each function separately. We can get the whole file by requiring it directly as a variable, and not as an object of it.
After that we can access the functions using the dot operator. Examples are show for the controllers. */

/* Index & Create Route */
router
.route("/")
.get(wrapAsync(listingController.index)) //Index Route -> Here, we are accessing the index function of the listingController file
.post(isLoggedIn, upload.single("image"), validateListing, wrapAsync(listingController.createListing)); //Create Route -> Here, we are accessing the createListing function of the listingController file

/* the validatelisting function should be written after upload.single("image") because the validatelisting function uses the req.body and req.file objects which are created by the upload.single("image") function. hence, the validatelisting function should be written after the upload.single("image") function. First multer will parse our image and then save it in the cloudinary cloud storage and then the validatelisting function will validate the listing. */

/* This is a better way to write the routes. We can chain the routes together and write the common part of the routes in the beginning and then write the specific part of the routes in the end. This is a better way to write the routes. This avoides the repetition of the code and different types of requests on the same path and hence makes the code more readable. */

//new Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

/* New route is written above the show, update & delete route because, if we write new route below the mentioned routes, the new path will be misinterpreted as an id hence unusual behaviour can be observed. Hence we should carefully keep this things in the mind to avoid running into an error */ 

/* Show, Update & Delete Route */
router
.route("/:id")
.get(wrapAsync(listingController.showListing)) //Show Route
.put(isLoggedIn, isOwner, upload.single("image"), validateListing, wrapAsync(listingController.updateListing)) //Update route
.delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing)); //Destroy Route

//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;