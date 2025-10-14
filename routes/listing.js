const express = require("express");
const router = express.Router();
const {listingSchema, reviewSchema} = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../model/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){
    let errMsg = error.details.map(e => e.message).join(", ");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

//index route
router.get("/", async(req,res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing} );
});

//new route
router.get("/new",isLoggedIn,(req,res) => {
    res.render("listings/new.ejs");
});

//show route
router.get("/:id", async(req,res) => {
    const {id} = req.params;
    const data = await Listing.findById(id)
    .populate({
        path: "reviews",
        populate:{
            path: "author"
        }})
    .populate("owner");
    if(!data){
        req.flash("error","listing not found!!");
        return res.redirect("/listings");
    }
    res.render("listings/show.ejs", {data});
});

//create route
router.post("/",isLoggedIn ,validateListing, wrapAsync(async (req,res) => {
    if(!req.body.listing){
        throw new ExpressError(400,"Page not Found");
    }
    const newListing = await new Listing(req.body.listing);
    newListing.owner = req.user._id;
    await newListing.save();
    req.flash("success","listing added successfully!!");
    console.log(newListing);
    res.redirect("/listings");
}));

//edit Route
router.get("/:id/edit",isLoggedIn, isOwner ,wrapAsync(async(req,res) => {
    const {id} = req.params;
    const listingData = await Listing.findById(id);
     if(!listingData){
        req.flash("error","listing not found!!");
        return res.redirect("/listings");
    }
    res.render("listings/edit",{listingData});
}));

//Update Route
router.put("/:id", isLoggedIn, isOwner,validateListing, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
    req.flash("success", "listing updated successfully!!");
    res.redirect(`/listings/${id}`);
}));

//Delete Route
router.delete("/:id",isLoggedIn, isOwner,wrapAsync(async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    req.flash("success","listing Deleted successfully!!");
    console.log(listing);
    res.redirect("/listings");
}));

module.exports = router;