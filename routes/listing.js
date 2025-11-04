const express = require("express");
const router = express.Router();
const {listingSchema, reviewSchema} = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../model/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listing.js");

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
router.get("/", wrapAsync(listingController.index));

//new route
router.get("/new",isLoggedIn, listingController.new);

//show route
router.get("/:id", listingController.show);

//create route
router.post("/",isLoggedIn ,validateListing, wrapAsync(listingController.create));

//edit Route
router.get("/:id/edit",isLoggedIn, isOwner ,wrapAsync(listingController.edit));

//Update Route
router.put("/:id", isLoggedIn, isOwner,validateListing, wrapAsync(listingController.update));

//Delete Route
router.delete("/:id",isLoggedIn, isOwner,wrapAsync(listingController.delete));

module.exports = router;