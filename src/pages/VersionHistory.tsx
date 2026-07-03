import React, { useEffect, useState } from 'react';
import { ArrowLeft, Calendar, FileText } from 'lucide-react';
import { AppData, fetchApps } from '../lib/apps';

interface VersionHistoryProps {
  setRoute: (route: string) => void;
}

export const VersionHistory: React.FC<VersionHistoryProps> = ({ setRoute }) => {
  const [apps, setApps] = useState<AppData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadApps = async () => {
      setIsLoading(true);
      try {
        setApps(await fetchApps());
      } catch (error) {
        console.error('Error loading version history:', error);
        setApps([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadApps();
  }, []);

  const versions = apps.flatMap(app =>
    (app.versions?.length ? app.versions : [{
      version: app.version,
      releaseDate: app.updateDate,
      changelog: app.changelog || 'Cập nhật thông tin ứng dụng.',
      rawDate: app.rawDate || 0,
    }]).map(version => ({ ...version, app }))
  ).sort((a, b) => b.rawDate - a.rawDate);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div>
        <button onClick={() => setRoute('apps')} className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition-colors mb-5">
          <ArrowLeft size={14} /> Kho ứng dụng
        </button>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-2">
          <span className="h-6 w-1.5 bg-brand-accent rounded-full" />
          Lịch sử phiên bản
        </h1>
        <p className="text-sm text-zinc-500 mt-2">Theo dõi toàn bộ bản phát hành ứng dụng được đồng bộ từ Supabase.</p>
      </div>

      {isLoading ? (
        <div className="text-center py-16">
          <div className="w-8 h-8 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-sm text-zinc-500">Đang tải lịch sử phiên bản...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {versions.map(item => (
            <article key={`${item.app.id}-${item.version}`} className="rounded-2xl border border-white/[0.08] bg-[#0a0a0e] p-5 hover:border-brand-accent/25 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <button onClick={() => setRoute(`app-detail:${item.app.id}`)} className="text-base font-bold text-white hover:text-brand-300 transition-colors">
                      {item.app.name}
                    </button>
                    <span className="rounded bg-brand-accent/10 px-2 py-0.5 text-xs font-bold text-brand-400">{item.version}</span>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{item.changelog}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-zinc-500">
                  <Calendar size={14} />
                  {item.releaseDate}
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-zinc-600">
                <FileText size={13} />
                {item.app.categoryLabel}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};
