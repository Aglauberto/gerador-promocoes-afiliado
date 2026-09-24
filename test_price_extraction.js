import axios from 'axios';
import * as cheerio from 'cheerio';

const AXIOS_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
};

async function testPriceParsing() {
  const url = 'https://www.mercadolivre.com.br/c/casa-moveis-e-decoracao';
  const res = await axios.get(url, { headers: AXIOS_HEADERS, timeout: 8000 });
  const $ = cheerio.load(res.data);

  $('.poly-card, .ui-search-result__wrapper, .ui-search-layout__item, [class*="card"]').each((i, el) => {
    if (i >= 5) return;
    const title = $(el).find('.poly-component__title, .ui-search-item__title, a[class*="title"]').first().text().trim();

    // Active Current Price ("Por") - MUST NOT match crossed out <s> or previous price elements
    let price = 0;
    let originalPrice = 0;

    // 1. Original / Strikethrough Price ("De")
    const origEl = $(el).find('s .andes-money-amount, .andes-money-amount--previous, .poly-price__original .andes-money-amount').first();
    if (origEl.length) {
      const text = origEl.text().trim();
      const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
      if (m) originalPrice = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    }

    // 2. Active Price ("Por") - Selectors specifically for current active price
    const currentPriceEl = $(el).find('.poly-price__current .andes-money-amount, .ui-search-price__part--medium .andes-money-amount, .andes-money-amount:not(s .andes-money-amount):not(.andes-money-amount--previous)').first();
    if (currentPriceEl.length) {
      const text = currentPriceEl.text().trim();
      const m = text.match(/R\$\s*([\d.]+,\d{2}|\d+[\.,]?\d*)/);
      if (m) price = parseFloat(m[1].replace(/\./g, '').replace(',', '.'));
    }

    console.log(`Item [${i+1}]: ${title}`);
    console.log(`   Scraped Price (Por): R$ ${price}`);
    console.log(`   Scraped Original (De): R$ ${originalPrice}`);
  });
}

testPriceParsing();
