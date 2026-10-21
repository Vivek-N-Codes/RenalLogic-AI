import React from 'react';
import {
  Activity,
  GitBranch,
  Layers,
  FlaskConical,
  BookOpen,
  Printer,
  Info,
  CheckCircle2,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenReport: () => void;
  onOpenAbout: () => void;
  rulesCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenReport,
  onOpenAbout,
  rulesCount,
}) => {
  const navItems = [
    { id: 'dashboard', label: 'Clinical Assessment', icon: Activity },
    { id: 'trace', label: 'Inference Trace', icon: GitBranch },
    { id: 'graph', label: 'Reasoning Graph', icon: Layers },
    { id: 'laboratory', label: 'Test Laboratory', icon: FlaskConical },
    { id: 'rules', label: 'Knowledge Base', icon: BookOpen },
  ];

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Academic Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-sm ring-2 ring-teal-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900">
                  RenalLogic <span className="text-teal-600 font-extrabold">AI</span>
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/80 px-2 py-0.5 rounded-full">
                  <CheckCircle2 className="w-3 h-3 text-teal-600" />
                  KDIGO 2024 ({rulesCount} Rules)
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                Explainable Rule-Based Expert System • Chaining Engine & Proof Graph
              </p>
            </div>
          </div>

          {/* Center Tabs */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all ${
                    isActive
                      ? 'bg-teal-50 text-teal-800 border border-teal-200 shadow-2xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenReport}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
              title="Generate Printable Assessment Report"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Print Report</span>
            </button>
            <button
              onClick={onOpenAbout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-900 text-white hover:bg-slate-800 transition-colors shadow-2xs"
            >
              <Info className="w-3.5 h-3.5 text-teal-400" />
              <span>About & Safety</span>
            </button>
          </div>
        </div>

        {/* Mobile / Tablet Nav Strip */}
        <div className="lg:hidden flex items-center justify-between border-t border-slate-100 py-2 overflow-x-auto gap-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                  isActive
                    ? 'bg-teal-50 text-teal-800 border border-teal-200 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-600' : 'text-slate-400'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
