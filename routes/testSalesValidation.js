const axios = require('axios');

// Configuration
const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

// Helper function to make HTTP requests
async function makeRequest(path, method, body, token) {
  try {
    const config = {
      method: method,
      url: `${BASE_URL}${path}`,
      data: body,
      headers: { 'Content-Type': 'application/json' },
      validateStatus: () => true // Resolve promise for all status codes
    };

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await axios(config);
    return { status: response.status, data: response.data };
  } catch (error) {
    return { status: 500, data: error.message };
  }
}

async function runTests() {
  console.log('Starting Validation Tests...\n');

  // 1. Setup User (Register & Login)
  const userCredentials = {
    name: 'TestAgent',
    email: 'agent@test.com',
    password: 'password123',
    role: 'sales agent'
  };

  console.log('1. Authenticating...');
  // Try to register (ignore if fails assuming user exists)
  await makeRequest('/users', 'POST', userCredentials);
  
  // Login
  const loginRes = await makeRequest('/users/login', 'POST', {
    email: userCredentials.email,
    password: userCredentials.password
  });

  if (loginRes.status !== 200) {
    console.error('Login failed. Ensure the server is running and database is connected.');
    process.exit(1);
  }

  const token = loginRes.data.token;
  console.log('   Login successful. Token received.\n');

  // 2. Test Cash Sales Validation
  console.log('2. Testing /sales/cash Validation');

  const invalidCashSale = {
    produceName: "Bean$",       // Invalid: not alphanumeric ($)
    tonnage: "heavy",           // Invalid: not numeric
    amountPaid: 500,            // Invalid: min 10000
    buyerName: "J",             // Invalid: min length 2
    salesAgentName: "Agent 007",// Invalid: spaces not allowed by isAlphanumeric
    date: "",                   // Invalid: empty
    // time is missing entirely
  };

  const cashRes = await makeRequest('/sales/cash', 'POST', invalidCashSale, token);
  
  if (cashRes.status === 400 && cashRes.data.errors) {
    console.log('   [PASS] Server rejected invalid cash sale data.');
    console.log(`   Errors returned: ${cashRes.data.errors.length}`);
    cashRes.data.errors.forEach(err => console.log(`   - ${err.path || err.param}: ${err.msg}`));
  } else {
    console.log('   [FAIL] Server did not return expected validation errors.');
    console.log('   Status:', cashRes.status);
    console.log('   Response:', cashRes.data);
  }
  console.log('');

  // 3. Test Credit Sales Validation
  console.log('3. Testing /sales/credit Validation');

  const invalidCreditSale = {
    buyerName: "ValidBuyer",
    nin: "TooShort",            // Invalid: min 13
    location: "Kampala City",   // Invalid: spaces not allowed by isAlphanumeric
    contact: "not-a-phone",     // Invalid phone
    amountDue: 5000,            // Invalid: min 10000
    salesAgentName: "ValidAgent",
    dueDate: "",                // Invalid: empty
    produceName: "Maize",
    produceType: "Cereal",
    tonnage: 100,
    dispatchDate: "2026-02-14"
  };

  const creditRes = await makeRequest('/sales/credit', 'POST', invalidCreditSale, token);

  if (creditRes.status === 400 && creditRes.data.errors) {
    console.log('   [PASS] Server rejected invalid credit sale data.');
    console.log(`   Errors returned: ${creditRes.data.errors.length}`);
    creditRes.data.errors.forEach(err => console.log(`   - ${err.path || err.param}: ${err.msg}`));
  } else {
    console.log('   [FAIL] Server did not return expected validation errors.');
    console.log('   Status:', creditRes.status);
    console.log('   Response:', creditRes.data);
  }
  console.log('\nTests Completed.');
}

runTests().catch(console.error);