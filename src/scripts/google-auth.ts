import * as readline from 'readline';
import { getAuthUrl, setTokenFromCode } from '../config/google.config';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

console.log('\n🔐 Autenticação Google Calendar API\n');
console.log('1. Abra a URL abaixo no seu navegador:');
console.log('\n' + getAuthUrl() + '\n');
console.log('2. Faça login e autorize o acesso');
console.log('3. Copie o código de autorização da URL de redirecionamento\n');

rl.question('Cole o código aqui: ', async (code) => {
  try {
    await setTokenFromCode(code);
    console.log('\n✅ Autenticação concluída com sucesso!');
    console.log('\nAdicione o GOOGLE_REFRESH_TOKEN ao seu arquivo .env\n');
  } catch (error) {
    console.error('\n❌ Erro ao obter token:', error);
  }
  
  rl.close();
  process.exit(0);
});
