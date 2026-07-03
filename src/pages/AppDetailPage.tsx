import React, { useEffect, useState } from 'react';
import { Download, Star, Terminal, Shield, Code, Zap, Cpu, ArrowLeft, FileText } from 'lucide-react';
import { AppData, fetchApp, getAppDownloadUrl, incrementAppDownload } from '../lib/apps';

interface AppDetailPageProps {
  appId: string;
  setRoute: (route: string) => void;
}

export const AppDetailPage: React.FC<AppDetailPageProps> = ({ appId, setRoute }) => {
  const [app, setApp] = useState<AppData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    const loadApp = async () => {
      setIsLoading(true);
      try {
        setApp(await fetchApp(appId));
      } catch (error) {
        console.error('Error loading app detail:', error);
        setApp(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadApp();
  }, [appId]);

  const renderIcon = () => {
    if (app?.iconUrl) return <img src={app.iconUrl} alt="" className="h-12 w-12 object-contain" />;
    switch (app?.iconType) {
      case 'terminal': return <Terminal size={44} />;
      case 'shield': return <Shield size={44} />;
      case 'code': return <Code size={44} />;
      case 'zap': return <Zap size={44} />;
      case 'cpu': return <Cpu size={44} />;
      default: return <Code size={44} />;
    }
  };

  const handleDownload = async () => {
    if (!app || isDownloading) return;
    setIsDownloading(true);
    try {
      const updatedApp = await incrementAppDownload(app);
      setApp(updatedApp);
      window.dispatchEvent(new Event('apps-db-updated'));
      const url = getAppDownloadUrl(updatedApp);
      if (url) window.open(url, '_blank', 'noopener,noreferrer');
    } catch (error: any) {
      alert(`Không thể tải ứng dụng: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-8 h-8 mx-auto border-2 border-brand-accent border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm text-zinc-500">Đang tải chi tiết ứng dụng...</p>
      </div>
    );
  }

  if (!app) {
    return (
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-20 text-center">
        <h1 className="text-xl font-bold text-white mb-3">Không tìm thấy ứng dụng</h1>
        <button onClick={() => setRoute('apps')} className="text-sm font-semibold text-brand-400 hover:text-brand-300">
          Quay lại kho ứng dụng
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <button onClick={() => setRoute('apps')} className="inline-flex items-center gap-2 text-xs font-semibold text-zinc-500 hover:text-white transition-colors">
        <ArrowLeft size={14} /> Kho ứng dụng
      </button>

      <section className="rounded-2xl border border-white/[0.08] bg-[#0a0a0e] p-6 sm:p-8 shadow-glass">
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-brand-accent">
            {renderIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">{app.name}</h1>
              <span className={`rounded px-2.5 py-1 text-xs font-bold ${app.isFree ? 'bg-emerald-500/10 text-emerald-400' : 'bg-brand-accent/10 text-brand-400'}`}>
                {app.isFree ? 'Miễn phí' : app.price}
              </span>
            </div>
            <p className="text-sm text-zinc-400 leading-relaxed max-w-3xl">{app.description}</p>
            <div className="mt-5 flex flex-wrap gap-3 text-xs text-zinc-500">
              <span className="rounded bg-brand-500/10 px-2 py-1 text-brand-300">{app.categoryLabel}</span>
              <span>Phiên bản {app.version}</span>
              <span>Cập nhật {app.updateDate}</span>
              <span className="flex items-center gap-1"><Star size={13} className="text-amber-400 fill-amber-400" /> {app.rating}</span>
              <span>{app.downloads}+ lượt tải</span>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className="inline-flex items-center gap-2 rounded-xl bg-brand-accent px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-600 disabled:cursor-not-allowed disabled:bg-zinc-800 disabled:text-zinc-400 transition-colors shadow-glow-red"
              >
                <Download size={17} />
                {isDownloading ? 'Đang tải...' : 'Tải xuống'}
              </button>
              <button onClick={() => setRoute('version-history')} className="inline-flex items-center gap-2 rounded-xl border border-white/[0.08] px-5 py-2.5 text-sm font-bold text-zinc-300 hover:bg-white/[0.04] transition-colors">
                <FileText size={17} /> Lịch sử phiên bản
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 rounded-2xl border border-white/[0.08] bg-[#0a0a0e] p-6">
          <h2 className="text-lg font-bold text-white mb-3">Giới thiệu</h2>
          <p className="text-sm text-zinc-400 leading-relaxed">{app.description}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {app.tags.map(tag => (
              <span key={tag} className="rounded-md border border-white/[0.06] bg-white/[0.03] px-2.5 py-1 text-xs text-zinc-400">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl border border-white/[0.08] bg-[#0a0a0e] p-6">
          <h2 className="text-sm font-bold text-white mb-4">Bản phát hành mới nhất</h2>
          <p className="text-xs font-bold text-white">{app.version}</p>
          <p className="text-xs text-zinc-500 mt-1">{app.updateDate}</p>
          <p className="text-xs text-zinc-400 mt-3 leading-relaxed">{app.changelog || 'Cập nhật thông tin ứng dụng.'}</p>
        </div>
      </section>
    </div>
  );
};
