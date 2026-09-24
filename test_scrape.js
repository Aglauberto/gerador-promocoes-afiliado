import axios from 'axios';
import * as cheerio from 'cheerio';

const url = 'https://meli.la/1PDk7te';

async function testScrape() {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      maxRedirects: 10
    });

    console.log('Final URL:', response.request?.res?.responseUrl || url);
    const $ = cheerio.load(response.data);

    console.log('--- OG Meta ---');
    console.log('og:title:', $('meta[property="og:title"]').attr('content'));
    console.log('og:price:amount:', $('meta[property="product:price:amount"]').attr('content'));

    console.log('--- JSON-LD ---');
    $('script[type="application/ld+json"]').each((i, el) => {
      console.log(`Script ${i}:`, $(el).html()?.substring(0, 300));
    });

    console.log('--- ML Price Selectors ---');
    console.log('ui-pdp-price__second-line:', $('.ui-pdp-price__second-line').text().trim());
    console.log('ui-pdp-price__original-value:', $('.ui-pdp-price__original-value').text().trim());
    console.log('andes-money-amount:', $('.andes-money-amount').map((_, el) => $(el).text().trim()).get());

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testScrape();
