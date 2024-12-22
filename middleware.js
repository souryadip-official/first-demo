const Listing = require("./models/listing.js");
const Review = require("./models/review.js");
const review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");
const ExpressError = require("./utils/ExpressError.js");

module.exports.isLoggedIn = (req, res, next) => {
    if(!req.isAuthenticated()) {
        /* If the user is not logged in, then after we make the user signup/login to our
        platform, we must redirect the user to the page where the user was trying to go, 
        which is a convenient way to handle the situation, that we have implemented in the
        codes below. As we need to have a variable so that we can access it from any part
        we cannot define a local variable in this middleware. So we will store this
        by creating a new attribute/variable in the req.session object which is accessible 
        in every situation. But as discussed that passport package automatically resets the
        req.session object after a user logs in, hence we may find errors performing this.
        So it would be the best if we do save it in res.locals object as passport package
        has no access to this res.locals object */
        req.session.redirectUrl = req.originalUrl;
        req.flash("error", "You must login first to proceed further.");
        return res.redirect("/login");
    }
    next();
};
module.exports.saveRedirectUrl = (req, res, next) => {
    if(req.session.redirectUrl) {
        res.locals.redirectUrl = req.session.redirectUrl;
        /* delete req.session.redirectUrl; -> This isn't necessary */
    }
    next();
};

module.exports.isOwner = async (req, res, next) => {
    let { id } = req.params;
    let {title, description, image, price, location, country} = req.body;
    let listing = await Listing.findById(id);
    if(!listing.owner.equals(res.locals.currUser._id)) {
        /* In this case, we directly get the user object from the lisitng and
            from the res.locals object we can use the currUser field and extract
            its _id paramater to match this. here listing.owner._id is not supposed
            to be written because here we are directly getting the object id  */
        req.flash("error", "You do not have the permission to modify this listing.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    let {error}= listingSchema.validate(req.body);
    if(error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
};

module.exports.validateReview = (req, res, next) => {
    let {error}= reviewSchema.validate(req.body);
    if(error) {
        throw new ExpressError(400, error);
    } else {
        next();
    }
};


module.exports.isReviewAuthor = async (req, res, next) => {
    let { id, rId } = req.params;
    let review = await Review.findById(rId);
    if(!review.author.equals(res.locals.currUser._id)) {
        req.flash("error", "You do not have the permission to delete this review.");
        return res.redirect(`/listings/${id}`);
    }
    next();
}


/* In case of exporting functions, always require them in the form of an object */