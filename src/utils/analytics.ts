// Client-side analytics & real-time visitor tracking for SmartTools AI

export function getOrCreateVisitorId(): string {
  try {
    const key = 'smarttools_visitor_uuid';
    let id = localStorage.getItem(key);
    if (!id) {
      id = 'usr_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now().toString(36).slice(-4);
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'usr_' + Math.random().toString(36).substring(2, 9);
  }
}

export function detectDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceType: 'Desktop' | 'Mobile' | 'Tablet' = 'Desktop';
  let browser = 'Chrome';
  let os = 'Windows';

  // Device detection
  const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/i.test(ua);
  const isMobile = /mobile|iphone|ipod|android.*mobile|blackberry|opera mini|iemobile|wpdesktop/i.test(ua);

  if (isTablet) {
    deviceType = 'Tablet';
  } else if (isMobile) {
    deviceType = 'Mobile';
  } else {
    deviceType = 'Desktop';
  }

  // OS detection
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/ipad|iphone|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';

  // Browser detection
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';

  const screen = typeof window !== 'undefined' ? `${window.screen.width}x${window.screen.height}` : '1920x1080';
  const language = typeof navigator !== 'undefined' ? navigator.language : 'uz';

  return { deviceType, browser, os, screen, language };
}

export async function sendVisitHeartbeat(toolId: string = 'home', toolName: string = 'Bosh sahifa') {
  try {
    const visitorId = getOrCreateVisitorId();
    const info = detectDeviceInfo();

    const response = await fetch('/api/analytics/visit', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        visitorId,
        toolId,
        toolName,
        ...info,
      }),
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (e) {
    // Fail silently in background
    console.debug('Analytics ping:', e);
  }
  return null;
}
