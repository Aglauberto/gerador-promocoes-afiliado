function parseCurlCommand(curlString) {
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

const sampleCurl = `curl 'https://www.mercadolivre.com.br/afiliados/linkbuilder/api/create' \\
  -H 'accept: application/json, text/plain, */*' \\
  -H 'cookie: _gcl_au=1.1.12345; org.mercadolivre.session=abc123xyz' \\
  -H 'x-csrf-token: 987654321_csrf_token_example' \\
  --data-raw '{"url":"https://www.mercadolivre.com.br/panela/p/MLB123","tag":"minhatagafiliado"}'`;

const result = parseCurlCommand(sampleCurl);
console.log('Parsed cURL Result:', result);
