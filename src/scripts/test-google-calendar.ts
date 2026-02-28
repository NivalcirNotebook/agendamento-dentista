import { google } from 'googleapis';
import { env } from '../config/env.config';

async function testGoogleCalendar() {
  console.log('\n🔍 Testando Google Calendar API...\n');
  
  console.log('Configuração:');
  console.log(`  Client ID: ${env.GOOGLE_CLIENT_ID?.substring(0, 20)}...`);
  console.log(`  Client Secret: ${env.GOOGLE_CLIENT_SECRET?.substring(0, 10)}...`);
  console.log(`  Calendar ID: ${env.GOOGLE_CALENDAR_ID}`);
  console.log(`  Refresh Token: ${env.GOOGLE_REFRESH_TOKEN?.substring(0, 15)}...`);
  console.log('\n');

  try {
    const oauth2Client = new google.auth.OAuth2(
      env.GOOGLE_CLIENT_ID,
      env.GOOGLE_CLIENT_SECRET,
      env.GOOGLE_REDIRECT_URI
    );

    if (!env.GOOGLE_REFRESH_TOKEN) {
      console.error('❌ GOOGLE_REFRESH_TOKEN não configurado!');
      console.log('Execute: npm run auth:google');
      process.exit(1);
    }

    oauth2Client.setCredentials({
      refresh_token: env.GOOGLE_REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: 'v3', auth: oauth2Client });

    console.log('📡 Testando acesso ao Google Calendar...\n');

    // Teste 1: Listar calendários
    console.log('1️⃣ Listando calendários disponíveis:');
    try {
      const calendarList = await calendar.calendarList.list();
      console.log('✅ Sucesso! Calendários encontrados:');
      calendarList.data.items?.forEach((cal) => {
        console.log(`   - ${cal.summary} (ID: ${cal.id})`);
      });
      console.log('\n');
    } catch (error: any) {
      console.error('❌ Erro ao listar calendários:', error.message);
      console.error('   Detalhes:', error.response?.data);
      process.exit(1);
    }

    // Teste 2: Buscar eventos
    console.log('2️⃣ Buscando eventos dos próximos 7 dias:');
    try {
      const now = new Date();
      const oneWeek = new Date();
      oneWeek.setDate(oneWeek.getDate() + 7);

      const events = await calendar.events.list({
        calendarId: env.GOOGLE_CALENDAR_ID,
        timeMin: now.toISOString(),
        timeMax: oneWeek.toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime',
      });

      console.log(`✅ Sucesso! Eventos encontrados: ${events.data.items?.length || 0}`);
      events.data.items?.forEach((event) => {
        const start = event.start?.dateTime || event.start?.date;
        console.log(`   - ${event.summary} (${start})`);
      });
      console.log('\n');
    } catch (error: any) {
      console.error('❌ Erro ao buscar eventos:', error.message);
      console.error('   Code:', error.code);
      console.error('   Detalhes:', JSON.stringify(error.response?.data, null, 2));
      
      if (error.code === 404) {
        console.log('\n⚠️  O Calendar ID pode estar incorreto.');
        console.log('   Tente usar "primary" ou um dos IDs listados acima.\n');
      }
      
      process.exit(1);
    }

    // Teste 3: Verificar permissões
    console.log('3️⃣ Verificando permissões:');
    try {
      const calendarInfo = await calendar.calendars.get({
        calendarId: env.GOOGLE_CALENDAR_ID,
      });
      console.log('✅ Sucesso! Informações do calendário:');
      console.log(`   Nome: ${calendarInfo.data.summary}`);
      console.log(`   Timezone: ${calendarInfo.data.timeZone}`);
      console.log(`   Descrição: ${calendarInfo.data.description || 'N/A'}`);
      console.log('\n');
    } catch (error: any) {
      console.error('❌ Erro ao obter informações:', error.message);
      console.error('   Detalhes:', error.response?.data);
    }

    console.log('✅ Todos os testes passaram! Google Calendar está funcionando corretamente.\n');
    process.exit(0);
  } catch (error: any) {
    console.error('\n❌ Erro geral:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testGoogleCalendar();
