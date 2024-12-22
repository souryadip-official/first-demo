const Listing = require("../models/listing.js");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
}; /* This function is used to render the index page of the listings. */


module.exports.renderNewForm = (req, res) => {
    res.render("listings/new.ejs"); 
}; /* This function is used to render the form for creating a new listing. */


module.exports.showListing = async(req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id).populate( { path: "reviews", populate: { path: "author" } }).populate("owner");
    /* This is nested population. Here we are populating the reviews field of the listing and then we are populating the author field for each of the reviews. */
    if(!list) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    res.render("listings/show.ejs", { list });
}; /* This function is used to show the listing. */

module.exports.createListing = async (req, res, next) => {
    /*if(Object.keys(req.body).length === 0) {
        /* Object.keys(<object>) returns an array of the keys (or property names) of the object.
        Now if we apply .length over the array we can find that if any data is sent for listing or not 
        throw new ExpressError(404, "Send valid data for listing.");
    }*/
    let {title, description, price, location, country} = req.body;
    let response = await geocodingClient.forwardGeocode({
        query: location,
        limit: 1
    }).send();

    let url = req.file.path, filename = req.file.filename;
    /* let {title, description, image, price, location, country} = req.body; */
    let newListing = new Listing({title, description, image: { url, filename }, price, location, country, owner: req.user._id});
    
    
    newListing.geometry = response.body.features[0].geometry;
    /* Passport package by default stores the user object in the req object as req.user.
    From that object we can extract our _id parameter to store in owner field*/
    await newListing.save();
    req.flash("success", "Successfully created a new listing.");
    /* The flash message is stored in the session and is available in the next request. */
    /*  The first argument is the key and the second argument is the value */
    res.redirect("/listings");
}; /* This function is used to create a new listing. */


module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    let list = await Listing.findById(id);
    if(!list) {
        req.flash("error", "Listing you requested for does not exist!");
        res.redirect("/listings");
    }
    let originalUrl = list.image.url;
    originalUrl = originalUrl.replace("/upload", "/upload/e_blur:100,w_250");
    res.render("listings/edit.ejs", { list, originalUrl });
}; /* This function is used to render the form for editing the listing. */


module.exports.updateListing = async (req, res) => {
    let { id } = req.params;
    let {title, description, price, location, country} = req.body;

    let response = await geocodingClient.forwardGeocode({
        query: location,
        limit: 1
    }).send();

    let listing = await Listing.findByIdAndUpdate(id, {title, description, price, location, country}, {runValidators: true});

    listing.geometry = response.body.features[0].geometry;
    await listing.save();

    /* From the form, only the parts that are of text type and not related to any sort of file system can be extracted from the req.body object. All things that are related to file, for example in our case it is the image, that can be extracted only from the req.file object as permitted by the multer package. That is why we are first updating all the non-file fields and then storing the instance of that listing in a variable and then checking if the req.file exists or not. If it exists then we will update the image field of the listing. */

    if(typeof req.file !== "undefined") {
        /* We are checking that if req.file exists and it is not undefined then only we will update the image or else we will simply keep the image as it was previously. */
        let url = req.file.path, filename = req.file.filename;
        listing.image = { url, filename };
        await listing.save();
    }
    
    req.flash("success", "Successfully edited the listing.");
    res.redirect(`/listings/${id}`);
}; /* This function is used to update the listing. */


module.exports.destroyListing = async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the listing.");
    res.redirect("/listings");
}; /* This function is used to delete the listing. */