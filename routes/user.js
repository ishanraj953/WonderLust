const express = require("express");
const router = express.Router();
const User = require("../model/user");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware");
const { signUp, idxSignUp, login, postLogin, logOut } = require("../controllers/user");

router
    .route("/signup")
    .get(idxSignUp)
    .post(signUp);

router
    .route("/login")
    .get(login)
    .post(
    saveRedirectUrl, 
    passport.authenticate(
    "local",
    {failureRedirect: '/login',
    failureFlash: true
}), postLogin);

router.get("/logout", logOut);

module.exports = router;