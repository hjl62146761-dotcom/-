
import React from 'react';
import { StructuredReport, ReportStatus } from '../../types';
import { Trash2, ExternalLink, Calendar, Layers, FileText, Hash } from 'lucide-react';

interface HistoryViewProps {
  reports: StructuredReport[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ reports, onSelect, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-2xl font-black text-gray-900 tracking-tight">요약 히스토리 관리 <span className="text-blue-600 ml-2 bg-blue-50 px-3 py-1 rounded-full text-base">{reports.length}</span></h3>
      </div>
      
      {reports.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-[2.5rem] py-24 text-center">
          <div className="bg-gray-50 w-24 h-24 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-inner">
            <FileText className="text-gray-300" size={40} />
          </div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No saved summaries found.</p>
          <p className="text-gray-400 text-sm mt-2">새 파일을 업로드하여 AI 분석을 시작하세요.</p>
        </div>
      ) : (
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em]">
                <th className="p-5 px-8">요약 ID</th>
                <th className="p-5">주차</th>
                <th className="p-5">분석 대상 (파일명)</th>
                <th className="p-5">생성일</th>
                <th className="p-5">상태 비중</th>
                <th className="p-5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="p-5 px-8 font-black text-blue-600 text-sm">
                    <div className="flex items-center gap-2">
                      <Hash size={14} className="opacity-40" />
                      {report.id}
                    </div>
                  </td>
                  <td className="p-5 font-bold text-slate-800 text-sm">
                    {report.report_meta.week}
                  </td>
                  <td className="p-5 text-slate-500 text-sm truncate max-w-[200px]">
                    <div className="flex items-center gap-2">
                      <FileText size={14} />
                      {report.report_meta.source}
                    </div>
                  </td>
                  <td className="p-5 text-slate-400 text-[11px] font-bold">
                    {new Date(report.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-1 w-24">
                      {Object.entries(
                        report.details.reduce((acc, d) => {
                          acc[d.status] = (acc[d.status] || 0) + 1;
                          return acc;
                        }, {} as Record<string, number>)
                      ).map(([status, count]) => (
                        <div 
                          key={status} 
                          className={`h-1.5 rounded-full flex-1 ${
                            status === ReportStatus.GREEN ? 'bg-emerald-500' :
                            status === ReportStatus.YELLOW ? 'bg-amber-400' :
                            status === ReportStatus.RED ? 'bg-rose-500' : 'bg-slate-200'
                          }`}
                          title={`${status}: ${count}`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-3">
                      <button
                        onClick={() => onSelect(report.id)}
                        className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-all shadow-sm"
                        title="상세 보기"
                      >
                        <ExternalLink size={16} />
                      </button>
                      <button 
                        onClick={() => onDelete(report.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all rounded-lg"
                        title="삭제"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
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

export default HistoryView;
