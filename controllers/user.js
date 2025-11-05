const User = require("../model/user");


module.exports.signUp = async(req,res) => {
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
};

module.exports.idxSignUp =  (req,res) => {
    res.render("users/signup.ejs");
};

module.exports.login = (req,res)=> {
    res.render("users/login")
};

module.exports.postLogin = async(req,res)=> {
    req.flash("success","Welcome to wanderlust");
    const redirectUrl = res.locals.redirectUrl || "/listings"; // fallback
    delete req.session.redirectUrl; 
    res.redirect(redirectUrl);
};


module.exports.logOut = (req, res, next) => {
    req.logOut((err) => {
        if(err){
           return next(err);
        }else{
            req.flash("success","You have Successfully Logged Out!!");
            res.redirect("/listings");
        }
    })
};