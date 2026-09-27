'use client';

import React, { useState } from 'react';
import {
  X,
  Star,
  CheckCircle2,
  Camera,
  Sparkles,
  ThumbsUp
} from 'lucide-react';
import { Booking } from '@/lib/marketplace-data';

interface ReviewModalProps {
  booking: Booking | null;
  onClose: () => void;
  onSubmitReview: (bookingId: string, rating: number, review: string) => Promise<void>;
}

function ReviewModalContent({
  booking,
  onClose,
  onSubmitReview
}: ReviewModalProps) {
  // Never true at runtime: the exported wrapper only renders this when booking is set.
  // Kept so TypeScript narrows the prop; it stops hooks below from being skipped on close.
  if (!booking) return null;

  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [selectedTags, setSelectedTags] = useState<string[]>(['Punctual', 'Clean work']);
  const [reviewText, setReviewText] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const tags = [
    'Punctual',
    'Expert Diagnostics',
    'Clean work',
    'Fair pricing',
    'Polite & Courteous',
    'Genuine Parts'
  ];

  const toggleTag = (t: string) => {
    setSelectedTags((prev) =>
      prev.includes(t) ? prev.filter((item) => item !== t) : [...prev, t]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError('');
    setIsSubmitting(true);
    try {
      await onSubmitReview(booking.id, rating, reviewText.trim());
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Could not submit your review. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        {submitted ? (
          <div className="py-8 text-center space-y-3 animate-in zoom-in-95 duration-200">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-2xl mx-auto">
              ✓
            </div>
            <h3 className="text-xl font-bold text-stone-900">Thank you for reviewing!</h3>
            <p className="text-xs text-stone-500">
              Your feedback helps {booking.providerName} and other neighbors on Worksy.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-stone-400">
                Rate Your Experience
              </span>
              <h2 className="text-lg font-bold text-stone-900 mt-0.5">
                How was your service?
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {booking.serviceTitle} with <strong>{booking.providerName}</strong>
              </p>
            </div>

            {/* Interactive Stars */}
            <div className="text-center py-2">
              <div className="flex items-center justify-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => {
                  const filled = (hoverRating || rating) >= star;
                  return (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 transition-transform hover:scale-125 focus:outline-none"
                    >
                      <Star
                        size={32}
                        className={`transition-colors ${
                          filled ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>
              <div className="text-xs font-bold text-stone-700 mt-2">
                {rating === 5 && 'Excellent! Absolutely delighted'}
                {rating === 4 && 'Very Good, smooth service'}
                {rating === 3 && 'Average, meets expectations'}
                {rating <= 2 && 'Needs improvement'}
              </div>
            </div>

            {/* Feedback Tags */}
            <div>
              <div className="text-xs font-bold text-stone-800 mb-2">What went best?</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-black text-white border-black'
                          : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Review text area */}
            <div>
              <div className="text-xs font-bold text-stone-800 mb-1.5">Tell us more:</div>
              <textarea
                rows={3}
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share specific details about the technician, work quality, cleanliness..."
                className="w-full p-3 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-900 focus:outline-none focus:border-black focus:bg-white resize-none"
              />
            </div>

            {submitError && (
              <div className="text-[11px] font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2">
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-black text-white text-xs font-bold uppercase tracking-wider hover:bg-stone-800 transition-all shadow-md active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * Wrapper: returns early BEFORE any hook is called. Previously the early return sat above the
 * component's useState calls, so closing the modal changed the hook count and React threw
 * "Rendered fewer hooks than expected".
 */
export default function ReviewModal(props: ReviewModalProps) {
  if (!props.booking) return null;
  return <ReviewModalContent key={props.booking.id} {...props} />;
}
