const express = require("express");
const router = express.Router();
const User = require("../model/user");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware");

router.get("/signup", (req,res) => {
    res.render("users/signup.ejs");
});

router.post("/signup", async(req,res) => {
    let {username, email, password} = req.body;
    const newUser = new User({username,email});
    const registeredUser = await User.register(newUser,password);
    console.log(registeredUser);
    req.login(registeredUser, (err) => {
        if(err){
            return next();
        }
        req.flash("success",`Welcome ${username} to wanderlust`);
        res.redirect("/listings");
    })
});

router.get("/login", (req,res)=> {
    res.render("users/login")
});

router.post("/login",
    saveRedirectUrl, 
    passport.authenticate(
    "local",
    {failureRedirect: '/login',
    failureFlash: true
}),
    async(req,res)=> {
    req.flash("success","Welcome to wanderlust");
    const redirectUrl = res.locals.redirectUrl || "/listings"; // fallback
    delete req.session.redirectUrl; 
    res.redirect(redirectUrl);
});

router.get("/logout", (req, res, next) => {
    req.logOut((err) => {
        if(err){
           return next(err);
        }else{
            req.flash("success","You have Successfully Logged Out!!");
            res.redirect("/listings");
        }
    })
})

module.exports = router;