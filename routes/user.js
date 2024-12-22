const express = require('express');
const router = express.Router({mergeParams : true}); 

const wrapAsync = require('../utils/wrapAsync.js');
const ExpressError = require('../utils/ExpressError.js');

const User = require("../models/user.js");
const passport = require('passport');

const { saveRedirectUrl } = require('../middleware.js');

const userController = require("../controllers/users.js");


router
.route("/signup")
.get(userController.renderSignUpForm)
.post(wrapAsync(userController.registerUser));


router
.route("/login")
.get(userController.renderLoginForm)
.post(saveRedirectUrl, passport.authenticate("local", { failureRedirect: "/login", failureFlash: true }), wrapAsync(userController.loginUser));

/* Log out */
router.get("/logout", userController.logoutUser);

module.exports = router;