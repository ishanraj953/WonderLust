const express = require("express");
const router = express.Router({mergeParams: true});
const Reviews = require("../model/review.js");
const wrapasync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const {listingSchema, reviewSchema} = require("../schema.js");
const listing = require("../model/listing.js");



function validateReview(req,res,next){
    let {error} = reviewSchema.validate(req.body);
    if(error){
        let errmsg = error.details.map((el) => el.message).join(",")
        throw new ExpressError(400, errmsg);
    }else{
        next();
    }
}


//Reviews
router.post("/",validateReview,wrapasync( async (req,res) => {
    let listening = await listing.findById(req.params.id);
    let newReview = new Reviews(req.body.review);
    
    listening.reviews.push(newReview);

    await listening.save();
    await newReview.save();
    req.flash("success", "New review added!!");
    console.log("Saved");

    res.redirect(`/listings/${listening._id}`)
}));

//Review Delete
router.delete("/:reviewID", wrapasync(async(req,res)=>{
    let {id,reviewID} = req.params;

    await listing.findByIdAndUpdate(id, {$pull: { reviews: reviewID}});
    await Reviews.findByIdAndDelete(reviewID);

    res.redirect(`/listings/${id}`);
}));

module.exports = router;