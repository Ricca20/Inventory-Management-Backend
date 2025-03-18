import Review from '../models/Review.js';
import Order from '../models/Order.js';
import Notification from '../models/Notifications.js';
import { sendNotificationEmail } from '../Utils/emailService.js';
import User from '../models/User.js';

// Add a review (Buyer)
export const addReview = async (req, res) => {
  try {
    const { productId, buyerId, rating, review } = req.body;

    // Check if the buyer has purchased the product
    const order = await Order.findOne({ buyerId, productId });
    if (!order) {
      return res.status(403).json({ message: 'You can only review products you have purchased.' });
    }

    // Create a new review
    const newReview = new Review({
      productId,
      buyerId,
      farmerId: order.productId.farmerId, // Assuming product has a farmerId field
      rating,
      review,
      status: 'pending',
    });
    await newReview.save();

    // Notify buyer that the review is pending
    const buyerNotification = new Notification({
      userId: buyerId,
      message: 'Your review is pending approval.',
    });
    await buyerNotification.save();

    // Send email notification to buyer
    const buyer = await User.findById(buyerId);
    await sendNotificationEmail(buyer.email, 'Your review is pending approval.');

    res.status(201).json({ message: 'Review submitted successfully. It is pending approval.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Publish a review (Manager)
export const publishReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    // Find the review
    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(404).json({ message: 'Review not found.' });
    }

    // Update review status to published
    review.status = 'published';
    await review.save();

    // Notify buyer that the review is published
    const buyerNotification = new Notification({
      userId: review.buyerId,
      message: 'Your review has been published.',
    });
    await buyerNotification.save();

    // Notify farmer about the new review
    const farmerNotification = new Notification({
      userId: review.farmerId,
      message: 'You have a new review for your product.',
    });
    await farmerNotification.save();

    // Send email notifications
    const buyer = await User.findById(review.buyerId);
    const farmer = await User.findById(review.farmerId);
    await sendNotificationEmail(buyer.email, 'Your review has been published.');
    await sendNotificationEmail(farmer.email, 'You have a new review for your product.');

    res.status(200).json({ message: 'Review published successfully.' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get pending reviews (Manager Dashboard)
export const getPendingReviews = async (req, res) => {
  try {
    const pendingReviews = await Review.find({ status: 'pending' }).populate('buyerId productId');
    res.status(200).json(pendingReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get published reviews (Marketplace)
export const getPublishedReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const publishedReviews = await Review.find({ productId, status: 'published' }).populate('buyerId');
    res.status(200).json(publishedReviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get average rating for a farmer
export const getFarmerAverageRating = async (req, res) => {
  try {
    const { farmerId } = req.params;

    // Get all published reviews for the farmer
    const reviews = await Review.find({ farmerId, status: 'published' });

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;

    res.status(200).json({ averageRating });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};