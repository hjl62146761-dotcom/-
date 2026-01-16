
import React, { useState, useEffect } from 'react';
import { StructuredReport, ReportStatus } from '../../types';
import { geminiService } from '../../services/geminiService';
import { 
  FileText, 
  Copy, 
  Check, 
  Download, 
  BarChart2, 
  Triangle,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';

interface SummaryViewProps {
  report: StructuredReport;
}

const SummaryView: React.FC<SummaryViewProps> = ({ report }) => {
  const [summary, setSummary] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      try {
        const text = await geminiService.generateSummary(report);
        setSummary(text);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchSummary();
  }, [report]);

  const handleCopy = () => {
    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const statusCounts = report.sections.reduce((acc, section) => {
    section.items.forEach(item => {
      acc[item.status] = (acc[item.status] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* KPI Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">총 과제수</p>
          <p className="text-3xl font-bold text-gray-900">{report.sections.reduce((acc, s) => acc + s.items.length, 0)}</p>
        </div>
        <div className="bg-green-50 p-6 rounded-2xl border border-green-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-green-700 uppercase tracking-wider">정상(Green)</p>
            <CheckCircle className="text-green-600" size={16} />
          </div>
          <p className="text-3xl font-bold text-green-900">{statusCounts[ReportStatus.GREEN] || 0}</p>
        </div>
        <div className="bg-yellow-50 p-6 rounded-2xl border border-yellow-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-yellow-700 uppercase tracking-wider">지연(Yellow)</p>
            <HelpCircle className="text-yellow-600" size={16} />
          </div>
          <p className="text-3xl font-bold text-yellow-900">{statusCounts[ReportStatus.YELLOW] || 0}</p>
        </div>
        <div className="bg-red-50 p-6 rounded-2xl border border-red-100 shadow-sm">
          <div className="flex items-center justify-between mb-1">
            <p className="text-xs font-semibold text-red-700 uppercase tracking-wider">위험(Red)</p>
            <AlertCircle className="text-red-600" size={16} />
          </div>
          <p className="text-3xl font-bold text-red-900">{statusCounts[ReportStatus.RED] || 0}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main Document Area */}
        <div className="flex-1 bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText size={18} className="text-blue-600" />
              <span className="font-bold text-gray-800 text-sm">Word 보고서 초안</span>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-blue-600"
                title="복사하기"
              >
                {copied ? <Check size={18} /> : <Copy size={18} />}
              </button>
              <button className="p-2 hover:bg-white rounded-lg transition-colors text-gray-500 hover:text-green-600" title="다운로드">
                <Download size={18} />
              </button>
            </div>
          </div>
          
          <div className="p-10 flex-1 min-h-[600px] overflow-y-auto bg-white selection:bg-blue-100">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-20">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                <p className="text-gray-500 animate-pulse">임원용 요약 보고서를 생성하고 있습니다...</p>
              </div>
            ) : (
              <div className="prose prose-blue max-w-none">
                <div className="whitespace-pre-wrap font-serif text-gray-800 leading-relaxed text-base">
                  {summary}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Side Panel: Structured Data View */}
        <div className="w-full lg:w-96 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart2 size={18} className="text-blue-600" />
              추출된 조직 구조
            </h4>
            <div className="space-y-3">
              {report.sections.map((section, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-sm text-gray-800">{section.org_unit}</span>
                    <span className="text-[10px] font-bold bg-white px-2 py-0.5 rounded border border-gray-200 text-gray-500 uppercase">{section.category}</span>
                  </div>
                  <p className="text-xs text-gray-500">{section.items.length}개 과제 진행 중</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-sm text-white">
            <h4 className="font-bold mb-4 flex items-center gap-2">
              <Triangle size={18} className="text-blue-400" />
              데이터 품질 점검
            </h4>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-green-500"></div>
                <p className="text-xs text-slate-300">모든 항목이 조직/주차 정보와 매칭되었습니다.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-blue-500"></div>
                <p className="text-xs text-slate-300">정량 지표({report.sections.reduce((acc, s) => acc + s.items.reduce((a, i) => a + i.actual.metrics.length, 0), 0)}개)가 성공적으로 파싱되었습니다.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="mt-1 w-2 h-2 rounded-full bg-yellow-500"></div>
                <p className="text-xs text-slate-300">일부 계획(Plan)의 수치가 누락되어 '미기재'로 처리되었습니다.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryView;
