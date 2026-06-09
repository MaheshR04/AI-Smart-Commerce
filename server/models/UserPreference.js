import mongoose from 'mongoose';

const userPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    favoriteBrands: {
      type: [String],
      default: [],
    },
    favoriteCategories: {
      type: [String],
      default: [],
    },
    budgetRange: {
      min: {
        type: Number,
        default: 0,
      },
      max: {
        type: Number,
        default: 0,
      },
    },
    interests: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const UserPreference = mongoose.model('UserPreference', userPreferenceSchema);
export default UserPreference;
