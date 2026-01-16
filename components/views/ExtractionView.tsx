
import React, { useState } from 'react';
import { geminiService } from '../../services/geminiService';
import { StructuredReport } from '../../types';
import { Loader2, Zap, Save, AlertCircle } from 'lucide-react';

interface ExtractionViewProps {
  onReportAdded: (report: StructuredReport) => void;
}

const ExtractionView: React.FC<ExtractionViewProps> = ({ onReportAdded }) => {
  const [metaText, setMetaText] = useState(`- 회사/조직: AJ Networks\n- 보고 주차: 2026년 1월 1주차\n- 보고일: 2026-01-05`);
  const [pptText, setPptText] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExtract = async () => {
    if (!pptText.trim()) {
      setError("PPT 추출 텍스트를 입력해주세요.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const report = await geminiService.extractReport(metaText, pptText);
      onReportAdded(report);
    } catch (err: any) {
      setError(err.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-slate-50 to-white">
          <div>
            <h3 className="text-lg font-bold text-gray-900">데이터 입력</h3>
            <p className="text-sm text-gray-500">PPT에서 복사한 텍스트와 메타데이터를 입력하세요.</p>
          </div>
          <Zap className="text-yellow-500" />
        </div>
        
        <div className="p-8 space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">기본 정보 (메타데이터)</label>
            <textarea
              value={metaText}
              onChange={(e) => setMetaText(e.target.value)}
              className="w-full h-24 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm font-mono"
              placeholder="- 회사/조직: (예: AJ Networks)\n- 보고 주차: (예: 2026년 1월 1주차)\n- 보고일: (예: 2026-01-05)"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">PPT 추출 텍스트 / 표 내용</label>
            <textarea
              value={pptText}
              onChange={(e) => setPptText(e.target.value)}
              className="w-full h-80 p-4 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all outline-none text-sm"
              placeholder="PPT 슬라이드의 내용을 모두 붙여넣으세요. 표 데이터도 좋습니다."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600">
              <AlertCircle size={20} />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleExtract}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-600/20 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  분석 중...
                </>
              ) : (
                <>
                  <Zap size={20} />
                  구조화 데이터 추출 시작
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold mb-4">1</div>
          <h4 className="font-bold text-blue-900 mb-2">AI 구조화 파싱</h4>
          <p className="text-sm text-blue-800/70 leading-relaxed">비정형화된 텍스트에서 계획-실적-차이-리스크-차주계획을 완벽하게 분리합니다.</p>
        </div>
        <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100">
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold mb-4">2</div>
          <h4 className="font-bold text-indigo-900 mb-2">수치 데이터 정규화</h4>
          <p className="text-sm text-indigo-800/70 leading-relaxed">단위, 통화, 숫자 값을 자동으로 분류하여 KPI 대시보드 생성이 가능한 상태로 만듭니다.</p>
        </div>
        <div className="p-6 bg-purple-50 rounded-2xl border border-purple-100">
          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold mb-4">3</div>
          <h4 className="font-bold text-purple-900 mb-2">원문 근거(Quotes) 유지</h4>
          <p className="text-sm text-purple-800/70 leading-relaxed">AI가 가공한 내용이 아닌 원문의 정확한 문장을 매칭하여 신뢰도를 확보합니다.</p>
        </div>
      </div>
    </div>
  );
};

export default ExtractionView;
