import React from 'react';
import { AlertTriangle } from 'lucide-react';

export const SafetyNotice: React.FC = () => {
  return (
    <div className="bg-amber-50/90 border border-amber-200 rounded-lg p-4 shadow-sm text-amber-900 text-sm">
      <div className="flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-amber-950 uppercase tracking-wide text-xs bg-amber-200/60 px-2 py-0.5 rounded">
              Academic AI Prototype Notice
            </span>
            <span className="text-xs text-amber-800 font-medium">
              Not a Medical Device • Educational & Research Use Only
            </span>
          </div>
          <p className="text-xs leading-relaxed text-amber-900">
            RenalLogic AI is an explainable rule-based expert system developed to demonstrate classical AI
            reasoning (Forward & Backward Chaining with 3-Valued Logic). It does not provide clinical diagnoses
            or prescribe medications. Per authoritative <strong>KDIGO 2024 guidelines</strong>, chronic kidney disease
            requires verified persistence of abnormalities for <strong>&ge; 3 months</strong>; a single abnormal lab value
            must never be taken as proof of chronic disease.
          </p>
        </div>
      </div>
    </div>
  );
};
