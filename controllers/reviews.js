const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id);
    let { comment, review, rating} = req.body;
    let newReview = new Review({
        comment, review, rating, createdAt: new Date(), author: req.user._id
    });

    listing.reviews.unshift(newReview);

    await newReview.save();
    await listing.save();
    console.log(`A new review for listing "${id}" has been registered in database.`);
    req.flash("success", "Successfully added a new review.");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
    let {id, rId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull : {reviews: rId}});
    await Review.findByIdAndDelete(rId);

    req.flash("success", "Successfully deleted the review.");
    res.redirect(`/listings/${id}`);
};