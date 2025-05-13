const listing = require("../models/listing");
const mbxGeocoding = require('@mapbox/mapbox-sdk/services/geocoding');
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async(req,res) => {
    let allListings = await  listing.find({});
    res.render("listings/index.ejs",{ allListings });
};

module.exports.renderNewForm = (req,res) => {
    res.render("listings/new.ejs");
};

module.exports.showListing = async(req,res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id).populate({path:"reviews",populate: {path: "author",}}).populate("owner");
    if(!Listing) {
        req.flash("error","Listing you requested for does not exist!");
        return  res.redirect("/listings");
    }
    res.render("listings/show.ejs", {Listing});
};

module.exports.createListing = async(req,res,next) => {
    let response = await geocodingClient
        .forwardGeocode({
            query: req.body.listing.location,
            limit: 1,
    })
    .send();

    let url = req.file.path;
    let filename = req.file.filename;
    console.log(url, "...", filename);
    const newListing  =  new listing(req.body.listing);
    newListing.owner = req.user._id;
    newListing.image = {url, filename};
    newListing.geometry = response.body.features[0].geometry;
    let savedListing = await newListing.save();
    req.flash("success", "New Listing Created");
    res.redirect("/listings");
};

module.exports.renderEditForm = async(req,res) => {
    let {id} = req.params;
    const Listing = await listing.findById(id);
    if(!Listing) {
        req.flash("error","Listing you requested for does not exist!");
        return  res.redirect("/listings");
    }

    let originalImageUrl = Listing.image.url;
    originalImageUrl = originalImageUrl.replace("/upload", "/upload/h_300,w_250");
    res.render("listings/edit.ejs", {Listing, originalImageUrl});
};

module.exports.updateListing = async(req,res) => {
    let {id} = req.params;
    let Listing = await listing.findById(id);
    if(!Listing.owner.equals(res.locals.currUser._id)){
        req.flash("error", "You don't have permission to edit");
        return res.redirect(`/listings/${id}`);
    } 
    let theListing = await listing.findByIdAndUpdate(id, {...req.body.listing});
    if(typeof req.file !== "undefined") {
        let url = req.file.path;
        let filename = req.file.filename;
        theListing.image = {url, filename};
        await theListing.save();
    }
    req.flash("success", "Listing Updated");
    res.redirect(`/listings/${id}`);
};

module.exports.destroyListing = async(req,res) => {
    let {id} = req.params;
    let deleteListing = await listing.findByIdAndDelete(id);
    console.log(deleteListing);
    req.flash("success", "Listing Deleted");
    res.redirect("/listings");
};