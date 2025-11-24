import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, AlertCircle } from 'lucide-react';
import { ComplianceXaiMetadata } from '@/types';
import { ConfidenceMeter } from './ConfidenceMeter';
import { ReasoningTimeline } from './ReasoningTimeline';
import { DecisionFactorsBadges } from './DecisionFactorsBadges';
import { RuleHitsBadges } from './RuleHitsBadges';
import { EvidenceCards } from './EvidenceCards';

interface ComplianceXaiPanelProps {
  complianceXai: ComplianceXaiMetadata | undefined;
  title?: string;
  description?: string;
}

export function ComplianceXaiPanel({
  complianceXai,
  title = 'How was compliance evaluated?',
  description = 'AI compliance checking and regulatory analysis'
}: ComplianceXaiPanelProps) {
  // Handle missing XAI data
  if (!complianceXai) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-yellow-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Compliance XAI Data Not Available</p>
              <p className="text-sm text-yellow-700">
                Explainability information for compliance checking is not available.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Handle XAI error
  if (complianceXai.xaiError) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-red-800">
            <AlertCircle className="w-5 h-5" />
            <div>
              <p className="font-medium">Compliance XAI Error</p>
              <p className="text-sm text-red-700">{complianceXai.xaiError}</p>
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
          <Shield className="w-5 h-5 text-green-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Confidence Score */}
        {complianceXai.confidence !== undefined && (
          <div>
            <ConfidenceMeter
              confidence={complianceXai.confidence}
              size="md"
            />
          </div>
        )}

        {/* Decision Factors */}
        {complianceXai.decisionFactors && complianceXai.decisionFactors.length > 0 && (
          <div>
            <DecisionFactorsBadges
              factors={complianceXai.decisionFactors}
              title="Compliance Factors Considered"
            />
          </div>
        )}

        {/* Rule Hits (Violations or Matches) */}
        {complianceXai.ruleHits && complianceXai.ruleHits.length > 0 && (
          <div>
            <RuleHitsBadges ruleHits={complianceXai.ruleHits} />
          </div>
        )}

        {/* Reasoning Steps */}
        {complianceXai.reasoningTrace && complianceXai.reasoningTrace.length > 0 && (
          <div>
            <ReasoningTimeline
              steps={complianceXai.reasoningTrace}
              title="Compliance Evaluation Steps"
            />
          </div>
        )}

        {/* Evidence from Knowledge Base */}
        {complianceXai.evidence && complianceXai.evidence.length > 0 && (
          <div>
            <EvidenceCards evidence={complianceXai.evidence} />
          </div>
        )}

        {/* Empty state if no data */}
        {!complianceXai.confidence &&
         (!complianceXai.decisionFactors || complianceXai.decisionFactors.length === 0) &&
         (!complianceXai.reasoningTrace || complianceXai.reasoningTrace.length === 0) &&
         (!complianceXai.ruleHits || complianceXai.ruleHits.length === 0) &&
         (!complianceXai.evidence || complianceXai.evidence.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Shield className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <p className="text-sm">No detailed compliance analysis data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
