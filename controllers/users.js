const User = require("../models/user.js");

module.exports.renderSignUpForm = (req, res) => {
    res.render("users/signup.ejs");
};

module.exports.registerUser = async (req, res) => {
    try {
        let { email, username, password } = req.body;
        let newUser = new User({ email, username });
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, (err) => {
            if(err) {
                /* that means, during login something went wrong which is stored as an error in this "err" variable */
                return next(err);
            }
            req.flash("success", `Welcome to Wanderlust, ${username}!`);
            res.redirect("/listings");
        });
    } catch(error) {
        req.flash("error", error.message);
        res.redirect("/signup");
    }
    /* This is done with the purpose that if the same user with an already registered email/username 
    tries to register again, then that person would not be redirected completely to the error page used by wrapAsync instead, that person will receive a flash message but will still get the access to the form or in other words, that person would still remain on the same signup page */
};


module.exports.renderLoginForm = (req, res) => {
    res.render("users/login.ejs");
};


module.exports.loginUser = async (req, res) => {
    /* passport.authenticate("<strategy>") is a middleware that is used to authenticate the user prior to the route handler. It is used to authenticate the user using a strategy that is defined in the passport.use() method */
    req.flash("success", `Welcome back to Wanderlust, ${req.body.username}!`);
    /* Simply accessing the req.session.redirectUrl can arise a problem here.
        This is because, by default, after a user logs in, passport package automatically
        resets the req.session object. So by directly accesing it, we will get an
        undefined value because of resetting the req.session object. So we will do so
        by saving that URL in the res.locals object */
    let redirectUrl; //local variable
    redirectUrl = res.locals.redirectUrl || "/listings";

    res.redirect(redirectUrl);
};


module.exports.logoutUser = (req, res, next) => {
    /* req.logout() is a method that is provided by passport to terminate a login session. 
        To note, the logout means we are not deleting the user from the database, we are just terminating or rather removing the user from the session, this is why this functions need not be async 
        And also, this functions are provided by passport package itself. It takes a paramter of a call back function which is to be executed after the user is logged out */
    req.logOut((err) => {
        if(err) {
            /* that means, during logout something went wrong which is stored as an error in this variable */
            return next(err);
        }
        req.flash("success", "Successfully logged out!");
        res.redirect("/listings");
    });
};