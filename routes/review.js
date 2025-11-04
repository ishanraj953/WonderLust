const express = require("express");
const router = express.Router({ mergeParams: true });
const Review = require("../model/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../schema.js");
const Listing = require("../model/listing.js");
const { isLoggedIn, isAuthor, validateReview} = require("../middleware.js");
const reviewController = require("../controllers/review.js");


// Reviews - add
router.post(
    "/",
    isLoggedIn,
    validateReview,
    wrapAsync(reviewController.add)
);

// Review Delete (protected by isAuthor)
router.delete(
    "/:reviewID",
    isLoggedIn,
    isAuthor, // ensure only review author can delete
    wrapAsync(reviewController.delete)
);

module.exports = router;