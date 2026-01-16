
import React, { useState, useEffect, useCallback } from 'react';
import { AppView, StructuredReport, ReportStatus } from './types';
import { geminiService } from './services/geminiService';
import { 
  FileText, 
  BarChart3, 
  RefreshCcw, 
  MessageSquare, 
  History, 
  ChevronRight, 
  LayoutDashboard,
  Plus,
  Trash2,
  Download,
  CheckCircle2,
  AlertCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

// Sub-components
import SidebarItem from './components/SidebarItem';
import ExtractionView from './components/views/ExtractionView';
import SummaryView from './components/views/SummaryView';
import TrackingView from './components/views/TrackingView';
import ChatView from './components/views/ChatView';
import HistoryView from './components/views/HistoryView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('EXTRACT');
  const [reports, setReports] = useState<StructuredReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Load reports from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('reportflow_reports');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load reports", e);
      }
    }
  }, []);

  // Save reports to localStorage
  useEffect(() => {
    localStorage.setItem('reportflow_reports', JSON.stringify(reports));
  }, [reports]);

  const handleReportAdded = (newReport: StructuredReport) => {
    setReports(prev => [newReport, ...prev]);
    setSelectedReportId(newReport.id);
    setActiveView('SUMMARY');
  };

  const deleteReport = (id: string) => {
    setReports(prev => prev.filter(r => r.id !== id));
    if (selectedReportId === id) setSelectedReportId(null);
  };

  const selectedReport = reports.find(r => r.id === selectedReportId) || null;

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight">ReportFlow <span className="text-blue-400">AI</span></h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mb-2">Analysis</div>
          <SidebarItem 
            icon={<Plus size={18} />} 
            label="새 보고서 분석" 
            active={activeView === 'EXTRACT'} 
            onClick={() => setActiveView('EXTRACT')} 
          />
          <SidebarItem 
            icon={<FileText size={18} />} 
            label="요약 보고서" 
            active={activeView === 'SUMMARY'} 
            onClick={() => setActiveView('SUMMARY')} 
            disabled={!selectedReport}
          />
          <SidebarItem 
            icon={<RefreshCcw size={18} />} 
            label="계획-실적 추적" 
            active={activeView === 'TRACKING'} 
            onClick={() => setActiveView('TRACKING')} 
            disabled={reports.length < 2}
          />
          
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 mt-6 mb-2">Insights</div>
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="지식베이스 Q&A" 
            active={activeView === 'CHAT'} 
            onClick={() => setActiveView('CHAT')} 
            disabled={reports.length === 0}
          />
          <SidebarItem 
            icon={<History size={18} />} 
            label="히스토리 관리" 
            active={activeView === 'HISTORY'} 
            onClick={() => setActiveView('HISTORY')} 
          />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center font-bold text-xs">AI</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Premium Analyst</p>
              <p className="text-xs text-slate-400">Gemini 3 Pro</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-8 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800">
              {activeView === 'EXTRACT' && "새 주간보고서 분석"}
              {activeView === 'SUMMARY' && "임원용 요약 보고서"}
              {activeView === 'TRACKING' && "보고 항목 추적 관리"}
              {activeView === 'CHAT' && "리포트 지식베이스 챗봇"}
              {activeView === 'HISTORY' && "보고서 관리"}
            </h2>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {selectedReport && (
              <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100 font-medium">
                {selectedReport.report_meta.week_label} ({selectedReport.report_meta.company})
              </div>
            )}
            <div className="text-gray-400">|</div>
            <button className="text-gray-500 hover:text-gray-700 font-medium">사용 가이드</button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-gray-50/50">
          <div className="max-w-6xl mx-auto p-8">
            {activeView === 'EXTRACT' && <ExtractionView onReportAdded={handleReportAdded} />}
            {activeView === 'SUMMARY' && selectedReport && <SummaryView report={selectedReport} />}
            {activeView === 'TRACKING' && reports.length >= 2 && <TrackingView reports={reports} />}
            {activeView === 'CHAT' && <ChatView reports={reports} />}
            {activeView === 'HISTORY' && (
              <HistoryView 
                reports={reports} 
                onSelect={(id) => {
                  setSelectedReportId(id);
                  setActiveView('SUMMARY');
                }} 
                onDelete={deleteReport} 
              />
            )}
            
            {!selectedReport && activeView === 'SUMMARY' && (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <FileText size={64} className="text-gray-300 mb-4" />
                <h3 className="text-xl font-medium text-gray-900">선택된 보고서가 없습니다</h3>
                <p className="text-gray-500 mt-2 max-w-sm">히스토리에서 보고서를 선택하거나 새로운 PPT 데이터를 분석해주세요.</p>
                <button 
                  onClick={() => setActiveView('EXTRACT')}
                  className="mt-6 bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition"
                >
                  새 보고서 등록하기
                </button>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
