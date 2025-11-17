if(process.env.NODE_ENV != "production"){
    require('dotenv').config();
}
// REMOVE any unconditional TLS bypass in production; only use for local dev debugging if absolutely necessary
// process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // <-- remove or comment out

const dbUrl = process.env.ATLASDB_URL;

const express = require("express");
const ejs = require("ejs");
const path = require("path");
const mongoose = require('mongoose');
const methodOverride = require("method-override");
const ejsmate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./model/user.js"); 
const listingRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const { error } = require('console');

const app = express();
const port = process.env.PORT;

app.engine('ejs', ejsmate);
app.set("view engine","ejs");
app.set("views", path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"public")));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: 24 * 3600
});

store.on("error", () => {
    console.log("ERROR in Mongo Store", err);
})

const sessionSave = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 *60*60*24*3,
        maxAge: 1000 *60*60*24*3,
        httpOnly: true
    }
}

app.use(session(sessionSave));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

main()
.then(
    () => {
    console.log("Connected to DB");
})
.catch((err) =>{
    console.log(err);
});


async function main() {
  try {
    await mongoose.connect(dbUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000, // fail fast if cannot connect
    });
    console.log("Connected to DB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    // exit so process manager (nodemon) restarts, or surface the error for CI
    process.exit(1);
  }
}

app.use((req,res,next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/", (req, res) => {
    res.redirect("/listings");
});

app.use("/listings",listingRouter);
app.use("/listings/:id/reviews",reviewsRouter);
app.use("/",userRouter);

//Reviews

//Error handling

// app.all("*", (req, res, next) => {
//     console.log(`Route not found: ${req.originalUrl}`);
//     next(new ExpressError(404, "Page Not Found!"));
// });

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong!" } = err;
    console.log(err);
    res.status(statusCode).render("listings/error.ejs",{message, statusCode});
});


app.listen(port, () => {
    console.log(`${port} port is running`)
});
