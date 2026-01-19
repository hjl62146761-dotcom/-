
import React, { useState, useRef } from 'react';
import { geminiService, FileData } from '../../services/geminiService';
import { StructuredReport } from '../../types';
import { Loader2, Zap, Upload, File as FileIcon, X, AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

interface ExtractionViewProps {
  onReportAdded: (report: StructuredReport) => void;
}

interface UploadedFile {
  name: string;
  type: string;
  base64: string;
}

const ExtractionView: React.FC<ExtractionViewProps> = ({ onReportAdded }) => {
  const [pptText, setPptText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExtract = async () => {
    if (!pptText.trim() && uploadedFiles.length === 0) {
      setError("텍스트를 입력하거나 파일을 업로드해주세요.");
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const fileParts: FileData[] = uploadedFiles.map(f => ({
        inlineData: {
          data: f.base64,
          mimeType: f.type || 'application/octet-stream'
        }
      }));

      const report = await geminiService.extractReport(pptText, fileParts);
      onReportAdded(report);
      setPptText('');
      setUploadedFiles([]);
    } catch (err: any) {
      setError(err.message || "분석 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles: UploadedFile[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const base64 = await fileToBase64(file);
      newFiles.push({
        name: file.name,
        type: file.type || 'application/pdf', 
        base64: base64.split(',')[1] 
      });
    }
    setUploadedFiles(prev => [...prev, ...newFiles]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-700">
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-2">Smart 주간업무 AJ AI</h2>
        <p className="text-slate-500 font-medium">PPT, PDF 파일을 업로드하거나 텍스트를 붙여넣으세요. AJ AI가 완벽하게 분석합니다.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-2xl overflow-hidden">
        <div className="p-8 space-y-6">
          <div 
            onClick={() => fileInputRef.current?.click()}
            className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-10 flex flex-col items-center justify-center gap-4 hover:border-blue-400 hover:bg-blue-50/30 transition-all cursor-pointer"
          >
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              multiple
              onChange={handleFileChange}
              accept=".txt,.ppt,.pdf,.docx,.jpg,.png"
            />
            <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center text-white group-hover:scale-110 transition-all shadow-xl shadow-blue-600/20">
              <Upload size={36} />
            </div>
            <div className="text-center">
              <p className="text-xl font-black text-slate-900 tracking-tight">보고서 파일 업로드</p>
              <p className="text-sm text-slate-500 mt-1 font-medium">Smart 주간업무 AJ AI가 PPT, PDF, 이미지 파일을 직접 분석합니다.</p>
            </div>
          </div>

          {uploadedFiles.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl group animate-in slide-in-from-left-2">
                  <div className="flex items-center gap-3 truncate">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <FileIcon size={18} className="text-blue-600" />
                    </div>
                    <span className="text-xs font-bold text-slate-700 truncate">{file.name}</span>
                  </div>
                  <button 
                    onClick={() => removeFile(idx)}
                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="relative">
            <div className="absolute top-0 left-0 -translate-y-1/2 translate-x-4 px-3 bg-white text-[10px] font-black text-slate-400 uppercase tracking-widest z-10">
              OR Paste Slide Content
            </div>
            <textarea
              value={pptText}
              onChange={(e) => setPptText(e.target.value)}
              className="w-full h-64 p-8 bg-slate-50 border border-slate-200 rounded-3xl focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none text-sm font-medium leading-relaxed resize-none"
              placeholder="슬라이드 텍스트나 표 내용을 여기에 붙여넣으세요..."
            />
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 animate-in zoom-in-95 duration-200">
              <AlertCircle size={20} />
              <p className="text-sm font-bold">{error}</p>
            </div>
          )}

          <div className="flex justify-center pt-2">
            <button
              onClick={handleExtract}
              disabled={loading || (pptText.trim() === '' && uploadedFiles.length === 0)}
              className="group flex items-center gap-3 bg-slate-900 text-white px-12 py-5 rounded-3xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 disabled:bg-slate-100 disabled:text-slate-300 disabled:cursor-not-allowed transition-all shadow-2xl shadow-slate-900/10 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  AJ AI 분석 중...
                </>
              ) : (
                <>
                  <Zap size={20} className="text-yellow-400 group-hover:animate-pulse" />
                  Smart 분석 시작
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
        {[
          { icon: <CheckCircle2 className="text-emerald-500" />, title: "자동 구조화", desc: "PPT 슬라이드를 읽어 조직별/카테고리별로 자동 분류합니다." },
          { icon: <FileText className="text-blue-500" />, title: "CEO 보고용 요약", desc: "핵심 성과와 리스크를 도출하여 단정한 문체로 요약합니다." },
          { icon: <Zap className="text-amber-500" />, title: "실적 정합성 검증", desc: "계획 대비 실적의 차이(Gap)를 계산하고 상태를 진단합니다." }
        ].map((item, i) => (
          <div key={i} className="p-8 bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1">
            <div className="mb-4">{item.icon}</div>
            <h4 className="font-black text-slate-900 mb-2 tracking-tight">{item.title}</h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">{item.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExtractionView;
