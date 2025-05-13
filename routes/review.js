const express = require("express");
const router = express.Router({mergeParams: true});
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const listing = require("../models/listing.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");
const {reviewSchema} = require("../schema.js");
const Review = require("../models/review.js");

const reviewController = require("../controllers/reviews.js");

//Post Review route
router.post("/",isLoggedIn, validateReview,wrapAsync(reviewController.createReview));

//Delete Review route
router.delete("/:reviewId",isLoggedIn,isReviewAuthor, wrapAsync(reviewController.destroyReview));

module.exports = router;