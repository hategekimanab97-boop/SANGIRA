import React, { useState, useEffect, useRef } from 'react';
import { useSangira } from '../../../context/SangiraContext';
import QRCode from 'qrcode';
import {
  QrCode,
  Download,
  Printer,
  ExternalLink,
  Smartphone,
  CheckCircle,
  Copy,
  RotateCcw,
  Sparkles,
  Link2,
  ShieldCheck,
  Check,
  HelpCircle,
  Eye,
} from 'lucide-react';

export const QRCodeGeneratorView: React.FC = () => {
  const { activeBusiness, setRole, setActiveTab } = useSangira();

  // Default menu URL directly into this venue's live contactless menu
  const defaultUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/?role=CUSTOMER&venue=${activeBusiness.id}`
    : `https://sangira.app/menu/${activeBusiness.id}`;

  const [menuUrl, setMenuUrl] = useState(defaultUrl);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [standSize, setStandSize] = useState<'A6' | 'A5' | 'sticker'>('A6');
  const [headlineText, setHeadlineText] = useState('Scan to View Our Digital Menu & Order');
  const [accentColor, setAccentColor] = useState<'emerald' | 'gold' | 'monochrome'>('emerald');
  const printRef = useRef<HTMLDivElement>(null);

  // Update default URL if active business changes
  useEffect(() => {
    setMenuUrl(defaultUrl);
  }, [activeBusiness.id]);

  // Generate real, high-resolution scannable QR Code on URL change
  useEffect(() => {
    const targetUrl = menuUrl.trim() || defaultUrl;
    const darkColor = accentColor === 'monochrome' ? '#111827' : accentColor === 'gold' ? '#8B6E15' : '#0E382B';

    QRCode.toDataURL(targetUrl, {
      width: 480,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: {
        dark: darkColor,
        light: '#FFFFFF',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Error generating QR code:', err));
  }, [menuUrl, defaultUrl, accentColor]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(menuUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadQR = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${activeBusiness.name.toLowerCase().replace(/\s+/g, '-')}-menu-qr.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const simulateCustomerScan = () => {
    setRole('CUSTOMER');
    setActiveTab('menu');
  };

  const handleResetDefaultUrl = () => {
    setMenuUrl(defaultUrl);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#D4AF37]/30 dark:border-[#D4AF37]/20 pb-5">
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-[#8B6E15] dark:text-[#E6C665] uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Unified Venue QR System</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-stone-900 dark:text-stone-100 mt-1">
            Restaurant & Hotel Menu QR Code
          </h1>
          <p className="text-xs text-stone-600 dark:text-stone-400 mt-0.5 max-w-2xl">
            Insert your restaurant’s website or digital menu link below. Generate one universal QR code for your tables, bar counters, and hotel rooms. Clients scan to open the live menu and select their table directly on their phone.
          </p>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            onClick={simulateCustomerScan}
            className="px-3.5 py-2 rounded-xl bg-[#0E382B] hover:bg-[#154636] text-[#FAF6EB] border border-[#D4AF37]/60 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            title="Preview the exact guest ordering menu"
          >
            <Smartphone className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-[#F3DF95]">Simulate Guest Scan</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 font-semibold text-xs hover:bg-[#FAF6EB] dark:hover:bg-stone-800 flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5 text-stone-500" />
            <span>Print Stand Marker</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Configurator vs Real Preview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: URL & Customization Controls (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card 1: Website / Menu Link Setting */}
          <div className="p-5 sm:p-6 rounded-2xl border border-[#D4AF37]/35 dark:border-[#D4AF37]/25 bg-white dark:bg-[#121614] shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-[#0E382B]/10 dark:bg-[#0E382B]/40 border border-[#D4AF37]/40 flex items-center justify-center text-[#B89320] dark:text-[#D4AF37]">
                  <Link2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                    Menu Website / Destination Link
                  </h3>
                  <p className="text-[11px] text-stone-500 dark:text-stone-400">
                    The exact web page your guests will open when scanning the QR code
                  </p>
                </div>
              </div>

              {menuUrl !== defaultUrl && (
                <button
                  onClick={handleResetDefaultUrl}
                  className="text-[11px] text-[#8B6E15] dark:text-[#E6C665] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                  title="Reset to default Sangira menu link"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reset Default</span>
                </button>
              )}
            </div>

            {/* URL Input Bar */}
            <div className="space-y-2">
              <div className="relative flex items-center">
                <input
                  type="url"
                  value={menuUrl}
                  onChange={(e) => setMenuUrl(e.target.value)}
                  placeholder="https://yourhotel.com/menu"
                  className="w-full pl-3 pr-24 py-2.5 text-xs rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 font-mono text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                />
                <button
                  onClick={handleCopyLink}
                  className="absolute right-1.5 px-3 py-1.5 rounded-lg bg-[#0E382B] text-[#FAF6EB] hover:bg-[#144737] text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-300" />
                      <span className="text-emerald-300">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 text-[#D4AF37]" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                <span className="flex items-center gap-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Live QR dynamically encodes this URL</span>
                </span>
                <a
                  href={menuUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-stone-600 dark:text-stone-300 hover:text-[#B89320] flex items-center gap-1 font-medium"
                >
                  <span>Test Link</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">
                Quick Link Presets:
              </span>
              <div className="flex flex-wrap gap-2 text-xs">
                <button
                  onClick={() => setMenuUrl(defaultUrl)}
                  className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-all cursor-pointer ${
                    menuUrl === defaultUrl
                      ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#8B6E15] dark:text-[#E6C665] font-bold'
                      : 'border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300'
                  }`}
                >
                  Sangira Contactless 5-Star Menu
                </button>
                <button
                  onClick={() => setMenuUrl(`https://${activeBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.rw/menu`)}
                  className="px-3 py-1.5 rounded-lg border border-stone-200 dark:border-stone-800 hover:bg-stone-50 dark:hover:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] transition-all cursor-pointer"
                >
                  Custom Domain ({activeBusiness.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.rw/menu)
                </button>
              </div>
            </div>
          </div>

          {/* Card 2: Poster Card Headline & Styling */}
          <div className="p-5 sm:p-6 rounded-2xl border border-stone-200 dark:border-stone-800 bg-white dark:bg-[#121614] shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
              Stand Marker Customization
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1">
                  Call-to-Action Text
                </label>
                <input
                  type="text"
                  value={headlineText}
                  onChange={(e) => setHeadlineText(e.target.value)}
                  placeholder="Scan to View Our Digital Menu & Order"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 text-stone-900 dark:text-stone-100 focus:outline-hidden focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    Print Size Format
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                    {[
                      { id: 'A6', label: 'A6 Acrylic Stand' },
                      { id: 'A5', label: 'A5 Table Tent' },
                      { id: 'sticker', label: 'Compact Sticker' },
                    ].map((fmt) => (
                      <button
                        key={fmt.id}
                        onClick={() => setStandSize(fmt.id as any)}
                        className={`min-h-[38px] py-1.5 px-2 rounded-lg text-center text-xs font-medium border transition-all cursor-pointer ${
                          standSize === fmt.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#8B6E15] dark:text-[#E6C665] font-bold'
                            : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                        }`}
                      >
                        {fmt.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-stone-700 dark:text-stone-300 mb-1.5">
                    QR Palette Accent
                  </label>
                  <div className="grid grid-cols-1 xs:grid-cols-3 gap-2">
                    {[
                      { id: 'emerald', label: 'Forest Green', dot: 'bg-[#0E382B]' },
                      { id: 'gold', label: 'Luxury Gold', dot: 'bg-[#D4AF37]' },
                      { id: 'monochrome', label: 'Modern Black', dot: 'bg-stone-900' },
                    ].map((pal) => (
                      <button
                        key={pal.id}
                        onClick={() => setAccentColor(pal.id as any)}
                        className={`min-h-[38px] py-1.5 px-2 rounded-lg text-center text-xs font-medium border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                          accentColor === pal.id
                            ? 'border-[#D4AF37] bg-[#D4AF37]/15 text-[#8B6E15] dark:text-[#E6C665] font-bold'
                            : 'border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-400 hover:bg-stone-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${pal.dot}`}></span>
                        <span>{pal.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Operational Benefit Explanation */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0E382B]/10 dark:bg-[#0E382B]/20 border border-[#D4AF37]/40 space-y-2.5 text-xs text-stone-700 dark:text-stone-300">
            <div className="flex items-center gap-2 font-bold text-emerald-950 dark:text-[#F3DF95]">
              <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
              <span>Why One Universal QR Code Eliminates Table Mix-ups</span>
            </div>
            <p className="leading-relaxed text-[11px]">
              When managers print separate codes for each individual table (Table 1, Table 2, Table 3...), guests or servers routinely move acrylic stands between tables, leading to food being delivered to the wrong diner.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-[11px]">
              <div className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Universal QR Code:</strong> Guests scan the same venue code on any table, bar seat, or terrace.</span>
              </div>
              <div className="flex items-start gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <span><strong>Guest Selects Table:</strong> Upon ordering, guests enter their exact table number on their phone.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Printable Stand Preview Card (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between text-xs font-semibold text-stone-600 dark:text-stone-400">
            <span>Stand Preview ({standSize} Format)</span>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadQR}
                className="hover:text-stone-900 dark:hover:text-stone-100 flex items-center gap-1 cursor-pointer"
                title="Download PNG for professional printing"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>
            </div>
          </div>

          {/* Photorealistic Table Tent Acrylic / Card Stand */}
          <div
            ref={printRef}
            className="p-5 sm:p-8 lg:p-10 rounded-3xl border-2 border-[#D4AF37]/60 bg-[#FFFDF9] dark:bg-[#0E1310] shadow-2xl flex flex-col items-center text-center space-y-6 relative overflow-hidden"
          >
            {/* Top decorative brass strip */}
            <div className="w-24 h-1.5 rounded-full bg-linear-to-r from-[#D4AF37] via-[#F3DF95] to-[#D4AF37]" />

            {/* Venue Branding Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0E382B] text-[#F3DF95] border border-[#D4AF37]/50 text-[10px] font-bold uppercase tracking-widest shadow-xs">
                <span>{activeBusiness.type.toUpperCase()} · SANGIRA 5-STAR</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-100 tracking-tight mt-2.5">
                {activeBusiness.name}
              </h2>
              <p className="text-xs text-[#8B6E15] dark:text-[#E6C665] font-semibold mt-1">
                {headlineText}
              </p>
            </div>

            {/* Scannable QR Code Frame */}
            <div className="p-3 sm:p-4 rounded-2xl bg-white border-2 border-[#D4AF37]/50 shadow-md inline-block">
              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt={`QR Code for ${activeBusiness.name} menu`}
                  className="w-44 h-44 xs:w-52 xs:h-52 sm:w-60 sm:h-60 mx-auto object-contain block"
                />
              ) : (
                <div className="w-44 h-44 xs:w-52 xs:h-52 sm:w-60 sm:h-60 flex items-center justify-center text-stone-400">
                  <QrCode className="w-12 h-12 animate-pulse" />
                </div>
              )}
            </div>

            {/* Scannable URL info & instructions */}
            <div className="space-y-3 w-full max-w-xs">
              <div className="px-3 py-1.5 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-[11px] font-mono text-stone-600 dark:text-stone-400 truncate">
                {menuUrl}
              </div>

              {/* 3 Step Pictograms */}
              <div className="grid grid-cols-3 gap-2 pt-1 border-t border-[#D4AF37]/25 text-[10px] text-stone-600 dark:text-stone-400">
                <div className="space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#0E382B] text-[#F3DF95] font-bold mx-auto flex items-center justify-center text-[10px]">
                    1
                  </div>
                  <span>Scan Camera</span>
                </div>
                <div className="space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#0E382B] text-[#F3DF95] font-bold mx-auto flex items-center justify-center text-[10px]">
                    2
                  </div>
                  <span>Browse Menu</span>
                </div>
                <div className="space-y-1">
                  <div className="w-6 h-6 rounded-full bg-[#0E382B] text-[#F3DF95] font-bold mx-auto flex items-center justify-center text-[10px]">
                    3
                  </div>
                  <span>MoMo / Table</span>
                </div>
              </div>
            </div>

            {/* Bottom Brass Trim */}
            <div className="text-[10px] text-stone-400 uppercase tracking-widest pt-2">
              Contactless Hospitality · MTN MoMo · Airtel Money
            </div>
          </div>

          {/* Action buttons under card */}
          <div className="flex flex-col xs:flex-row gap-2">
            <button
              onClick={handleDownloadQR}
              className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl border border-stone-300 dark:border-stone-700 bg-white dark:bg-stone-900 text-stone-800 dark:text-stone-200 hover:bg-[#FAF6EB] text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Download className="w-3.5 h-3.5 text-stone-500" />
              <span>Download High-Res QR</span>
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 min-h-[44px] py-2.5 px-3 rounded-xl bg-[#0E382B] hover:bg-[#154636] text-[#FAF6EB] border border-[#D4AF37]/60 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span className="text-[#F3DF95]">Print Acrylic Stand</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
