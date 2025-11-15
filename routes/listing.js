const express = require("express");
const router = express.Router();
const {listingSchema, reviewSchema} = require("../schema.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const Listing = require("../model/listing.js");
const {isLoggedIn, isOwner} = require("../middleware.js");
const listingController = require("../controllers/listing.js");
const multer  = require('multer');
const {storage} = require("../cloudConfig.js");
const upload = multer({ storage });

const validateListing = (req, res, next) => {
    let {error} = listingSchema.validate(req.body);

    if(error){
    let errMsg = error.details.map(e => e.message).join(", ");
        throw new ExpressError(400, errMsg);
    }else{
        next();
    }
}

router
    .route("/")
    //index route
    .get(wrapAsync(listingController.index))
    //create route
    .post(isLoggedIn,
    upload.single('listing[image]'), 
    validateListing, 
    wrapAsync(listingController.create));

//new route
router.get("/new",isLoggedIn, listingController.new);

router
    .route("/:id")
    //show route
    .get(listingController.show)
    //Update Route 
    .put(isLoggedIn, 
        isOwner,
        upload.single('listing[image]'),
        validateListing, 
        wrapAsync(listingController.update))
    //Delete Route
    .delete(isLoggedIn, isOwner,wrapAsync(listingController.delete));


//edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner,
    wrapAsync(listingController.edit));

module.exports = router;