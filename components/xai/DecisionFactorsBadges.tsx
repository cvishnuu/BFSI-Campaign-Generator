import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Lightbulb } from 'lucide-react';

interface DecisionFactorsBadgesProps {
  factors: string[];
  title?: string;
}

export function DecisionFactorsBadges({ factors, title = 'Key Decision Factors' }: DecisionFactorsBadgesProps) {
  if (!factors || factors.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No decision factors available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {title && (
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-yellow-600" />
          {title}
        </h4>
      )}
      <div className="flex flex-wrap gap-2">
        {factors.map((factor, index) => (
          <Badge
            key={index}
            variant="secondary"
            className="bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100"
          >
            {factor}
          </Badge>
        ))}
      </div>
    </div>
  );
}
