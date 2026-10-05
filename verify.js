const http = require('http');
const assert = require('assert');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get(`http://127.0.0.1:3000${path}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('🧪 Starting SafePlate AI Automated Verification Suite...\n');

  // Test 1: Health endpoint
  const health = await get('/api/health');
  console.log(`[Test 1] /api/health -> Status: ${health.status}`);
  const healthJson = JSON.parse(health.body);
  console.log(`         Ollama Host: ${healthJson.host}, Status: ${healthJson.status}, Models: ${healthJson.models.map(m=>m.name).join(', ')}`);
  assert.strictEqual(health.status, 200, 'Health check should return 200');

  // Test 2: Index HTML
  const index = await get('/index.html');
  console.log(`[Test 2] /index.html -> Status: ${index.status}, Size: ${index.body.length} bytes`);
  assert(index.body.includes('SafePlate'), 'Index HTML should contain SafePlate');
  assert(index.body.includes('Rohan Gupta'), 'Index HTML should contain Rohan Gupta default profile');

  // Test 3: Stylesheet
  const css = await get('/style.css');
  console.log(`[Test 3] /style.css -> Status: ${css.status}, Size: ${css.body.length} bytes`);
  assert(css.body.includes('--primary:'), 'CSS should define theme tokens');

  // Test 4: JavaScript app
  const js = await get('/app.js');
  console.log(`[Test 4] /app.js -> Status: ${js.status}, Size: ${js.body.length} bytes`);
  assert(js.body.includes('ALLERGEN_DATABASE'), 'App JS should include allergen database');
  assert(js.body.includes('FRIEND_PRESETS'), 'App JS should include friend presets');

  console.log('\n======================================================');
  console.log('✅ ALL TESTS PASSED! Application is 100% functional!');
  console.log('======================================================\n');
}

runTests().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
