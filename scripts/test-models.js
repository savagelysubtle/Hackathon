#!/usr/bin/env node

/**
 * Test script for LM Studio and OpenAI model integration
 *
 * Usage:
 *   node scripts/test-models.js [provider]
 *
 * Examples:
 *   node scripts/test-models.js openai    # Test OpenAI
 *   node scripts/test-models.js lmstudio  # Test LM Studio
 *   node scripts/test-models.js           # Test both
 */

const https = require('https');
const http = require('http');

async function testModel(provider, modelConfig) {
  console.log(`\n🧪 Testing ${provider.toUpperCase()} model...`);

  const payload = {
    message: "Hello! Can you tell me what 2+2 equals?",
    model: modelConfig
  };

  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/langgraph',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const response = JSON.parse(data);

          if (res.statusCode === 200) {
            console.log(`✅ ${provider.toUpperCase()} Response:`, response.response);
            console.log(`📋 Model used:`, response.model);
            resolve(true);
          } else {
            console.log(`❌ ${provider.toUpperCase()} Error:`, response.error);
            resolve(false);
          }
        } catch (error) {
          console.log(`❌ ${provider.toUpperCase()} Parse Error:`, error.message);
          resolve(false);
        }
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${provider.toUpperCase()} Connection Error:`, error.message);
      console.log('💡 Make sure the Next.js server is running with: bun run dev');
      resolve(false);
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

async function main() {
  const args = process.argv.slice(2);
  const requestedProvider = args[0]?.toLowerCase();

  console.log('🚀 Testing LangGraph Agent Model Integration');
  console.log('==========================================');

  // Test configurations
  const testConfigs = {
    openai: {
      provider: 'openai',
      modelName: 'gpt-4o-mini',
      temperature: 0.7
    },
    lmstudio: {
      provider: 'lmstudio',
      modelName: 'local-model',
      temperature: 0.7
    }
  };

  let results = [];

  if (requestedProvider === 'openai' || !requestedProvider) {
    results.push(await testModel('openai', testConfigs.openai));
  }

  if (requestedProvider === 'lmstudio' || !requestedProvider) {
    results.push(await testModel('lmstudio', testConfigs.lmstudio));
  }

  console.log('\n📊 Test Results Summary:');
  console.log('========================');

  if (results.every(result => result)) {
    console.log('🎉 All tests passed!');
    console.log('\n💡 Usage Examples:');
    console.log('==================');
    console.log('OpenAI: curl -X POST http://localhost:3000/api/langgraph -H "Content-Type: application/json" -d \'{"message": "Hello!", "model": {"provider": "openai"}}\'');
    console.log('LM Studio: curl -X POST http://localhost:3000/api/langgraph -H "Content-Type: application/json" -d \'{"message": "Hello!", "model": {"provider": "lmstudio"}}\'');
  } else {
    console.log('⚠️  Some tests failed. Check your configuration.');
    console.log('\n🔧 Troubleshooting:');
    console.log('===================');
    console.log('1. Make sure Next.js server is running: bun run dev');
    console.log('2. For OpenAI: Check OPENAI_API_KEY in .env');
    console.log('3. For LM Studio: Make sure LM Studio is running on localhost:1234');
    console.log('4. Check server logs for detailed error messages');
  }

  process.exit(results.every(result => result) ? 0 : 1);
}

main().catch(console.error);
