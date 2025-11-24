import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, AlertCircle } from 'lucide-react';
import { XaiMetadata } from '@/types';
import { ConfidenceMeter } from './ConfidenceMeter';
import { ReasoningTimeline } from './ReasoningTimeline';
import { DecisionFactorsBadges } from './DecisionFactorsBadges';

interface XaiReasoningPanelProps {
  xai: XaiMetadata | undefined;
  title?: string;
  description?: string;
}

export function XaiReasoningPanel({
  xai,
  title = 'How was this message generated?',
  description = 'AI reasoning and decision-making process'
}: XaiReasoningPanelProps) {
  // Handle missing XAI data
  if (!xai) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">XAI Data Not Available</p>
              <p className="text-sm text-yellow-700">
                Explainability information is not available for this message.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-blue-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confidence Score */}
        {xai.confidence !== undefined && (
          <div>
            <ConfidenceMeter confidence={xai.confidence} size="md" />
          </div>
        )}

        {/* Decision Factors */}
        {xai.decisionFactors && xai.decisionFactors.length > 0 && (
          <div>
            <DecisionFactorsBadges factors={xai.decisionFactors} />
          </div>
        )}

        {/* Reasoning Steps */}
        {xai.reasoningTrace && xai.reasoningTrace.length > 0 && (
          <div>
            <ReasoningTimeline steps={xai.reasoningTrace} />
          </div>
        )}

        {/* Feature Contributions (if available) */}
        {xai.featureContributions && xai.featureContributions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-gray-900">Feature Contributions</h4>
            <div className="space-y-2">
              {xai.featureContributions.map((contribution, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">
                        {contribution.feature}
                      </span>
                      <span className="text-xs text-gray-600">
                        {Math.round(contribution.weight * 100)}%
                      </span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-500 rounded-full transition-all"
                        style={{ width: `${contribution.weight * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{contribution.impact}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty state if no data */}
        {!xai.confidence &&
         (!xai.decisionFactors || xai.decisionFactors.length === 0) &&
         (!xai.reasoningTrace || xai.reasoningTrace.length === 0) &&
         (!xai.featureContributions || xai.featureContributions.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Brain className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No detailed reasoning data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
