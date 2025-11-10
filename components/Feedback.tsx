
import React, { useState } from 'react';
import { ThumbsUpIcon, ThumbsDownIcon, CheckIcon } from './Icons';

type FeedbackData = {
  satisfied: boolean;
  reasons?: string[];
  other?: string;
};

interface FeedbackProps {
  onFeedback: (data: FeedbackData) => void;
}

const FEEDBACK_REASONS = [
  'Architecture Changed',
  'Weird Lighting',
  'Incorrect Furniture',
  'Style Doesn\'t Match',
];

export const Feedback: React.FC<FeedbackProps> = ({ onFeedback }) => {
  const [stage, setStage] = useState<'initial' | 'reason' | 'submitted'>('initial');
  const [selectedReasons, setSelectedReasons] = useState<string[]>([]);
  const [otherReason, setOtherReason] = useState('');

  const handleSatisfied = () => {
    onFeedback({ satisfied: true });
    setStage('submitted');
  };

  const handleNotSatisfied = () => {
    setStage('reason');
  };

  const handleReasonToggle = (reason: string) => {
    setSelectedReasons((prev) =>
      prev.includes(reason)
        ? prev.filter((r) => r !== reason)
        : [...prev, reason]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFeedback({
      satisfied: false,
      reasons: selectedReasons,
      other: otherReason.trim(),
    });
    setStage('submitted');
  };

  return (
    <>
      {/* Modal for feedback form */}
      {stage === 'reason' && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in"
          style={{ animationDuration: '200ms' }}
        >
          <form 
            onSubmit={handleSubmit} 
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg text-gray-800">What went wrong?</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEEDBACK_REASONS.map((reason) => (
                <label key={reason} className="flex items-center space-x-2 text-sm text-gray-700 p-2 rounded-md hover:bg-gray-100 cursor-pointer transition-colors">
                  <input
                    type="checkbox"
                    checked={selectedReasons.includes(reason)}
                    onChange={() => handleReasonToggle(reason)}
                    className="rounded border-gray-300 text-brand-accent focus:ring-brand-accent focus:ring-offset-2"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <div>
              <input
                type="text"
                value={otherReason}
                onChange={(e) => setOtherReason(e.target.value)}
                placeholder="Other (please specify)..."
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-brand-accent focus:ring-brand-accent sm:text-sm bg-white text-gray-900"
              />
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button
                  type="button"
                  onClick={() => setStage('initial')}
                  className="bg-gray-100 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-200 transition-colors text-sm"
              >
                  Cancel
              </button>
              <button
                  type="submit"
                  className="bg-brand-primary text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors text-sm"
              >
                  Submit Feedback
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Inline part */}
      {stage !== 'reason' && (
        <div className="absolute bottom-4 right-4 z-10 animate-fade-in" style={{animationDuration: '300ms'}}>
          {stage === 'submitted' ? (
            <div className="bg-white rounded-full px-4 py-2 shadow-md flex items-center gap-2 text-sm font-medium text-gray-700">
              <CheckIcon className="w-5 h-5 text-green-500" />
              Thanks for your feedback!
            </div>
          ) : ( // 'initial' stage
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSatisfied}
                className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 hover:text-green-600 shadow-md transition-all"
                aria-label="Satisfied with this design"
              >
                <ThumbsUpIcon className="w-6 h-6" />
              </button>
              <button
                onClick={handleNotSatisfied}
                className="p-2 rounded-full bg-white text-gray-600 hover:bg-gray-100 hover:text-red-600 shadow-md transition-all"
                aria-label="Not satisfied with this design"
              >
                <ThumbsDownIcon className="w-6 h-6" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
};
