import axios from 'axios';
import * as cheerio from 'cheerio';

const url = 'https://meli.la/1PDk7te';

async function testMLScrape() {
  try {
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept-Language': 'pt-BR,pt;q=0.9',
      },
      maxRedirects: 10
    });

    const $ = cheerio.load(response.data);

    let price = '';
    let originalPrice = '';

    // Target Mercado Livre active price
    const currentPriceEl = $('.poly-price__current .andes-money-amount, .ui-pdp-price__second-line .andes-money-amount').first();
    if (currentPriceEl.length) {
      const text = currentPriceEl.text().trim();
      const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
      if (m) price = m[1].replace(/\./g, '').replace(',', '.');
    }

    // Target Mercado Livre original strike price
    const origPriceEl = $('s .andes-money-amount, .andes-money-amount--previous, .ui-pdp-price__original-value, .poly-component__price .andes-money-amount').first();
    if (origPriceEl.length) {
      const text = origPriceEl.text().trim();
      const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
      if (m) originalPrice = m[1].replace(/\./g, '').replace(',', '.');
    }

    // Fallback if original price equals current price
    if (originalPrice === price) originalPrice = '';

    console.log('RESULT:');
    console.log('Preço Original (De):', originalPrice);
    console.log('Preço Promocional (Por):', price);

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testMLScrape();
