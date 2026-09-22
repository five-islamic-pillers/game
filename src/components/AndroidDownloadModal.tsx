import React, { useState } from 'react';
import { Smartphone, Download, CheckCircle2, ExternalLink, X, Sparkles, Layers, ShieldCheck, WifiOff } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidDownloadModal: React.FC<AndroidDownloadModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, install, isIOS } = usePWAInstall();
  const [installedSuccess, setInstalledSuccess] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (success) {
        setInstalledSuccess(true);
      }
    }
  };

  const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://ais-dev-ec3oxz4hx4cyh2q5bypnxc-27342607303.europe-west2.run.app';
  const pwaBuilderUrl = `https://www.pwabuilder.com?site=${encodeURIComponent(currentUrl)}`;

  return (
    <div 
      id="android-download-modal-backdrop"
      className="fixed inset-0 z-[120] flex items-center justify-center bg-black/75 backdrop-blur-md p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        id="android-download-modal-content"
        dir="rtl"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#faf8f5] dark:bg-stone-900 border border-stone-200 dark:border-amber-500/30 rounded-3xl p-6 md:p-8 text-stone-900 dark:text-white shadow-2xl overflow-hidden my-auto transition-colors"
      >
        {/* Background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-48 h-48 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-48 h-48 bg-amber-600/15 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button 
          id="close-android-modal-btn"
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-full bg-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-300 dark:bg-stone-800 dark:text-stone-300 dark:hover:text-white dark:hover:bg-stone-700 transition-colors cursor-pointer"
          aria-label="داخستن"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 p-0.5 shadow-lg shadow-emerald-900/30 flex items-center justify-center shrink-0">
            <img 
              src="./pwa-192x192.png" 
              alt="ئایکۆنی ئەپ" 
              className="w-full h-full object-cover rounded-[14px]"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }} 
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 rounded-full">
                ئەندرۆید (APK / PWA)
              </span>
              <span className="px-2 py-0.5 text-[11px] font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300 rounded-full flex items-center gap-1">
                <WifiOff className="w-3 h-3" /> ئۆفلاین کاردەکات
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black text-stone-900 dark:text-white mt-1">
              داگرتنی ئەپی پێنج پایەی ئیسلام
            </h2>
          </div>
        </div>

        {/* Status / Success Alert */}
        {installedSuccess || isInstalled ? (
          <div className="mb-6 p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <div>
              <h4 className="font-bold text-emerald-800 dark:text-emerald-300">ئەپەکە بە سەرکەوتوویی دابەزی!</h4>
              <p className="text-xs text-stone-600 dark:text-stone-300 mt-0.5">دەتوانیت لەناو پەڕەی سەرەکی مۆبایلەکەت بیکەیتەوە و بەبێ ئینتەرنێت یاری بکەیت.</p>
            </div>
          </div>
        ) : null}

        {/* Main Action: 1-Click Android WebAPK Install */}
        <div className="space-y-4 mb-6">
          {isInstallable ? (
            <button
              id="install-android-app-btn"
              onClick={handleInstallClick}
              className="w-full py-4 px-6 bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-500 hover:to-green-500 active:scale-[0.98] text-white font-black rounded-2xl shadow-xl shadow-emerald-900/30 flex items-center justify-center gap-3 transition-all text-base md:text-lg border border-emerald-400/30 cursor-pointer"
            >
              <Smartphone className="w-6 h-6 animate-bounce" />
              <span>دامەزراندنی ڕاستەوخۆ لەسەر ئەندرۆید (APK)</span>
            </button>
          ) : (
            <div className="p-4 bg-[#f3ede1] dark:bg-stone-800/90 rounded-2xl border border-stone-300/80 dark:border-stone-700/60">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 font-bold mb-2">
                <Sparkles className="w-5 h-5" />
                <span>چۆنیەتی دابەزاندن لەسەر ئەندرۆید:</span>
              </div>
              <ol className="text-stone-700 dark:text-stone-300 text-sm space-y-2 list-decimal list-inside pr-1 leading-relaxed">
                <li>لە وێبگەڕی مۆبایلەکەت (گووگڵ کرۆم یان سامسۆنگ)، کرتە لە <strong>سێ خاڵەکە (⋮)</strong>ی گۆشەی سەرەوە بکە.</li>
                <li>هەڵبژاردنی <strong>«دامەزراندنی ئەپ» (Install app)</strong> یان <strong>«زیادکردن بۆ شاشەی سەرەکی» (Add to Home screen)</strong> بکە.</li>
                <li>بە شێوەیەکی فەرمی وەک فایلی ئەپ (WebAPK) دێتە سەر مۆبایلەکەت بە قەبارەی زۆر کەم و بەبێ ئینتەرنێت کاردەکات!</li>
              </ol>
            </div>
          )}

          {/* iOS Note if on iPhone */}
          {isIOS && (
            <div className="p-3 bg-[#f3ede1]/90 dark:bg-stone-800/70 rounded-xl border border-stone-300 dark:border-stone-700 text-xs text-stone-700 dark:text-stone-300">
              📱 بۆ ئایفۆن (iOS): دوگمەی <strong>Share</strong> دابگرە لە سەفاری و پاشان <strong>Add to Home Screen</strong> هەڵبژێرە.
            </div>
          )}
        </div>

        {/* Benefits list */}
        <div className="grid grid-cols-2 gap-3 mb-6 text-xs font-medium text-stone-700 dark:text-stone-300">
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f3ede1]/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>بەبێ ئینتەرنێت کار دەکات</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f3ede1]/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
            <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>شاشەی تەواو بێ وێبگەڕ</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f3ede1]/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
            <ShieldCheck className="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
            <span>پارێزراو و سووک بێ ڕیکلام</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#f3ede1]/80 dark:bg-stone-800/60 border border-stone-200 dark:border-stone-800">
            <Download className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
            <span>خێراترین کات بۆ دامەزراندن</span>
          </div>
        </div>

        {/* APK generation / PWABuilder external package link */}
        <div className="pt-4 border-t border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500 dark:text-stone-400">
          <span>دەتەوێت فایلی سەربەخۆی APK دروست بکەیت؟</span>
          <a
            id="pwabuilder-apk-link"
            href={pwaBuilderUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-stone-200 hover:bg-stone-300 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 rounded-lg font-bold transition-colors cursor-pointer"
          >
            <span>دروستکردنی فایلی APK</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
};
