import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { ComplianceRuleHit } from '@/types';

interface RuleHitsBadgesProps {
  ruleHits: ComplianceRuleHit[];
  title?: string;
}

export function RuleHitsBadges({ ruleHits, title = 'Compliance Rule Matches' }: RuleHitsBadgesProps) {
  if (!ruleHits || ruleHits.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-green-600">
        <Shield className="w-4 h-4" />
        <span>No compliance violations detected</span>
      </div>
    );
  }

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'critical':
        return {
          variant: 'destructive' as const,
          icon: AlertCircle,
          color: 'text-red-600',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          points: 40,
        };
      case 'high':
        return {
          variant: 'destructive' as const,
          icon: AlertTriangle,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          points: 25,
        };
      case 'medium':
        return {
          variant: 'warning' as const,
          icon: AlertTriangle,
          color: 'text-yellow-600',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          points: 15,
        };
      case 'low':
        return {
          variant: 'secondary' as const,
          icon: Info,
          color: 'text-[#FA7315]',
          bgColor: 'bg-orange-50',
          borderColor: 'border-orange-200',
          points: 5,
        };
      default:
        return {
          variant: 'secondary' as const,
          icon: Info,
          color: 'text-gray-600',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          points: 0,
        };
    }
  };

  return (
    <div className="space-y-3">
      {title && (
        <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#FA7315]" />
          {title}
        </h4>
      )}
      <div className="space-y-2">
        {ruleHits.map((hit, index) => {
          const config = getSeverityConfig(hit.severity);
          const Icon = config.icon;

          return (
            <div
              key={index}
              className={`p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}
            >
              <div className="flex items-start gap-2">
                <Icon className={`w-4 h-4 mt-0.5 ${config.color}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">
                      {hit.rule}
                    </span>
                    <Badge variant={config.variant} className="text-xs">
                      {hit.severity}
                    </Badge>
                    {config.points > 0 && (
                      <span className={`text-xs font-semibold ${config.color}`}>
                        -{config.points} points
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-700 mb-2">{hit.reason}</p>
                  {hit.evidence && (
                    <div className="text-xs text-gray-600 bg-white/50 p-2 rounded border border-gray-200">
                      <span className="font-medium">Evidence: </span>
                      <span className="italic">&quot;{hit.evidence}&quot;</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
