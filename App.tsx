
import React, { useState, useEffect } from 'react';
import { AppView, StructuredReport, UserRole } from './types';
import { geminiService } from './services/geminiService';
import { 
  FileText, 
  RefreshCcw, 
  MessageSquare, 
  History, 
  LayoutDashboard,
  Plus,
  LineChart,
  ShieldCheck,
  UserCircle,
  Share2,
  Check
} from 'lucide-react';

// Sub-components
import SidebarItem from './components/SidebarItem';
import ExtractionView from './components/views/ExtractionView';
import SummaryView from './components/views/SummaryView';
import TrackingView from './components/views/TrackingView';
import ChatView from './components/views/ChatView';
import HistoryView from './components/views/HistoryView';
import KpiDashboardView from './components/views/KpiDashboardView';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<AppView>('EXTRACT');
  const [reports, setReports] = useState<StructuredReport[]>([]);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [role, setRole] = useState<UserRole>('EXECUTIVE');
  const [shareCopied, setShareCopied] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('reportflow_reports_v3');
    if (saved) {
      try {
        setReports(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load reports", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('reportflow_reports_v3', JSON.stringify(reports));
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

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareCopied(true);
    setTimeout(() => setShareCopied(false), 2000);
  };

  const selectedReport = reports.find(r => r.id === selectedReportId) || null;

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      <aside className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
          <div className="bg-blue-600 p-2 rounded-lg">
            <LayoutDashboard size={20} className="text-white" />
          </div>
          <h1 className="text-lg font-black tracking-tight leading-tight">Smart 주간업무 <span className="text-blue-400">AJ AI</span></h1>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mb-2">Analysis</div>
          <SidebarItem 
            icon={<Plus size={18} />} 
            label="새 보고서 분석" 
            active={activeView === 'EXTRACT'} 
            onClick={() => setActiveView('EXTRACT')} 
          />
          <SidebarItem 
            icon={<FileText size={18} />} 
            label="주간 요약 보고" 
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
          <SidebarItem 
            icon={<LineChart size={18} />} 
            label="KPI 대시보드" 
            active={activeView === 'KPI_DASHBOARD'} 
            onClick={() => setActiveView('KPI_DASHBOARD')} 
            disabled={reports.length === 0}
          />
          
          <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2 mt-6 mb-2">Knowledge Base</div>
          <SidebarItem 
            icon={<MessageSquare size={18} />} 
            label="리포트 질의응답" 
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

          <div className="pt-4 mt-4 border-t border-slate-800">
            <button
              onClick={handleShare}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-800 hover:text-blue-400 transition-all"
            >
              {shareCopied ? <Check size={18} className="text-emerald-400" /> : <Share2 size={18} />}
              {shareCopied ? "주소 복사됨!" : "서비스 공유하기"}
            </button>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-black text-slate-500 uppercase px-1">Access Role</label>
            <div className="flex bg-slate-800 rounded-lg p-1">
              {(['EXECUTIVE', 'MANAGER', 'STAFF'] as UserRole[]).map(r => (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={`flex-1 py-1.5 rounded text-[10px] font-bold transition-all ${role === r ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  {r[0]}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg mt-2">
              <UserCircle size={20} className="text-blue-400" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold truncate">{role} Mode</p>
                <p className="text-[10px] text-slate-500">Smart 주간업무 AJ AI</p>
              </div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0 shadow-sm z-10">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            {activeView === 'EXTRACT' && "Smart Report Parser"}
            {activeView === 'SUMMARY' && "Executive Summary"}
            {activeView === 'TRACKING' && "Cumulative Tracker"}
            {activeView === 'KPI_DASHBOARD' && "KPI Time-series"}
            {activeView === 'CHAT' && "Report Intelligence"}
            {activeView === 'HISTORY' && "Archive Manager"}
          </h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[10px] font-black bg-blue-50 text-blue-700 px-3 py-1.5 rounded-full border border-blue-100 uppercase">
              <ShieldCheck size={14} />
              {role} ACCESS
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-8">
            {activeView === 'EXTRACT' && <ExtractionView onReportAdded={handleReportAdded} />}
            {activeView === 'SUMMARY' && selectedReport && <SummaryView report={selectedReport} />}
            {activeView === 'TRACKING' && reports.length >= 2 && <TrackingView reports={reports} />}
            {activeView === 'KPI_DASHBOARD' && reports.length > 0 && <KpiDashboardView reports={reports} />}
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
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95">
                <FileText size={80} className="text-slate-200 mb-6" />
                <h3 className="text-2xl font-black text-slate-900">보고서가 선택되지 않았습니다</h3>
                <p className="text-slate-500 mt-2 max-w-sm">히스토리에서 리포트를 선택하거나 새로운 PPT/PDF 데이터를 업로드해주세요.</p>
                <button 
                  onClick={() => setActiveView('EXTRACT')}
                  className="mt-8 bg-blue-600 text-white px-8 py-3 rounded-2xl font-bold hover:bg-blue-700 transition shadow-xl shadow-blue-600/20 active:scale-95"
                >
                  새 보고서 분석하기
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
