import mongoose from 'mongoose';

const aiRecommendationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false,
    },
    query: {
      type: String,
      required: true,
    },
    recommendedProducts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
      },
    ],
  },
  {
    timestamps: true,
  }
);

const AIRecommendation = mongoose.model('AIRecommendation', aiRecommendationSchema);
export default AIRecommendation;
