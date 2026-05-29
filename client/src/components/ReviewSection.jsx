import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Star, MessageSquare, Send, User, Trash2, Pencil } from 'lucide-react';
import API from '../services/api';

export const ReviewSection = ({ productId }) => {
  const { token, user } = useContext(AuthContext);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState(null);
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

  // Handle pre-population when reviews or user state changes
  useEffect(() => {
    if (user && reviews.length > 0) {
      const myRev = reviews.find((r) => r.userId?._id === user._id);
      if (myRev) {
        setRating(myRev.rating);
        setComment(myRev.comment);
        setIsEditing(true);
        setEditingReviewId(myRev._id);
      } else {
        setRating(5);
        setComment('');
        setIsEditing(false);
        setEditingReviewId(null);
      }
    } else {
      setRating(5);
      setComment('');
      setIsEditing(false);
      setEditingReviewId(null);
    }
  }, [reviews, user]);

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

      setSubmitSuccess(true);
      
      // Reload reviews to trigger pre-population updates
      await fetchReviews();
      
      // Auto fade success message
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to submit review');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return;
    try {
      await API.delete(`/reviews/${reviewId}`);
      setSubmitSuccess(true);
      setSubmitError('');
      
      // Reset state
      setComment('');
      setRating(5);
      setIsEditing(false);
      setEditingReviewId(null);

      // Reload reviews
      await fetchReviews();
      
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch (error) {
      setSubmitError(error.response?.data?.message || 'Failed to delete review');
    }
  };

  const handleEditClick = () => {
    const textarea = document.getElementById('review-comment-textarea');
    if (textarea) {
      textarea.focus();
      textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  // Calculations for Statistics
  const totalReviews = reviews.length;
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  reviews.forEach((r) => {
    if (starCounts[r.rating] !== undefined) {
      starCounts[r.rating]++;
    }
  });

  const getStarPercentage = (star) => {
    if (totalReviews === 0) return 0;
    return Math.round((starCounts[star] / totalReviews) * 100);
  };

  const avgRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : '0.0';

  return (
    <div className="space-y-6 pt-8 border-t border-slate-200 animate-fade-in">
      <div className="flex items-center gap-2">
        <MessageSquare className="w-5 h-5 text-sky-500" />
        <h3 className="text-base font-extrabold text-slate-800 tracking-tight">Customer Reviews & Ratings</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Review Statistics Card */}
        <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-6 space-y-4 shadow-sm animate-fade-in">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Review Statistics</h4>
          
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold text-slate-800">{avgRating}</span>
            <span className="text-xs text-slate-400 font-semibold">out of 5 stars</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i <= Math.round(Number(avgRating)) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-bold text-slate-500">({totalReviews} customer ratings)</span>
          </div>

          <div className="space-y-2.5 pt-2">
            {[5, 4, 3, 2, 1].map((star) => {
              const pct = getStarPercentage(star);
              return (
                <div key={star} className="flex items-center gap-3 text-xs">
                  <span className="w-10 font-bold text-slate-600 shrink-0">{star} Star</span>
                  <div className="flex-1 h-2 bg-slate-200/60 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                  <span className="w-8 text-right font-bold text-slate-500 shrink-0">{pct}%</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Submission Form & Reviews List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Submission / Edit Form */}
          {token ? (
            <form onSubmit={handleReviewSubmit} className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5 space-y-4">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                {isEditing ? 'Update Your Review' : 'Write a Customer Review'}
              </h4>
              
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-slate-500">Select Rating:</span>
                <div className="flex">{renderInteractiveStars()}</div>
              </div>

              <div className="space-y-1">
                <textarea
                  id="review-comment-textarea"
                  rows="3"
                  placeholder="Tell us what you liked or disliked about this product..."
                  className="w-full px-3 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-sky-500 focus:ring-4 focus:ring-sky-50 placeholder:text-slate-400"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>

              {submitError && <p className="text-xs font-medium text-rose-500">{submitError}</p>}
              {submitSuccess && (
                <p className="text-xs font-semibold text-emerald-600">
                  {isEditing ? 'Review updated successfully.' : 'Review submitted successfully.'}
                </p>
              )}

              <div className="flex justify-end gap-2.5">
                {isEditing && (
                  <button
                    type="button"
                    onClick={() => handleDeleteReview(editingReviewId)}
                    className="inline-flex items-center gap-1.5 px-3 py-2 border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete Review
                  </button>
                )}
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
                >
                  {submitLoading ? (
                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-slate-300"></div>
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  {isEditing ? 'Save Changes' : 'Submit Review'}
                </button>
              </div>
            </form>
          ) : (
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              <p className="text-xs text-slate-500 font-medium">
                Please log in to write or manage a review.
              </p>
            </div>
          )}

          {/* List of customer reviews */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-sky-500"></div>
              </div>
            ) : reviews.length > 0 ? (
              reviews.map((rev) => {
                const isMyReview = user && rev.userId?._id === user._id;
                const isAdmin = user && user.role === 'admin';
                return (
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

                      <div className="flex items-center gap-2">
                        {/* Interactive Edit / Delete actions for owner */}
                        {isMyReview && (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={handleEditClick}
                              title="Edit Review"
                              className="p-1.5 text-slate-400 hover:text-sky-500 hover:bg-sky-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDeleteReview(rev._id)}
                              title="Delete Review"
                              className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}

                        {/* Admin moderation delete action */}
                        {isAdmin && !isMyReview && (
                          <button
                            onClick={() => handleDeleteReview(rev._id)}
                            title="Moderate: Delete Review"
                            className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Rating display */}
                        <div className="flex items-center gap-0.5 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100 shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-bold text-amber-700">{rev.rating}</span>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed pl-10">
                      {rev.comment}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-xs text-slate-400 text-center py-6">
                No reviews yet. Be the first to review this product.
              </p>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReviewSection;
