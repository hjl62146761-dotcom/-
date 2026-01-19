
import React, { useState, useEffect } from 'react';
import { StructuredReport, KpiTimeSeries, ReportStatus } from '../../types';
import { geminiService } from '../../services/geminiService';
import { Loader2, LineChart, BarChart2, Zap, TrendingUp, Info } from 'lucide-react';

interface KpiDashboardViewProps {
  reports: StructuredReport[];
}

const KpiDashboardView: React.FC<KpiDashboardViewProps> = ({ reports }) => {
  const [kpis, setKpis] = useState<KpiTimeSeries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchKpis = async () => {
      setLoading(true);
      try {
        const data = await geminiService.extractKpiTimeSeries(reports);
        setKpis(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchKpis();
  }, [reports]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case ReportStatus.GREEN: return 'bg-emerald-500';
      case ReportStatus.YELLOW: return 'bg-yellow-400';
      case ReportStatus.RED: return 'bg-red-500';
      default: return 'bg-slate-300';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="bg-slate-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-3xl font-black tracking-tight mb-2">KPI Intelligence</h3>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Weekly Performance Tracking</p>
        </div>
        <div className="absolute right-0 top-0 w-64 h-64 bg-blue-600/20 blur-[100px] -translate-y-1/2 translate-x-1/2 rounded-full"></div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-4 text-slate-400">
          <Loader2 className="animate-spin" size={48} />
          <p className="font-black uppercase tracking-widest text-[10px]">Processing Time-series Data...</p>
        </div>
      ) : kpis.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-slate-200 p-20 rounded-3xl text-center">
          <Info size={48} className="mx-auto text-slate-200 mb-4" />
          <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">No KPI Metrics Found in Current Reports</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          {kpis.map((kpi, idx) => (
            <div key={idx} className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-md transition-shadow group">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-widest">{kpi.org_unit}</span>
                  </div>
                  <h4 className="text-xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{kpi.kpi_name} <span className="text-slate-400 font-medium ml-1">({kpi.unit})</span></h4>
                </div>
                <div className="flex gap-2">
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Current</p>
                    <p className="text-lg font-black text-slate-900">{kpi.data[kpi.data.length - 1]?.actual || '-'}</p>
                  </div>
                  <div className="bg-slate-50 px-4 py-2 rounded-2xl border border-slate-100">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Target</p>
                    <p className="text-lg font-black text-blue-600">{kpi.data[kpi.data.length - 1]?.plan || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Simulated Chart Area */}
              <div className="relative h-48 flex items-end gap-3 px-2 border-b-2 border-slate-100 mb-10 pb-2">
                {kpi.data.map((point, pIdx) => {
                  const maxVal = Math.max(...kpi.data.map(d => Math.max(d.plan || 0, d.actual || 0)));
                  const actualHeight = point.actual ? (point.actual / maxVal) * 100 : 0;
                  const planHeight = point.plan ? (point.plan / maxVal) * 100 : 0;
                  
                  return (
                    <div key={pIdx} className="flex-1 group/point relative flex justify-center items-end gap-1">
                      {/* Target bar outline */}
                      <div 
                        className="w-2 bg-slate-100 rounded-t-sm absolute" 
                        style={{ height: `${planHeight}%`, left: 'calc(50% + 2px)' }}
                      ></div>
                      {/* Actual bar */}
                      <div 
                        className={`w-3 ${getStatusColor(point.status)} rounded-t-md transition-all group-hover/point:brightness-110 relative z-10`} 
                        style={{ height: `${actualHeight}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover/point:opacity-100 transition-opacity whitespace-nowrap z-20">
                          {point.actual} / {point.plan} ({point.status})
                        </div>
                      </div>
                      <div className="absolute -bottom-8 text-[9px] font-black text-slate-400 rotate-45 origin-left whitespace-nowrap">
                        {point.week}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end gap-6 pt-2">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">On Track</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Warning</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded-sm"></div>
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Risk</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default KpiDashboardView;
