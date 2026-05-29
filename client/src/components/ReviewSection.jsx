import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Star, MessageSquare, Send, User } from 'lucide-react';
import API from '../services/api';

export const ReviewSection = ({ productId }) => {
  const { token, user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Fetch reviews for the product
  const fetchReviews = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/reviews/${productId}`);
      setReviews(response.data.data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error('Failed to load reviews:', error.message);
    }
  };

  useEffect(() => {
    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      setSubmitError('Please write a comment');
      return;
    }

    setSubmitLoading(true);
    setSubmitError('');
    setSubmitSuccess(false);

    try {
      await API.post('/reviews', {
        productId,
        rating,
        comment,
      });

      setComment('');
      setRating(5);
      setSubmitSuccess(true);
      
      // Reload reviews
      await fetchReviews();
      
      // Auto fade success message
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitLoading(false);
    }
  };

  // Render clickable rating selector stars
  const renderInteractiveStars = () => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      const activeStar = hoverRating ? i <= hoverRating : i <= rating;
      stars.push(
        <button
          key={i}
          type="button"
          onClick={() => setRating(i)}
          onMouseEnter={() => setHoverRating(i)}
          onMouseLeave={() => setHoverRating(0)}
          className="p-0.5 focus:outline-none transition-transform active:scale-90"
        >
          <Star
            className={`w-6 h-6 ${
              activeStar ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
            }`}
          />
        </button>
      );
    }
    return stars;
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-200">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-sky-500" />
        Customer Reviews ({reviews.length})
      </h3>

      {/* Review Submission Form */}
      {token ? (
        <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
          <h4 className="text-sm font-semibold text-slate-700">Write a Review</h4>
          
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-slate-500">Your Rating:</span>
            <div className="flex">{renderInteractiveStars()}</div>
          </div>

          <div className="space-y-2">
            <textarea
              rows="3"
              placeholder="Share your experience with this product..."
              className="w-full px-3 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 placeholder:text-slate-400"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            ></textarea>
          </div>

          {submitError && <p className="text-xs font-medium text-red-500">{submitError}</p>}
          {submitSuccess && <p className="text-xs font-semibold text-emerald-600">Review submitted successfully.</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitLoading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50"
            >
              {submitLoading ? (
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-slate-300"></div>
              ) : (
                <Send className="w-3.5 h-3.5" />
              )}
              Submit Review
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
          <p className="text-xs text-slate-500 font-medium">
            Please log in to write a review.
          </p>
        </div>
      )}

      {/* Reviews list */}
      <div className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-sky-500"></div>
          </div>
        ) : reviews.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev._id} className="border-b border-slate-100 pb-4 last:border-b-0 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  {rev.userId?.profileImage ? (
                    <img
                      src={rev.userId.profileImage}
                      alt={rev.userId.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-slate-200 text-slate-500 rounded-full flex items-center justify-center text-xs font-bold border border-slate-300">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                  <div>
                    <h5 className="text-xs font-bold text-slate-700">{rev.userId?.name || 'Anonymous User'}</h5>
                    <span className="text-[10px] text-slate-400">
                      {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Rating display */}
                <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span className="text-xs font-bold text-amber-700">{rev.rating}</span>
                </div>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed pl-10">
                {rev.comment}
              </p>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-400 text-center py-6">
            No reviews yet. Be the first to review this product.
          </p>
        )}
      </div>

    </div>
  );
};

export default ReviewSection;
