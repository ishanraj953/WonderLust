const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../model/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../model/listing.js");
const { isLoggedIn, isAuthor } = require("../middleware.js");

function validateReview(req, res, next) {
    // validate the actual review object sent from the form
    let { error } = reviewSchema.validate(req.body.review);
    if (error) {
        let errmsg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(400, errmsg);
    } else {
        next();
    }
}

// Reviews - add
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(async (req, res) => {
        const { id } = req.params;
        const listing = await Listing.findById(id);
        if (!listing) {
            req.flash("error", "Listing not found");
            return res.redirect("/listings");
        }

        const newReview = new Review(req.body.review);
        newReview.author = req.user._id; // ensure author is the logged-in user
        await newReview.save();

        listing.reviews.push(newReview._id);
        await listing.save();

        req.flash("success", "New review added!!");
        res.redirect(`/listings/${listing._id}`);
    })
);

// Review Delete (protected by isAuthor)
router.delete(
    "/:reviewID",
    isLoggedIn,
    isAuthor, // ensure only review author can delete
    wrapAsync(async (req, res) => {
        const { id, reviewID } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
        await Review.findByIdAndDelete(reviewID);

        req.flash("success", "Review deleted");
        res.redirect(`/listings/${id}`);
    })
);

module.exports = router;