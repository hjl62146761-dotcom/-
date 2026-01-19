
import React, { useState, useEffect } from 'react';
import { StructuredReport, ReportStatus } from '../../types';
import { geminiService } from '../../services/geminiService';
import { 
  FileText, 
  Copy, 
  Check, 
  Loader2,
  Table as TableIcon,
  Hash,
  BookOpen,
  Printer,
  Download
} from 'lucide-react';

interface SummaryViewProps {
  report: StructuredReport;
}

const SummaryView: React.FC<SummaryViewProps> = ({ report }) => {
  const [reportText, setReportText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'WORD' | 'DATA'>('WORD');

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const text = await geminiService.generateSummary(report);
        setReportText(text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [report]);

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ReportStatus.GREEN: return 'bg-emerald-500';
      case ReportStatus.YELLOW: return 'bg-amber-400';
      case ReportStatus.RED: return 'bg-rose-500';
      case ReportStatus.MIXED: return 'bg-indigo-400';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Smart AJ AI Document Header */}
      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 flex flex-col md:flex-row gap-8 items-center border-t-8 border-t-blue-600">
        <div className={`w-32 h-32 rounded-3xl flex items-center justify-center shrink-0 border-4 ${
          report.summary.overall_status === ReportStatus.GREEN ? 'border-emerald-100 text-emerald-600' :
          report.summary.overall_status === ReportStatus.RED ? 'border-rose-100 text-rose-600' :
          'border-amber-100 text-amber-600'
        }`}>
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] leading-none opacity-40">DOC ID</p>
            <p className="text-xl font-black mt-2">{report.id}</p>
          </div>
        </div>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center gap-4">
            <h3 className="text-4xl font-black text-slate-900 tracking-tighter italic">Smart 주간업무 AJ AI</h3>
            <span className="bg-slate-900 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">{report.report_meta.week} 요약 완료</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-[11px] bg-blue-50 text-blue-600 px-4 py-1.5 rounded-xl font-black border border-blue-100 flex items-center gap-2">
              <Download size={14} /> Word 붙여넣기 최적화됨
            </span>
            {report.summary.key_messages.slice(0, 2).map((msg, i) => (
              <span key={i} className="text-[11px] bg-slate-50 text-slate-600 px-4 py-1.5 rounded-xl font-bold border border-slate-100 truncate max-w-[300px]">
                • {msg}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* View Selector */}
      <div className="flex gap-4 p-2 bg-slate-100 rounded-[2rem] w-fit">
        <button 
          onClick={() => setActiveTab('WORD')}
          className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'WORD' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <FileText size={16} />
          Word 보고서 템플릿
        </button>
        <button 
          onClick={() => setActiveTab('DATA')}
          className={`flex items-center gap-2 px-8 py-3 rounded-[1.5rem] text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'DATA' ? 'bg-white text-blue-600 shadow-xl' : 'text-slate-500 hover:text-slate-800'}`}
        >
          <TableIcon size={16} />
          데이터 그리드 뷰
        </button>
      </div>

      {activeTab === 'WORD' ? (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-2xl overflow-hidden min-h-[800px] flex flex-col">
          <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between px-10">
            <div className="flex items-center gap-3">
              <div className="w-2.5 h-2.5 bg-blue-600 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Smart 주간업무 AJ AI - 정형화된 Word 문서 생성</span>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={handleCopy}
                className="flex items-center gap-3 px-8 py-3 bg-blue-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl active:scale-95 group"
              >
                {copied ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                {copied ? '복사됨' : 'Word용 본문 전체 복사'}
              </button>
            </div>
          </div>
          <div className="p-20 flex-1 overflow-y-auto selection:bg-blue-600 selection:text-white">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full gap-8">
                <Loader2 className="animate-spin text-blue-600" size={64} />
                <div className="text-center">
                  <p className="text-slate-900 font-black uppercase tracking-[0.4em] text-sm mb-2">AJ AI DOCUMENT BUILDER</p>
                  <p className="text-slate-400 font-bold text-xs">Microsoft Word 형식으로 구조화하는 중...</p>
                </div>
              </div>
            ) : (
              <div className="prose prose-slate max-w-none 
                prose-table:border prose-table:border-slate-300 prose-table:rounded-lg prose-table:overflow-hidden
                prose-th:bg-slate-900 prose-th:text-white prose-th:p-4 prose-th:text-[11px] prose-th:uppercase prose-th:font-black 
                prose-td:p-4 prose-td:text-sm prose-td:border-t prose-td:border-slate-200
                prose-h1:text-4xl prose-h1:font-black prose-p:text-lg prose-p:leading-relaxed prose-h2:mt-12 prose-h2:border-b-2 prose-h2:border-slate-900 prose-h2:pb-2">
                <div className="whitespace-pre-wrap font-sans text-slate-900 leading-loose">
                  {reportText}
                </div>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border border-slate-200 shadow-xl overflow-hidden overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1200px]">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-6 px-10">Section / ID</th>
                <th className="p-6">Organization</th>
                <th className="p-6">Item / Category</th>
                <th className="p-6">Plan / Actual</th>
                <th className="p-6">Status</th>
                <th className="p-6">Action Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {report.details.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="p-6 px-10 align-top">
                    <p className="text-[10px] font-black text-slate-400 uppercase mb-2">{item.section || 'General'}</p>
                    <span className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-100">
                      <Hash size={12} /> {item.issue_id || 'N/A'}
                    </span>
                  </td>
                  <td className="p-6 align-top">
                    <span className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.org_unit}</span>
                  </td>
                  <td className="p-6 align-top">
                    <p className="text-base font-black text-slate-900 leading-tight mb-1">{item.item}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.category}</p>
                  </td>
                  <td className="p-6 align-top">
                    <div className="space-y-2">
                      <p className="text-[11px] text-slate-500 font-medium"><span className="font-black text-slate-400">P:</span> {item.plan}</p>
                      <p className="text-[11px] text-slate-900 font-black"><span className="font-black text-blue-600">A:</span> {item.actual}</p>
                      {item.gap && <p className="text-[10px] text-rose-500 font-bold">Gap: {item.gap}</p>}
                    </div>
                  </td>
                  <td className="p-6 align-top">
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded-full ${getStatusColor(item.status)} shadow-inner`}></div>
                      <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.status}</span>
                    </div>
                  </td>
                  <td className="p-6 align-top">
                    <p className="text-[11px] text-slate-600 font-medium leading-relaxed max-w-[250px] whitespace-pre-wrap">
                      {item.next_action || '-'}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default SummaryView;
