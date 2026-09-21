import React, { useState } from 'react';
import { Star, X, MessageSquare, Send } from 'lucide-react';
import { feedbackAPI } from '../../services/api';
import { useToast } from '../../context/ToastContext';

const FeedbackModal = ({ event, onClose, onSuccess }) => {
  const toast = useToast();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!event) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.warning('Please write a brief feedback comment');
      return;
    }

    setSubmitting(true);
    try {
      const res = await feedbackAPI.submitFeedback({
        eventId: event._id,
        rating,
        comment: comment.trim()
      });

      if (res.data?.success) {
        toast.success(res.data.message || 'Feedback submitted successfully!');
        if (onSuccess) onSuccess(res.data.feedback);
        onClose();
      }
    } catch (error) {
      console.error('Submit feedback error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit feedback');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-muit-800 to-muit-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl">
              <MessageSquare className="w-5 h-5 text-muit-200" />
            </div>
            <div>
              <h3 className="text-base font-bold">Event Feedback</h3>
              <p className="text-xs text-blue-200 line-clamp-1">{event.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          {/* Rating Stars */}
          <div className="text-center space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500">
              Rate Your Experience
            </label>
            <div className="flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const active = (hoverRating || rating) >= star;
                return (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 transition-transform hover:scale-110 focus:outline-none"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        active
                          ? 'fill-amber-400 text-amber-400'
                          : 'fill-slate-100 text-slate-300'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
            <p className="text-xs font-bold text-slate-600">
              {rating === 5 && '⭐️⭐️⭐️⭐️⭐️ Outstanding!'}
              {rating === 4 && '⭐️⭐️⭐️⭐️ Very Good'}
              {rating === 3 && '⭐️⭐️⭐️ Good / Satisfactory'}
              {rating === 2 && '⭐️⭐️ Needs Improvement'}
              {rating === 1 && '⭐️ Poor'}
            </p>
          </div>

          {/* Comment Textarea */}
          <div className="space-y-1">
            <label className="block text-xs font-bold text-slate-700">
              Your Review / Suggestions
            </label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What did you learn? How was the speaker, venue, or organization? Share your genuine thoughts..."
              className="w-full p-3 text-sm rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-muit-600"
              required
            />
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-muit-700 hover:bg-muit-800 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{submitting ? 'Submitting...' : 'Submit Feedback'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

export default FeedbackModal;
