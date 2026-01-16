
import React from 'react';
import { StructuredReport, ReportStatus } from '../../types';
import { Trash2, ExternalLink, Calendar, Users, FileText } from 'lucide-react';

interface HistoryViewProps {
  reports: StructuredReport[];
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

const HistoryView: React.FC<HistoryViewProps> = ({ reports, onSelect, onDelete }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-xl font-bold text-gray-900">분석 히스토리 <span className="text-blue-600 ml-1">{reports.length}</span></h3>
      </div>
      
      {reports.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-gray-200 rounded-3xl py-20 text-center">
          <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="text-gray-400" size={32} />
          </div>
          <p className="text-gray-500 font-medium">저장된 보고서가 없습니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <div 
              key={report.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all overflow-hidden group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider">
                    {report.report_meta.company}
                  </div>
                  <button 
                    onClick={() => onDelete(report.id)}
                    className="text-gray-300 hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <h4 className="font-bold text-gray-900 text-lg mb-4 truncate" title={report.report_meta.week_label}>
                  {report.report_meta.week_label}
                </h4>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar size={16} />
                    <span>{report.report_meta.report_date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users size={16} />
                    <span>{report.sections.length}개 부서 분석 완료</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 mb-6">
                  {Object.entries(
                    report.sections.reduce((acc, s) => {
                      s.items.forEach(i => acc[i.status] = (acc[i.status] || 0) + 1);
                      return acc;
                    }, {} as Record<string, number>)
                  ).map(([status, count]) => (
                    <div 
                      key={status} 
                      className={`h-1.5 rounded-full flex-1 ${
                        status === ReportStatus.GREEN ? 'bg-green-500' :
                        status === ReportStatus.YELLOW ? 'bg-yellow-400' :
                        status === ReportStatus.RED ? 'bg-red-500' : 'bg-gray-300'
                      }`}
                      title={`${status}: ${count}`}
                    />
                  ))}
                </div>

                <button
                  onClick={() => onSelect(report.id)}
                  className="w-full flex items-center justify-center gap-2 bg-gray-50 text-gray-700 py-3 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all border border-gray-100 group-hover:border-blue-200"
                >
                  상세 보기
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryView;
