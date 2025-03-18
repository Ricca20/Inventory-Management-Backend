import express from 'express';
import {
  addReview,
  publishReview,
  getPendingReviews,
  getPublishedReviews,
  getFarmerAverageRating,
} from '../controllers/reviewController.js';

const router = express.Router();

// Buyer routes
router.post('/add', addReview);

// Manager routes
router.put('/publish/:reviewId', publishReview);
router.get('/pending', getPendingReviews);

// Marketplace routes
router.get('/published/:productId', getPublishedReviews);

// Farmer profile routes
router.get('/average-rating/:farmerId', getFarmerAverageRating);

export default router;