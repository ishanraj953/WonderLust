const mongoose = require("mongoose");
const review = require("./review");
const { type } = require("os");
const Schema = mongoose.Schema;
const listingSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    image: {
    filename: {
            type: String,
            default: "https://plus.unsplash.com/premium_photo-1755273421507-4ef20f6ef877?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
        },
        url: {
            type: String,
        }
    },
    price: Number,
    location: String,
    country: String,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    owner: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
});

listingSchema.post("findOneAndDelete", async (listing) => {
    if(listing){
        await review.deleteMany({_id: {$in : listing.reviews}});
    }
})

module.exports = mongoose.model("Listing", listingSchema);