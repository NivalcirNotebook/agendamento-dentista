import axios from 'axios';
import { env } from '../config/env.config';

async function testEvolutionAPI() {
  console.log('\n🔍 Testando Evolution API...\n');
  console.log('Configuração:');
  console.log(`  URL: ${env.EVOLUTION_API_URL}`);
  console.log(`  Instance: ${env.EVOLUTION_INSTANCE_NAME}`);
  console.log(`  API Key: ${env.EVOLUTION_API_KEY?.substring(0, 10)}...`);
  console.log('\n');

  const client = axios.create({
    baseURL: env.EVOLUTION_API_URL,
    headers: {
      'apikey': env.EVOLUTION_API_KEY,
      'Content-Type': 'application/json',
    },
    timeout: 10000,
  });

  const endpoints = [
    '/instance/fetchInstances',
    `/instance/connectionState/${env.EVOLUTION_INSTANCE_NAME}`,
    `/instance/connect/${env.EVOLUTION_INSTANCE_NAME}`,
  ];

  for (const endpoint of endpoints) {
    try {
      console.log(`\n📡 Testando: GET ${endpoint}`);
      const response = await client.get(endpoint);
      console.log('✅ Status:', response.status);
      console.log('📄 Resposta:', JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.log('❌ Erro:', error.message);
      if (error.response) {
        console.log('   Status HTTP:', error.response.status);
        console.log('   Dados:', JSON.stringify(error.response.data, null, 2));
      }
    }
  }

  console.log('\n✅ Teste concluído!\n');
  process.exit(0);
}

testEvolutionAPI();
