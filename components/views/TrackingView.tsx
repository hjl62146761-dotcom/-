
import React, { useState } from 'react';
import { StructuredReport } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Loader2, RefreshCcw, History, Zap, TrendingUp, AlertTriangle, CheckSquare, Copy, Check } from 'lucide-react';

interface TrackingViewProps {
  reports: StructuredReport[];
}

const TrackingView: React.FC<TrackingViewProps> = ({ reports }) => {
  const [targetId, setTargetId] = useState<string>(reports[0]?.id || '');
  const [trackingResult, setTrackingResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedTarget = reports.find(r => r.id === targetId);
  const historyReports = reports.filter(r => r.id !== targetId);

  const handleTrack = async () => {
    if (!selectedTarget) return;
    setLoading(true);
    try {
      const result = await geminiService.trackProgress(selectedTarget, historyReports);
      setTrackingResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(trackingResult);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="bg-white rounded-[2.5rem] border border-gray-200 p-10 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5">
          <TrendingUp size={160} />
        </div>
        
        <div className="relative z-10 flex flex-col lg:flex-row items-end gap-6 mb-10 border-b border-slate-50 pb-10">
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Target Report ID</label>
            <select 
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              className="w-full p-5 bg-slate-50 border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-blue-500/10 font-black text-slate-900 transition-all cursor-pointer"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.id} | {r.report_meta.week} ({r.report_meta.source})
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex-1 w-full">
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Historical Context</label>
            <div className="p-5 bg-slate-50 border border-slate-200 rounded-3xl text-slate-900 flex items-center gap-3 font-black">
              <History size={20} className="text-blue-600" />
              <span>{historyReports.length} 개의 누적 히스토리 자동 참조</span>
            </div>
          </div>

          <button
            onClick={handleTrack}
            disabled={loading || reports.length < 2}
            className="w-full lg:w-auto flex items-center justify-center gap-4 bg-slate-900 text-white px-12 py-5 rounded-[2rem] font-black text-sm uppercase tracking-widest hover:bg-slate-800 transition-all shadow-2xl active:scale-95 disabled:bg-slate-100 disabled:text-slate-300"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            Smart 누적 분석 실행
          </button>
        </div>

        {trackingResult ? (
          <div className="mt-8 animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-center justify-between mb-6 px-4">
              <h4 className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Smart AJ AI: 누적 변화 분석 리포트</h4>
              <button 
                onClick={handleCopy}
                className="flex items-center gap-2 text-[10px] font-black text-slate-500 hover:text-blue-600 transition-colors bg-slate-50 px-4 py-2 rounded-xl"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                결과 복사
              </button>
            </div>
            <div className="prose prose-slate max-w-none 
              prose-table:border prose-table:border-slate-800 prose-table:rounded-lg
              prose-th:bg-slate-900 prose-th:text-white prose-th:p-4 prose-th:text-[10px] prose-th:uppercase
              prose-td:p-4 prose-td:text-sm prose-td:border-slate-200">
              <div className="bg-white text-slate-900 p-12 rounded-[2rem] border border-slate-100 whitespace-pre-wrap font-sans leading-relaxed shadow-lg">
                {trackingResult}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50/50 border-2 border-dashed border-slate-200 p-20 rounded-[3rem] text-center">
            <TrendingUp size={80} className="mx-auto text-slate-200 mb-8" />
            <h4 className="font-black text-slate-900 text-2xl mb-4">누적 추적 및 변화 분석</h4>
            <p className="text-slate-500 max-w-lg mx-auto leading-relaxed font-medium">
              Smart 주간업무 AJ AI가 과거 보고서들을 종합 분석하여 
              신규 추가된 과제, 지연되고 있는 항목, 반복되는 리스크를 표 형식으로 도출합니다.
            </p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-10">
        {[
          { icon: <TrendingUp className="text-blue-600" />, title: "변화 가시화", desc: "주차별 실적 상태의 변화를 감지하여 전주 대비 개선/악화 여부를 표로 정리합니다." },
          { icon: <AlertTriangle className="text-rose-500" />, title: "지속 미달 감지", desc: "3주 이상 동일한 Gap이 발생하는 항목을 AI가 상시 모니터링하여 상보합니다." },
          { icon: <CheckSquare className="text-emerald-500" />, title: "정합성 검증", desc: "계획이 실적으로 전환되었는지, 누락된 항목이 있는지 히스토리를 대조합니다." }
        ].map((feat, i) => (
          <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all">
            <div className="w-16 h-16 bg-slate-50 rounded-[1.5rem] flex items-center justify-center mb-6 shadow-inner">{feat.icon}</div>
            <h5 className="font-black text-slate-900 mb-3 tracking-tight">{feat.title}</h5>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{feat.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingView;
