'use client';

import React, { useState } from 'react';
import {
  Star,
  ShieldCheck,
  MessageSquare,
  ThumbsUp,
  Check,
  Send,
  Calendar,
  Filter
} from 'lucide-react';
import { ProviderReviewItem } from '@/lib/provider-data';

interface ReviewsTabProps {
  /** Loaded from GET /reviews/provider/{id} */
  reviews: ProviderReviewItem[];
  businessName?: string;
}

export default function ReviewsTab({ reviews: serverReviews, businessName }: ReviewsTabProps) {
  // Replies are local only: the backend has no review-reply endpoint yet.
  const [replies, setReplies] = useState<Record<string, { reply: string; repliedAt: string }>>({});
  const reviews = serverReviews.map((r) => (replies[r.id] ? { ...r, ...replies[r.id] } : r));
  const [activeReplyId, setActiveReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const handlePostReply = (reviewId: string) => {
    if (!replyText.trim()) return;

    setReplies((prev) => ({ ...prev, [reviewId]: { reply: replyText, repliedAt: 'Just now' } }));

    setActiveReplyId(null);
    setReplyText('');
  };

  const total = serverReviews.length;
  const average = total ? serverReviews.reduce((acc, r) => acc + r.rating, 0) / total : 0;
  const ratingBars = [5, 4, 3, 2, 1].map((stars) => {
    const count = serverReviews.filter((r) => r.rating === stars).length;
    return { stars, count, percentage: total ? `${Math.round((count / total) * 100)}%` : '0%' };
  });

  return (
    <div className="space-y-8 pb-24 w-full max-w-[1840px] 2xl:max-w-[1920px] mx-auto">
      {/* Header */}
      <div>
        <p className="text-xs uppercase tracking-[0.22em] font-semibold text-stone-500">
          Reputation &amp; Trust
        </p>
        <h2 className="mt-1 font-display text-3xl sm:text-4xl md:text-5xl font-medium tracking-tightest text-stone-900 leading-tight">
          Customer <span className="italic font-normal">Reviews</span>
        </h2>
        <p className="text-sm sm:text-base text-stone-600 mt-1 leading-relaxed">
          Monitor your customer satisfaction scores and maintain client relationships by replying to verified reviews.
        </p>
      </div>

      {/* Rating Breakdown Banner */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-6 sm:p-8 shadow-xs grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Left: Overall Star Score */}
        <div className="lg:col-span-4 text-center lg:text-left border-b lg:border-b-0 lg:border-r border-stone-200/80 pb-6 lg:pb-0 lg:pr-8">
          <span className="text-xs uppercase font-bold tracking-wider text-stone-400">
            Composite Rating
          </span>
          <div className="mt-2 flex items-center justify-center lg:justify-start gap-3">
            <span className="font-display text-5xl sm:text-6xl font-medium tracking-tightest text-stone-900">
              {total ? average.toFixed(2) : '—'}
            </span>
            <div className="text-left">
              <div className="flex text-amber-400 text-lg">★★★★★</div>
              <div className="text-xs text-stone-500 font-semibold mt-0.5">
                Based on {total} verified {total === 1 ? 'review' : 'reviews'}
              </div>
            </div>
          </div>
          <p className="text-xs text-stone-500 mt-3 leading-relaxed">
            {total ? `${Math.round((serverReviews.filter((r) => r.rating >= 4).length / total) * 100)}% of reviewers rated ${businessName || 'you'} 4 stars or higher.` : 'You have no reviews yet. They appear here after customers rate completed jobs.'}
          </p>
        </div>

        {/* Right: 5-Star Distribution Bars */}
        <div className="lg:col-span-8 space-y-2.5">
          {ratingBars.map((bar) => (
            <div key={bar.stars} className="flex items-center gap-3 text-xs">
              <span className="w-8 font-bold text-stone-700 flex items-center gap-1">
                <span>{bar.stars}</span>
                <Star size={12} className="fill-amber-400 text-amber-400" />
              </span>
              <div className="flex-1 h-3 rounded-full bg-stone-100 overflow-hidden">
                <div
                  style={{ width: bar.percentage }}
                  className="h-full bg-amber-400 rounded-full transition-all"
                />
              </div>
              <span className="w-16 text-right font-mono font-semibold text-stone-500">
                {bar.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Review Feed */}
      <div className="space-y-4">
        <h3 className="font-display text-xl sm:text-2xl font-medium tracking-tight text-stone-900">
          Verified <span className="italic font-normal">Customer Feedback</span>
        </h3>

        <div className="space-y-4">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-6 sm:p-7 rounded-3xl bg-white border border-stone-200/90 shadow-xs space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <img
                    src={rev.customerAvatar}
                    alt={rev.customerName}
                    className="w-12 h-12 rounded-2xl object-cover border border-stone-200 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-bold text-stone-900">{rev.customerName}</h4>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold">
                        <ShieldCheck size={11} />
                        <span>Verified Service</span>
                      </span>
                    </div>
                    <div className="text-xs text-stone-500 mt-0.5">{rev.serviceTitle}</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start sm:self-auto">
                  <div className="flex text-amber-400 text-sm">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <span key={i}>★</span>
                    ))}
                  </div>
                  <span className="text-xs text-stone-400">{rev.date}</span>
                </div>
              </div>

              {/* Review Comment */}
              <p className="text-sm text-stone-700 leading-relaxed font-medium">
                &quot;{rev.comment}&quot;
              </p>

              {/* Existing Provider Reply */}
              {rev.reply && (
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-stone-900">
                      {businessName || 'Owner'} (Owner Response)
                    </span>
                    <span className="text-[10px] text-stone-400">{rev.repliedAt || 'Recently'}</span>
                  </div>
                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed italic">
                    &quot;{rev.reply}&quot;
                  </p>
                </div>
              )}

              {/* Reply Button or Inline Form */}
              {!rev.reply && (
                <div>
                  {activeReplyId !== rev.id ? (
                    <button
                      onClick={() => setActiveReplyId(rev.id)}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-stone-800 hover:text-black hover:underline"
                    >
                      <MessageSquare size={13} />
                      <span>Post a public response to this review</span>
                    </button>
                  ) : (
                    <div className="space-y-2 pt-2 animate-in fade-in duration-150">
                      <textarea
                        rows={2}
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder={`Write professional reply to ${rev.customerName}...`}
                        className="w-full p-3 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:border-black"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setActiveReplyId(null)}
                          className="px-3 py-1.5 rounded-lg border border-stone-200 text-xs font-semibold text-stone-600 hover:bg-stone-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handlePostReply(rev.id)}
                          className="px-4 py-1.5 rounded-lg bg-black text-white text-xs font-bold hover:bg-stone-800"
                        >
                          Publish Response
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
