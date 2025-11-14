const Listing = require("../model/listing");


module.exports.index = async(req,res) => {
    const allListing = await Listing.find({});
    res.render("listings/index.ejs", {allListing} );
};

module.exports.new = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.show = async(req,res) => {
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
};

module.exports.create = async (req,res) => {
    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url + "---" + filename);


    if(!req.body.listing){
        throw new ExpressError(400,"Page not Found");
    }
    const newListing = await new Listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    await newListing.save();
    req.flash("success","listing added successfully!!");
    console.log(newListing);
    res.redirect("/listings");
};

module.exports.edit = async(req,res) => {
    const {id} = req.params;
    const listingData = await Listing.findById(id);
     if(!listingData){
        req.flash("error","listing not found!!");
        return res.redirect("/listings");
    }
    res.render("listings/edit",{listingData});
};

module.exports.update = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    await Listing.findByIdAndUpdate(id, { ...req.body.listing }, { runValidators: true, new: true });
    req.flash("success", "listing updated successfully!!");
    res.redirect(`/listings/${id}`);
};

module.exports.delete = async(req,res) => {
    let {id} = req.params;
    const listing = await Listing.findByIdAndDelete(id);
    req.flash("success","listing Deleted successfully!!");
    console.log(listing);
    res.redirect("/listings");
};