const Review = require("../model/review");
const Listing =  require("../model/listing");

module.exports.add = async (req, res) => {
    console.log(req.body);
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
    };


module.exports.delete = async (req, res) => {
        const { id, reviewID } = req.params;

        await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewID } });
        await Review.findByIdAndDelete(reviewID);

        req.flash("success", "Review deleted");
        res.redirect(`/listings/${id}`);
    };