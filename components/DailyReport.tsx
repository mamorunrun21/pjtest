
import React, { useState } from 'react';
import { Icons } from '../constants';
import { analyzeDailyReport } from '../services/geminiService';

const DailyReport: React.FC = () => {
  const [projectId, setProjectId] = useState('');
  const [content, setContent] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAiInsight = async () => {
    if (!content && photos.length === 0) return;
    setIsAnalyzing(true);
    const result = await analyzeDailyReport(content, photos);
    setAiAnalysis(result);
    setIsAnalyzing(false);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          AI現場日報
          <span className="text-[10px] bg-[#1e3a5f] text-white px-2 py-0.5 rounded-full font-bold">Smart Report</span>
        </h2>
        <p className="text-slate-500 mt-1">画像と文章からAIがリスクを即座に判定</p>
      </div>

      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">対象案件</label>
              <select 
                value={projectId} 
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full rounded-2xl border-slate-200 py-4 px-4 text-lg font-medium focus:ring-[#1e3a5f] focus:border-[#1e3a5f] bg-slate-50 transition-all"
              >
                <option value="">案件を選択してください</option>
                <option value="1">A様邸 外部改修工事</option>
                <option value="2">株式会社テック オフィス移転</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">作業内容・報告事項</label>
              <textarea
                rows={5}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="「本日、外壁の中塗りを完了しました。天候が不安定だったため、一部養生を強化しています...」"
                className="w-full rounded-2xl border-slate-200 text-lg font-medium focus:ring-[#1e3a5f] focus:border-[#1e3a5f] bg-slate-50 p-4 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-black text-slate-400 mb-3 uppercase tracking-widest">現場状況 (AI解析用写真)</label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((p, i) => (
                  <div key={i} className="relative aspect-square rounded-2xl overflow-hidden group border border-slate-100">
                    <img src={p} className="w-full h-full object-cover" />
                    <button 
                      onClick={() => setPhotos(prev => prev.filter((_, idx) => idx !== i))}
                      className="absolute top-2 right-2 bg-red-500/90 text-white p-1.5 rounded-full shadow-lg"
                    >
                      <Icons.Trash className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 hover:bg-slate-100 hover:border-[#1e3a5f] transition-all cursor-pointer">
                  <Icons.Camera className="w-8 h-8 text-slate-400 mb-2" />
                  <span className="text-[10px] font-black text-slate-500 uppercase">撮る / 選ぶ</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>
          </div>

          <div className="px-6 pb-6 pt-2 bg-white flex flex-col gap-4">
             {aiAnalysis && (
               <div className="bg-[#1e3a5f] text-white p-5 rounded-2xl animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-6 h-6 rounded-full bg-[#c9a227] flex items-center justify-center text-[10px] font-bold italic">AI</div>
                    <span className="text-xs font-bold tracking-widest uppercase">Smart Insight</span>
                  </div>
                  <p className="text-sm leading-relaxed text-slate-100 whitespace-pre-wrap">{aiAnalysis}</p>
               </div>
             )}

             <div className="flex gap-3">
                <button 
                  onClick={generateAiInsight}
                  disabled={isAnalyzing || (!content && photos.length === 0)}
                  className="flex-1 py-4 bg-white border-2 border-[#1e3a5f] text-[#1e3a5f] rounded-2xl text-base font-bold flex items-center justify-center gap-2 hover:bg-slate-50 disabled:opacity-50 transition-all"
                >
                  {isAnalyzing ? (
                    <div className="w-5 h-5 border-2 border-[#1e3a5f] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span className="text-lg">✨</span> AI解析・添削
                    </>
                  )}
                </button>
                <button className="flex-[2] py-4 bg-[#1e3a5f] text-white rounded-2xl text-lg font-bold hover:bg-[#2c4e7a] shadow-xl hover:shadow-[#1e3a5f40] transition-all">
                  報告を確定して送信
                </button>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DailyReport;
