import React from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, AlertTriangle, XCircle } from 'lucide-react';

interface ConfidenceMeterProps {
  confidence: number; // 0-1
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ConfidenceMeter({ confidence, showLabel = true, size = 'md' }: ConfidenceMeterProps) {
  const percentage = Math.round(confidence * 100);

  // Determine color and status based on confidence level
  const getConfidenceStatus = () => {
    if (percentage >= 80) {
      return {
        color: 'text-green-600',
        bgColor: 'bg-green-600',
        label: 'High Confidence',
        icon: Sparkles,
        variant: 'success' as const,
      };
    } else if (percentage >= 50) {
      return {
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-600',
        label: 'Medium Confidence',
        icon: AlertTriangle,
        variant: 'warning' as const,
      };
    } else {
      return {
        color: 'text-red-600',
        bgColor: 'bg-red-600',
        label: 'Low Confidence',
        icon: XCircle,
        variant: 'destructive' as const,
      };
    }
  };

  const status = getConfidenceStatus();
  const Icon = status.icon;

  const sizeClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  const iconSizeClasses = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div className="space-y-2">
      {showLabel && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className={`${iconSizeClasses[size]} ${status.color}`} />
            <span className="text-sm font-medium text-gray-700">AI Confidence</span>
          </div>
          <Badge variant={status.variant} className="ml-2">
            {percentage}%
          </Badge>
        </div>
      )}
      <div className="relative">
        <Progress
          value={percentage}
          className={`${sizeClasses[size]} bg-gray-200`}
        />
        <div
          className={`absolute top-0 left-0 h-full ${status.bgColor} rounded-full transition-all duration-300`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showLabel && (
        <p className="text-xs text-gray-500">
          {status.label} - The AI is {percentage >= 80 ? 'very confident' : percentage >= 50 ? 'moderately confident' : 'uncertain'} about this {percentage >= 80 ? 'decision' : percentage >= 50 ? 'assessment' : 'evaluation'}
        </p>
      )}
    </div>
  );
}
