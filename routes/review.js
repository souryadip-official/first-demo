const express = require('express');
const router = express.Router({mergeParams : true});
/* This is done because, when the review route gets matched in the index.js file,
 the :id paramater in req.params is not carried on in review.js route file, so if
 that :id paramater is not propagated, we will encounter errors in any review
 operations. So to propagate that :id paramater, we use mergeParams: true, which
 helps the :id parameter propagate from index.js to review.js aand hence avoids any error */

const wrapAsync = require('../utils/wrapAsync.js');
const Listing = require("../models/listing.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const ExpressError = require('../utils/ExpressError.js');
const Review = require("../models/review.js");

const { isLoggedIn, isReviewAuthor, validateReview } = require("../middleware.js");


const reviewController = require("../controllers/reviews.js");

//Reviews - POST route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));

//Reviews - Delete Route
router.delete("/:rId", isLoggedIn, isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;