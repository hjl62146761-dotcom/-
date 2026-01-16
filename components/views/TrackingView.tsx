
import React, { useState, useEffect } from 'react';
import { StructuredReport } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Loader2, RefreshCcw, ArrowRight, History, Zap } from 'lucide-react';

interface TrackingViewProps {
  reports: StructuredReport[];
}

const TrackingView: React.FC<TrackingViewProps> = ({ reports }) => {
  const [thisWeek, setThisWeek] = useState<string>(reports[0]?.id || '');
  const [trackingResult, setTrackingResult] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const selectedCurrent = reports.find(r => r.id === thisWeek);
  const others = reports.filter(r => r.id !== thisWeek);

  const handleTrack = async () => {
    if (!selectedCurrent) return;
    setLoading(true);
    try {
      const result = await geminiService.trackProgress(selectedCurrent, others);
      setTrackingResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-8">
          <div className="flex-1 w-full">
            <label className="block text-sm font-semibold text-gray-700 mb-2">현재 주차 보고서</label>
            <select 
              value={thisWeek}
              onChange={(e) => setThisWeek(e.target.value)}
              className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
            >
              {reports.map(r => (
                <option key={r.id} value={r.id}>
                  {r.report_meta.week_label} - {r.report_meta.company}
                </option>
              ))}
            </select>
          </div>
          
          <div className="p-4 bg-gray-100 rounded-full hidden md:block">
            <RefreshCcw size={20} className="text-gray-400" />
          </div>

          <div className="flex-1 w-full opacity-60">
            <label className="block text-sm font-semibold text-gray-700 mb-2">비교 대상 (과거 히스토리)</label>
            <div className="p-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-600 flex items-center gap-2">
              <History size={16} />
              <span className="text-sm font-medium">나머지 모든 보고서 ({others.length}개)</span>
            </div>
          </div>

          <button
            onClick={handleTrack}
            disabled={loading}
            className="w-full md:w-auto mt-7 flex items-center justify-center gap-2 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95 disabled:bg-gray-400"
          >
            {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} />}
            추적 분석 실행
          </button>
        </div>

        {trackingResult ? (
          <div className="mt-8 border-t border-gray-100 pt-8 animate-in fade-in slide-in-from-top-4">
            <div className="prose prose-slate max-w-none">
              <div className="bg-gray-50 p-8 rounded-2xl border border-gray-100 whitespace-pre-wrap font-sans leading-relaxed">
                {trackingResult}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-blue-50/50 border border-blue-100 p-10 rounded-2xl text-center">
            <RefreshCcw size={48} className="mx-auto text-blue-200 mb-4" />
            <h4 className="font-bold text-blue-900 text-lg mb-2">계획 대비 실적 추적</h4>
            <p className="text-blue-700/70 max-w-md mx-auto">지난주에 수립했던 '다음주 계획'이 이번주 '실적'으로 제대로 연결되었는지, 지연 항목은 얼마나 반복되었는지 한 번에 분석합니다.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-blue-600 rounded-full"></div>
            분석 핵심: 연속성
          </h5>
          <p className="text-sm text-gray-600 leading-relaxed">
            단순한 주간 단위 단절이 아닌, 과제별 Life-cycle을 추적합니다. '계획-실적' 불일치 항목을 자동으로 찾아내어 임원 보고 시 발생할 수 있는 오류를 사전에 차단합니다.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h5 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <div className="w-1.5 h-6 bg-red-500 rounded-full"></div>
            상습 지연 리스크 관리
          </h5>
          <p className="text-sm text-gray-600 leading-relaxed">
            3주 이상 연속으로 'Yellow' 또는 'Red' 상태인 과제를 감지하여 별도의 경고 메시지를 생성하고, 반복되는 리스크 키워드를 추출하여 근본 원인을 제언합니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrackingView;
