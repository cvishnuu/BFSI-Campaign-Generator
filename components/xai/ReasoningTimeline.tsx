import React from 'react';
import { CheckCircle2, ChevronRight } from 'lucide-react';

interface ReasoningTimelineProps {
  steps: string[];
  title?: string;
}

export function ReasoningTimeline({ steps, title = 'Reasoning Steps' }: ReasoningTimelineProps) {
  if (!steps || steps.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No reasoning steps available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      )}
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-start gap-3 group">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className="flex items-center justify-center w-6 h-6 rounded-full bg-green-100 border-2 border-green-500 flex-shrink-0">
                <CheckCircle2 className="w-3 h-3 text-green-600" />
              </div>
              {index < steps.length - 1 && (
                <div className="w-0.5 h-full min-h-[20px] bg-green-200 mt-1" />
              )}
            </div>

            {/* Step content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start gap-2">
                <ChevronRight className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-700 leading-relaxed">
                  {step}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
