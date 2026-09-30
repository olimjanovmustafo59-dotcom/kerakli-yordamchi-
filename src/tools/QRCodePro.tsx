import React, { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import {
  QrCode,
  Download,
  AlertTriangle,
  CheckCircle2,
  Upload,
  RefreshCw,
  Sparkles,
  Link,
  Wifi,
  Phone,
  Mail,
  MessageSquare,
  User,
  MapPin,
  Calendar,
  Share2,
  FileText,
  Sliders,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { QRCodeConfig, QRDataType } from '../types';
import { testQRScannability, QRScanTestResult } from '../utils/qrTester';

export const QRCodePro: React.FC = () => {
  const [dataType, setDataType] = useState<QRDataType>('url');
  
  // Specific inputs for data types
  const [textValue, setTextValue] = useState('https://smarttools.uz');
  const [wifiData, setWifiData] = useState({ ssid: 'SmartWiFi', pass: 'parol12345', enc: 'WPA', hidden: false });
  const [phoneValue, setPhoneValue] = useState('+998901234567');
  const [emailData, setEmailData] = useState({ email: 'info@smarttools.uz', subject: 'Hamkorlik', body: 'Salom, SmartTools!' });
  const [smsData, setSmsData] = useState({ phone: '+998901234567', message: 'Salom!' });
  const [vcardData, setVcardData] = useState({
    name: 'Mustafo Olimjanov',
    phone: '+998901234567',
    email: 'olimjanovmustafo59@gmail.com',
    company: 'SmartTools AI',
    title: 'Lead Architect',
    website: 'https://smarttools.uz',
  });
  const [geoData, setGeoData] = useState({ lat: '41.311081', lng: '69.240562' }); // Toshkent
  const [eventData, setEventData] = useState({
    title: 'SmartTools Taqqdimoti',
    location: 'Toshkent',
    start: '2026-10-05T10:00',
    end: '2026-10-05T12:00',
    desc: 'Yangi AI imkoniyatlari taqdimoti'
  });
  const [socialData, setSocialData] = useState({
    platform: 'telegram',
    handle: 'smarttools_uz'
  });

  // Customization state
  const [config, setConfig] = useState<QRCodeConfig>({
    type: 'url',
    value: 'https://smarttools.uz',
    fgColor: '#1e1b4b',
    bgColor: '#ffffff',
    useGradient: false,
    gradientColor2: '#4338ca',
    gradientType: 'linear',
    dotStyle: 'rounded',
    cornerStyle: 'rounded',
    frame: 'none',
    frameText: 'SCAN ME',
    frameColor: '#4338ca',
    logoUrl: undefined,
    logoSize: 22,
    quietZone: 2,
    errorCorrection: 'H', // High error correction recommended for logos/custom designs
    size: 600,
    transparentBg: false,
  });

  const [activeTab, setActiveTab] = useState<'content' | 'design' | 'logo'>('content');
  const [scanResult, setScanResult] = useState<QRScanTestResult>({ isScannable: true });
  const [isRendering, setIsRendering] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Compile full string to encode based on current tab
  const getPayloadString = (): string => {
    switch (dataType) {
      case 'url':
      case 'text':
      case 'image_link':
      case 'file_link':
        return textValue;
      case 'wifi':
        return `WIFI:S:${wifiData.ssid};T:${wifiData.enc};P:${wifiData.pass};H:${wifiData.hidden ? 'true' : 'false'};;`;
      case 'phone':
        return `tel:${phoneValue}`;
      case 'email':
        return `mailto:${emailData.email}?subject=${encodeURIComponent(emailData.subject)}&body=${encodeURIComponent(emailData.body)}`;
      case 'sms':
        return `smsto:${smsData.phone}:${smsData.message}`;
      case 'vcard':
        return `BEGIN:VCARD\nVERSION:3.0\nFN:${vcardData.name}\nORG:${vcardData.company}\nTITLE:${vcardData.title}\nTEL:${vcardData.phone}\nEMAIL:${vcardData.email}\nURL:${vcardData.website}\nEND:VCARD`;
      case 'geo':
        return `geo:${geoData.lat},${geoData.lng}`;
      case 'calendar':
        const formatTime = (iso: string) => iso.replace(/[-:]/g, '') + '00Z';
        return `BEGIN:VEVENT\nSUMMARY:${eventData.title}\nLOCATION:${eventData.location}\nDESCRIPTION:${eventData.desc}\nDTSTART:${formatTime(eventData.start)}\nDTEND:${formatTime(eventData.end)}\nEND:VEVENT`;
      case 'social':
        if (socialData.platform === 'telegram') return `https://t.me/${socialData.handle.replace('@', '')}`;
        if (socialData.platform === 'instagram') return `https://instagram.com/${socialData.handle.replace('@', '')}`;
        if (socialData.platform === 'youtube') return `https://youtube.com/@${socialData.handle.replace('@', '')}`;
        if (socialData.platform === 'github') return `https://github.com/${socialData.handle}`;
        return `https://twitter.com/${socialData.handle}`;
      default:
        return textValue;
    }
  };

  const payload = getPayloadString();

  // Render QR to Canvas with custom styles, corners, gradient, frame, logo
  useEffect(() => {
    let isCancelled = false;
    const renderQR = async () => {
      setIsRendering(true);
      try {
        const rawCanvas = document.createElement('canvas');
        await QRCode.toCanvas(rawCanvas, payload || 'SmartTools', {
          errorCorrectionLevel: config.errorCorrection,
          margin: config.quietZone,
          width: config.size,
          color: {
            dark: '#000000',
            light: '#ffffff',
          },
        });

        if (isCancelled) return;

        // Create main canvas with frame & design styling
        const mainCanvas = canvasRef.current;
        if (!mainCanvas) return;

        const hasFrame = config.frame !== 'none';
        const frameHeight = hasFrame ? 70 : 0;
        mainCanvas.width = config.size;
        mainCanvas.height = config.size + frameHeight;

        const ctx = mainCanvas.getContext('2d');
        if (!ctx) return;

        // Background
        if (!config.transparentBg) {
          ctx.fillStyle = config.bgColor;
          ctx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);
        } else {
          ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
        }

        // Draw QR modules from rawCanvas data
        const rawCtx = rawCanvas.getContext('2d');
        if (rawCtx) {
          const rawData = rawCtx.getImageData(0, 0, rawCanvas.width, rawCanvas.height);
          
          // Setup fill style (solid or gradient)
          let fgStyle: string | CanvasGradient = config.fgColor;
          if (config.useGradient) {
            const grad = ctx.createLinearGradient(0, 0, config.size, config.size);
            grad.addColorStop(0, config.fgColor);
            grad.addColorStop(1, config.gradientColor2);
            fgStyle = grad;
          }
          ctx.fillStyle = fgStyle;

          // Estimate module size
          const qrData = QRCode.create(payload || 'SmartTools', { errorCorrectionLevel: config.errorCorrection });
          const moduleCount = qrData.modules.size + config.quietZone * 2;
          const moduleSize = config.size / moduleCount;

          // Loop over modules
          for (let row = 0; row < moduleCount; row++) {
            for (let col = 0; col < moduleCount; col++) {
              const pixelX = Math.floor(col * moduleSize + moduleSize / 2);
              const pixelY = Math.floor(row * moduleSize + moduleSize / 2);
              const idx = (pixelY * rawCanvas.width + pixelX) * 4;
              const isDark = rawData.data[idx] < 128; // black module

              if (isDark) {
                const x = col * moduleSize;
                const y = row * moduleSize;

                if (config.dotStyle === 'dots') {
                  ctx.beginPath();
                  ctx.arc(x + moduleSize / 2, y + moduleSize / 2, moduleSize / 2.3, 0, Math.PI * 2);
                  ctx.fill();
                } else if (config.dotStyle === 'rounded') {
                  ctx.beginPath();
                  const r = moduleSize / 3;
                  ctx.roundRect(x + 0.5, y + 0.5, moduleSize - 1, moduleSize - 1, r);
                  ctx.fill();
                } else {
                  // Standard square
                  ctx.fillRect(x, y, moduleSize, moduleSize);
                }
              }
            }
          }
        }

        // Draw Frame if requested
        if (hasFrame) {
          ctx.fillStyle = config.frameColor;
          if (config.frame === 'badge' || config.frame === 'scan_me') {
            ctx.fillRect(0, config.size, config.size, frameHeight);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 24px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(config.frameText || 'SCAN ME', config.size / 2, config.size + frameHeight / 2);
          } else if (config.frame === 'simple') {
            ctx.lineWidth = 6;
            ctx.strokeStyle = config.frameColor;
            ctx.strokeRect(3, 3, config.size - 6, config.size - 6);
          }
        }

        // Draw Logo if specified
        if (config.logoUrl) {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = config.logoUrl;
          await new Promise((resolve) => {
            img.onload = () => {
              const logoDim = (config.size * (config.logoSize / 100));
              const logoX = (config.size - logoDim) / 2;
              const logoY = (config.size - logoDim) / 2;

              // White backdrop for logo legibility
              ctx.save();
              ctx.fillStyle = '#ffffff';
              ctx.beginPath();
              ctx.arc(config.size / 2, config.size / 2, logoDim / 1.7, 0, Math.PI * 2);
              ctx.fill();
              ctx.clip();

              ctx.drawImage(img, logoX, logoY, logoDim, logoDim);
              ctx.restore();
              resolve(true);
            };
            img.onerror = () => resolve(false);
          });
        }

        // Automatic Scannability Verification (Crucial Requirement!)
        const testRes = testQRScannability(mainCanvas);
        setScanResult(testRes);
      } catch (err: any) {
        console.error("QR render error:", err);
      } finally {
        setIsRendering(false);
      }
    };

    renderQR();

    return () => {
      isCancelled = true;
    };
  }, [payload, config]);

  // Handle Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Logo fayl hajmi 2MB dan kichik bo'lishi kerak.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setConfig((prev) => ({ ...prev, logoUrl: event.target?.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Export functions
  const downloadPNG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `SmartTools-QR-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const downloadJPG = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // ensure opaque background for JPG
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tCtx = tempCanvas.getContext('2d');
    if (!tCtx) return;
    tCtx.fillStyle = config.bgColor || '#ffffff';
    tCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
    tCtx.drawImage(canvas, 0, 0);

    const link = document.createElement('a');
    link.download = `SmartTools-QR-${Date.now()}.jpg`;
    link.href = tempCanvas.toDataURL('image/jpeg', 0.95);
    link.click();
  };

  const downloadSVG = async () => {
    try {
      const svgString = await QRCode.toString(payload || 'SmartTools', {
        type: 'svg',
        color: {
          dark: config.fgColor,
          light: config.transparentBg ? '#00000000' : config.bgColor,
        },
        margin: config.quietZone,
        errorCorrectionLevel: config.errorCorrection,
      });

      const blob = new Blob([svgString], { type: 'image/svg+xml' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.download = `SmartTools-QR-${Date.now()}.svg`;
      link.href = url;
      link.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      alert("SVG yaratishda xatolik yuz berdi");
    }
  };

  const downloadPDF = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const imgData = canvas.toDataURL('image/png');
    doc.setFontSize(16);
    doc.text('SmartTools AI - Professional QR Code', 105, 25, { align: 'center' });
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Turi: ${dataType.toUpperCase()} | Sana: ${new Date().toLocaleDateString()}`, 105, 32, { align: 'center' });

    // QR in center
    const qrWidth = 110;
    const qrHeight = (canvas.height / canvas.width) * qrWidth;
    doc.addImage(imgData, 'PNG', (210 - qrWidth) / 2, 45, qrWidth, qrHeight);

    doc.setFontSize(9);
    doc.setTextColor(140);
    doc.text('SmartTools AI platformasi orqali yaratilgan (https://smarttools.uz)', 105, 275, { align: 'center' });

    doc.save(`SmartTools-QR-${Date.now()}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-indigo-900/90 via-violet-900/90 to-slate-900 text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-white/10 backdrop-blur-sm">
              <QrCode className="w-5 h-5 text-cyan-300" />
            </span>
            <h2 className="text-xl font-bold">QR Code Pro</h2>
            <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Avto-Verifikatsiya
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Wi-Fi, Kontakt (vCard), Manzil, To'lov, URL va barcha turdagi boy dizaynli QR kodlar.
            Har bir o'zgarishda skanerlanishi avtomatik tekshirib boriladi.
          </p>
        </div>

        {/* Scannability indicator in banner */}
        <div className="flex items-center gap-2 self-start md:self-auto bg-black/30 backdrop-blur-md px-3 py-2 rounded-xl border border-white/10">
          {scanResult.isScannable ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-semibold text-emerald-300">100% Skanerlanadi</p>
                <p className="text-[10px] text-slate-400">Sinov muvaffaqiyatli</p>
              </div>
            </>
          ) : (
            <>
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 animate-bounce" />
              <div>
                <p className="text-xs font-semibold text-amber-300">Diqqat: O'qilmaydi</p>
                <p className="text-[10px] text-amber-200">Kontrastni oshiring</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Main Grid: Controls Left, Live Preview Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config Tabs */}
        <div className="lg:col-span-7 space-y-4">
          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60">
            <button
              onClick={() => setActiveTab('content')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'content'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              Ma'lumot turi
            </button>
            <button
              onClick={() => setActiveTab('design')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'design'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              Rang & Uslub
            </button>
            <button
              onClick={() => setActiveTab('logo')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-lg transition ${
                activeTab === 'logo'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Logo & Ramka
            </button>
          </div>

          {/* TAB 1: CONTENT TYPE */}
          {activeTab === 'content' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  QR Turini tanlang
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'url', label: 'Havola / URL', icon: <Link className="w-3.5 h-3.5" /> },
                    { id: 'text', label: 'Oddiy matn', icon: <FileText className="w-3.5 h-3.5" /> },
                    { id: 'wifi', label: 'Wi-Fi tarmog\'i', icon: <Wifi className="w-3.5 h-3.5" /> },
                    { id: 'phone', label: 'Telefon', icon: <Phone className="w-3.5 h-3.5" /> },
                    { id: 'email', label: 'Email xat', icon: <Mail className="w-3.5 h-3.5" /> },
                    { id: 'sms', label: 'SMS xabar', icon: <MessageSquare className="w-3.5 h-3.5" /> },
                    { id: 'vcard', label: 'Kontakt (vCard)', icon: <User className="w-3.5 h-3.5" /> },
                    { id: 'geo', label: 'Geo manzil', icon: <MapPin className="w-3.5 h-3.5" /> },
                    { id: 'calendar', label: 'Kalendar hodisasi', icon: <Calendar className="w-3.5 h-3.5" /> },
                    { id: 'social', label: 'Ijtimoiy tarmoq', icon: <Share2 className="w-3.5 h-3.5" /> },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setDataType(t.id as QRDataType)}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-xs font-medium transition ${
                        dataType === t.id
                          ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {t.icon}
                      <span className="text-[11px] truncate w-full text-center">{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Specific inputs */}
              <div className="pt-2">
                {dataType === 'url' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Web-sayt havolasi (URL)
                    </label>
                    <input
                      type="url"
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {dataType === 'text' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Matn
                    </label>
                    <textarea
                      rows={3}
                      value={textValue}
                      onChange={(e) => setTextValue(e.target.value)}
                      placeholder="Istalgan ma'lumot yoki eslatma yozing..."
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {dataType === 'wifi' && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Tarmoq nomi (SSID)
                        </label>
                        <input
                          type="text"
                          value={wifiData.ssid}
                          onChange={(e) => setWifiData({ ...wifiData, ssid: e.target.value })}
                          className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                          Parol
                        </label>
                        <input
                          type="text"
                          value={wifiData.pass}
                          onChange={(e) => setWifiData({ ...wifiData, pass: e.target.value })}
                          className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <select
                        value={wifiData.enc}
                        onChange={(e) => setWifiData({ ...wifiData, enc: e.target.value })}
                        className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2 text-slate-900 dark:text-white"
                      >
                        <option value="WPA">WPA / WPA2 / WPA3</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">Parolsiz (Ochiq)</option>
                      </select>
                      <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wifiData.hidden}
                          onChange={(e) => setWifiData({ ...wifiData, hidden: e.target.checked })}
                          className="rounded text-indigo-600"
                        />
                        Yashirin tarmoq
                      </label>
                    </div>
                  </div>
                )}

                {dataType === 'phone' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Telefon raqami
                    </label>
                    <input
                      type="tel"
                      value={phoneValue}
                      onChange={(e) => setPhoneValue(e.target.value)}
                      placeholder="+998901234567"
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                )}

                {dataType === 'email' && (
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder="Qabul qiluvchi pochta"
                      value={emailData.email}
                      onChange={(e) => setEmailData({ ...emailData, email: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                    <input
                      type="text"
                      placeholder="Mavzu"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                    <textarea
                      rows={2}
                      placeholder="Xat matni..."
                      value={emailData.body}
                      onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                      className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white"
                    />
                  </div>
                )}

                {dataType === 'vcard' && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <input
                      type="text"
                      placeholder="To'liq ism"
                      value={vcardData.name}
                      onChange={(e) => setVcardData({ ...vcardData, name: e.target.value })}
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="tel"
                      placeholder="Telefon"
                      value={vcardData.phone}
                      onChange={(e) => setVcardData({ ...vcardData, phone: e.target.value })}
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="email"
                      placeholder="Email"
                      value={vcardData.email}
                      onChange={(e) => setVcardData({ ...vcardData, email: e.target.value })}
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                    <input
                      type="text"
                      placeholder="Tashkilot / Kompaniya"
                      value={vcardData.company}
                      onChange={(e) => setVcardData({ ...vcardData, company: e.target.value })}
                      className="p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                )}

                {dataType === 'geo' && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Kenglik (Latitude)
                      </label>
                      <input
                        type="text"
                        value={geoData.lat}
                        onChange={(e) => setGeoData({ ...geoData, lat: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Uzunlik (Longitude)
                      </label>
                      <input
                        type="text"
                        value={geoData.lng}
                        onChange={(e) => setGeoData({ ...geoData, lng: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                      />
                    </div>
                  </div>
                )}

                {dataType === 'social' && (
                  <div className="grid grid-cols-3 gap-2">
                    <select
                      value={socialData.platform}
                      onChange={(e) => setSocialData({ ...socialData, platform: e.target.value })}
                      className="text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                    >
                      <option value="telegram">Telegram</option>
                      <option value="instagram">Instagram</option>
                      <option value="youtube">YouTube</option>
                      <option value="github">GitHub</option>
                      <option value="twitter">Twitter / X</option>
                    </select>
                    <input
                      type="text"
                      placeholder="Username (masalan: smarttools_uz)"
                      value={socialData.handle}
                      onChange={(e) => setSocialData({ ...socialData, handle: e.target.value })}
                      className="col-span-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: DESIGN & COLORS */}
          {activeTab === 'design' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    QR Rang (Asosiy)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.fgColor}
                      onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border cursor-pointer"
                    />
                    <input
                      type="text"
                      value={config.fgColor}
                      onChange={(e) => setConfig({ ...config, fgColor: e.target.value })}
                      className="w-full text-xs uppercase font-mono p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fon rangi
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      disabled={config.transparentBg}
                      value={config.bgColor}
                      onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                      className="w-9 h-9 rounded-lg border cursor-pointer disabled:opacity-30"
                    />
                    <input
                      type="text"
                      disabled={config.transparentBg}
                      value={config.bgColor}
                      onChange={(e) => setConfig({ ...config, bgColor: e.target.value })}
                      className="w-full text-xs uppercase font-mono p-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 disabled:opacity-30"
                    />
                  </div>
                </div>
              </div>

              {/* Gradient Toggle */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                    Gradient qo'llash
                  </label>
                  <input
                    type="checkbox"
                    checked={config.useGradient}
                    onChange={(e) => setConfig({ ...config, useGradient: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600"
                  />
                </div>

                {config.useGradient && (
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.gradientColor2}
                      onChange={(e) => setConfig({ ...config, gradientColor2: e.target.value })}
                      className="w-9 h-9 rounded-lg border cursor-pointer"
                    />
                    <span className="text-xs text-slate-500">Ikkinchi rang (Gradient oxiri)</span>
                  </div>
                )}
              </div>

              {/* Dot Style */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Nuqtalar uslubi (Dot style)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'square', label: 'Kvadrat (Klassik)' },
                    { id: 'rounded', label: 'Yumaloqlangan' },
                    { id: 'dots', label: 'Doirachalar' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => setConfig({ ...config, dotStyle: s.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition ${
                        config.dotStyle === s.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Quiet Zone & Transparent */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Chetki bo'shliq (Quiet zone): {config.quietZone}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="4"
                    value={config.quietZone}
                    onChange={(e) => setConfig({ ...config, quietZone: Number(e.target.value) })}
                    className="w-full accent-indigo-600"
                  />
                </div>
                <div className="flex items-center pt-4">
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.transparentBg}
                      onChange={(e) => setConfig({ ...config, transparentBg: e.target.checked })}
                      className="w-4 h-4 rounded text-indigo-600"
                    />
                    Shaffof fon (Transparent PNG)
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LOGO & FRAME */}
          {activeTab === 'logo' && (
            <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
              {/* Frame Style */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ramka (Frame)
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'none', label: "Ramkasiz" },
                    { id: 'simple', label: "Oddiy hoshiya" },
                    { id: 'badge', label: "SCAN ME Yozuvi" },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setConfig({ ...config, frame: f.id as any })}
                      className={`p-2.5 rounded-xl border text-xs font-medium transition ${
                        config.frame === f.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                {config.frame === 'badge' && (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Ramka matni
                      </label>
                      <input
                        type="text"
                        value={config.frameText}
                        onChange={(e) => setConfig({ ...config, frameText: e.target.value })}
                        className="w-full text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Ramka rangi
                      </label>
                      <input
                        type="color"
                        value={config.frameColor}
                        onChange={(e) => setConfig({ ...config, frameColor: e.target.value })}
                        className="w-full h-8 rounded-lg cursor-pointer border"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Logo Upload */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-3">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  QR markaziga Logo joylash
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800 cursor-pointer hover:bg-indigo-100 transition">
                    <Upload className="w-3.5 h-3.5" />
                    Logo yuklash (.png, .jpg)
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                  {config.logoUrl && (
                    <button
                      onClick={() => setConfig({ ...config, logoUrl: undefined })}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Logoni o'chirish
                    </button>
                  )}
                </div>

                {config.logoUrl && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Logo o'lchami: {config.logoSize}%
                    </label>
                    <input
                      type="range"
                      min="10"
                      max="30"
                      value={config.logoSize}
                      onChange={(e) => setConfig({ ...config, logoSize: Number(e.target.value) })}
                      className="w-full accent-indigo-600"
                    />
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Maslahat: Skanerlash buzilmasligi uchun logo hajmini 24% dan oshirmaslik tavsiya etiladi.
                    </p>
                  </div>
                )}
              </div>

              {/* Error Correction Level */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Xatolikni tiklash darajasi (Error Correction)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'L', label: 'L (7%)' },
                    { id: 'M', label: 'M (15%)' },
                    { id: 'Q', label: 'Q (25%)' },
                    { id: 'H', label: 'H (30% Eng yuqori)' },
                  ].map((ec) => (
                    <button
                      key={ec.id}
                      onClick={() => setConfig({ ...config, errorCorrection: ec.id as any })}
                      className={`p-2 rounded-xl border text-xs font-medium transition ${
                        config.errorCorrection === ec.id
                          ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 font-bold'
                          : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      {ec.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live QR Preview & Export */}
        <div className="lg:col-span-5 space-y-4">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center shadow-lg relative">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Jonli Ko'rinish & Tekshiruv
            </h3>

            {/* QR Canvas Display */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 shadow-inner flex items-center justify-center max-w-full">
              <canvas
                ref={canvasRef}
                className="max-h-72 w-auto object-contain rounded-lg transition-all duration-300"
              />
            </div>

            {/* Scannability Warning / Success alert (Requirement: MUST warn if unscannable) */}
            <div className="w-full mt-4">
              {scanResult.isScannable ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs text-left">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold">QR Kod to'liq o'qiladi.</span> Kamera va skanerlar hech qanday to'siqsiz taniydi.
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-100 text-xs text-left animate-pulse">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Diqqat: QR Kod o'qilmasligi mumkin!</p>
                    <p className="mt-0.5 opacity-90 leading-tight">
                      {scanResult.warning || "Ranglar kontrasti juda past yoki markazdagi logo kodning muhim qismini to'sib qo'ymoqda."}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Payload Preview */}
            <div className="w-full mt-3 p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate text-left">
              <span className="font-bold text-slate-400">Data: </span>
              {payload}
            </div>

            {/* Export Buttons */}
            <div className="w-full mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300 text-left mb-2">
                Yuklab olish formatlari
              </p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={downloadPNG}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  PNG (Yuqori sifat)
                </button>
                <button
                  onClick={downloadJPG}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold shadow-sm transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  JPG
                </button>
                <button
                  onClick={downloadSVG}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  SVG (Vektor)
                </button>
                <button
                  onClick={downloadPDF}
                  className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  PDF (Chop etish)
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
