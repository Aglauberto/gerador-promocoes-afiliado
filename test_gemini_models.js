import axios from 'axios';

async function testGeminiModel(model, apiKey) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  console.log(`Testing model: ${model}...`);
  try {
    const res = await axios.post(url, {
      contents: [{ parts: [{ text: 'Hello, reply with 1 word test OK' }] }]
    }, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    });
    console.log(`[${model}] SUCCESS:`, res.data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim());
    return true;
  } catch (err) {
    console.log(`[${model}] FAILED:`, err.response?.status, err.response?.data?.error?.message || err.message);
    return false;
  }
}

async function run() {
  const dummyKey = 'AIzaSyA_TEST_KEY_CHECK';
  const models = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-3.6-flash'];
  for (const m of models) {
    await testGeminiModel(m, dummyKey);
  }
}

run();
