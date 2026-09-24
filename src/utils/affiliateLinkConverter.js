/**
 * Utility to convert raw product links into verified affiliate links
 * and parse cURL network requests from Mercado Livre LinkBuilder
 */

export function getAffiliateSettings() {
  const saved = localStorage.getItem('affiliate_settings');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {}
  }
  return {
    enabled: true,
    tag: '',
    cookie: '',
    csrfToken: '',
    mattTool: '',
    mattWord: ''
  };
}

export function saveAffiliateSettings(settings) {
  localStorage.setItem('affiliate_settings', JSON.stringify(settings));
}

export function parseCurlCommand(curlString) {
  if (!curlString || typeof curlString !== 'string') return null;

  let cookie = '';
  let csrfToken = '';
  let tag = '';

  const cookieMatch = curlString.match(/-H\s+['"]cookie:\s*([^'"]+)['"]/i) ||
                      curlString.match(/header\s+['"]cookie:\s*([^'"]+)['"]/i) ||
                      curlString.match(/cookie:\s*([^'"\r\n]+)/i);
  if (cookieMatch) {
    cookie = cookieMatch[1].trim();
  }

  const csrfMatch = curlString.match(/-H\s+['"]x-csrf-token:\s*([^'"]+)['"]/i) ||
                    curlString.match(/x-csrf-token:\s*([^'"\r\n]+)/i);
  if (csrfMatch) {
    csrfToken = csrfMatch[1].trim();
  }

  const tagMatch = curlString.match(/["']tag["']\s*:\s*["']([^"']+)["']/i);
  if (tagMatch) {
    tag = tagMatch[1].trim();
  }

  return { cookie, csrfToken, tag };
}

export function convertUrlToAffiliateLink(url, customSettings = null) {
  if (!url) return '';
  const settings = customSettings || getAffiliateSettings();

  if (!settings.enabled) return url;

  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes('mercadolivre') || parsed.hostname.includes('mercadolibre')) {
      if (settings.tag && settings.tag.trim()) {
        parsed.searchParams.set('matt_tool', settings.mattTool?.trim() || '12345678');
        parsed.searchParams.set('matt_word', settings.tag.trim());
      } else if (settings.mattTool && settings.mattTool.trim()) {
        parsed.searchParams.set('matt_tool', settings.mattTool.trim());
        if (settings.mattWord) parsed.searchParams.set('matt_word', settings.mattWord.trim());
      }
      return parsed.toString();
    }
  } catch (e) {
    if (settings.tag && url.includes('mercadolivre')) {
      const sep = url.includes('?') ? '&' : '?';
      return `${url}${sep}matt_word=${settings.tag.trim()}`;
    }
  }

  return url;
}

export async function shortenAffiliateLink(url, customSettings = null) {
  if (!url) return '';
  const settings = customSettings || getAffiliateSettings();

  try {
    const res = await fetch('/api/affiliate/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url,
        cookie: settings.cookie,
        csrfToken: settings.csrfToken,
        tag: settings.tag
      })
    });
    const data = await res.json();
    if (data.success && data.shortUrl) {
      return data.shortUrl;
    }
  } catch (e) {}

  return convertUrlToAffiliateLink(url, settings);
}

