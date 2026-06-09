import mongoose from 'mongoose';

const behaviorItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const searchQuerySchema = new mongoose.Schema({
  query: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

const userBehaviorSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    viewedProducts: [behaviorItemSchema],
    searchedProducts: [searchQuerySchema],
    clickedProducts: [behaviorItemSchema],
    purchasedProducts: [behaviorItemSchema],
  },
  {
    timestamps: true,
  }
);

const UserBehavior = mongoose.model('UserBehavior', userBehaviorSchema);
export default UserBehavior;
