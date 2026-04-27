"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Star } from "lucide-react";
import CustomerNav from "@/components/layout/CustomerNav";
import CustomerFooter from "@/components/layout/CustomerFooter";
import { getRequestById } from "@/lib/requests";
import { submitCustomerServiceRequestRating } from "@/lib/customerServiceRequestRating";
import { readAuthApiErrorMessage } from "@/services/auth";

const FEEDBACK_TAGS = [
  "Professional",
  "Quick Response",
  "Friendly",
  "Quality Work",
  "Good Communication",
  "Fair Pricing",
];

export default function RateExperiencePage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params.id === "string" ? params.id : "";
  const mockRequest = getRequestById(id);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState("");
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const requestIdNum = Number(id);
  const isValidRequestId = Number.isFinite(requestIdNum) && requestIdNum > 0;

  const buildComment = (): string => {
    const parts: string[] = [];
    const text = feedback.trim();
    if (text) parts.push(text);
    if (selectedTags.size) {
      parts.push(`Tags: ${[...selectedTags].join(", ")}`);
    }
    return parts.join("\n\n");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!isValidRequestId) {
      setSubmitError("Invalid service request. Go back to your request history and try again.");
      return;
    }
    if (rating < 1) {
      setSubmitError("Please select a star rating before submitting.");
      return;
    }
    setSubmitting(true);
    try {
      await submitCustomerServiceRequestRating(requestIdNum, {
        rating,
        comment: buildComment(),
      });
      router.push("/customer/requests");
    } catch (err) {
      setSubmitError(readAuthApiErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    router.push("/customer/requests");
  };

  if (!isValidRequestId) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <CustomerNav />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center">
            <p className="text-gray-600 mb-4">Request not found.</p>
            <Link
              href="/customer/requests"
              className="text-orange-500 hover:underline font-medium"
            >
              Back to Request History
            </Link>
          </div>
        </main>
        <CustomerFooter />
      </div>
    );
  }

  const displayRating = hoverRating || rating;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <CustomerNav />

      <main className="flex-1 bg-slate-900">
        <div className="max-w-2xl mx-auto px-4 py-10">
          <h1 className="text-2xl md:text-3xl font-bold text-white">
            Rate Your Experience
          </h1>
          {mockRequest ? (
            <p className="mt-2 text-slate-400 text-sm">
              {mockRequest.serviceName} · {mockRequest.serviceProvider}
            </p>
          ) : null}
          {submitError ? (
            <div
              className="mt-6 rounded-lg border border-red-400/50 bg-red-950/50 px-4 py-3 text-sm text-red-200"
              role="alert"
            >
              {submitError}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-8 mt-8">
            <div>
              <p className="text-white font-medium mb-4">
                How would you rate the service?
              </p>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setRating(value)}
                    onMouseEnter={() => setHoverRating(value)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-slate-900"
                    aria-label={`Rate ${value} stars`}
                  >
                    <Star
                      className={`w-10 h-10 transition-colors ${
                        value <= displayRating
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-500"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label
                htmlFor="feedback"
                className="block text-white font-medium mb-2"
              >
                Additional Feedback (Optional)
              </label>
              <textarea
                id="feedback"
                rows={4}
                placeholder="Share more about your experience with the service provider..."
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-white placeholder-slate-400 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none"
              />
              <p className="text-slate-400 text-sm mt-2">
                Your feedback helps us improve our service and assists other
                drivers
              </p>
            </div>

            <div>
              <p className="text-white font-medium mb-3">Quick Feedback Tags</p>
              <div className="flex flex-wrap gap-2">
                {FEEDBACK_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      selectedTags.has(tag)
                        ? "bg-blue-700 text-white"
                        : "bg-slate-600/60 text-slate-300 hover:bg-slate-600"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-6 py-3 bg-blue-700 hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60 text-white rounded-lg font-semibold transition-colors"
              >
                {submitting ? "Submitting…" : "Submit Feedback"}
              </button>
              <button
                type="button"
                onClick={handleSkip}
                disabled={submitting}
                className="px-6 py-3 bg-slate-700/50 hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-60 text-slate-300 rounded-lg font-medium transition-colors"
              >
                Skip for Now
              </button>
            </div>
          </form>
        </div>
      </main>

      <CustomerFooter />
    </div>
  );
}
