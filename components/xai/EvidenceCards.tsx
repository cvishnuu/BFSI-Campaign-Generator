import React from 'react';
import { FileText, ExternalLink } from 'lucide-react';
import { ComplianceEvidence } from '@/types';

interface EvidenceCardsProps {
  evidence: ComplianceEvidence[];
  title?: string;
}

export function EvidenceCards({ evidence, title = 'Compliance Evidence' }: EvidenceCardsProps) {
  if (!evidence || evidence.length === 0) {
    return (
      <div className="text-sm text-gray-500 italic">
        No evidence available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-purple-600" />
          {title}
        </h4>
      )}
      <div className="space-y-2">
        {evidence.map((item, index) => (
          <div
            key={index}
            className="p-3 bg-purple-50 border border-purple-200 rounded-lg"
          >
            {item.sourceId && (
              <div className="flex items-center gap-2 mb-2">
                <ExternalLink className="w-3 h-3 text-purple-600" />
                <span className="text-xs font-semibold text-purple-900">
                  Source: {item.sourceId}
                </span>
              </div>
            )}
            <blockquote className="text-sm text-gray-700 italic border-l-2 border-purple-400 pl-3">
              &quot;{item.text}&quot;
            </blockquote>
          </div>
        ))}
      </div>
    </div>
  );
}
