import { redis } from '../config/redis.config';
import { logger } from '../utils/logger';

/**
 * Script para limpar todo o histórico de conversas do Redis
 * Use com cuidado - isso apaga TODOS os dados de contexto!
 */
async function clearAllContexts() {
  try {
    logger.info('🔄 Iniciando limpeza do Redis...');

    logger.info('🔍 Buscando todas as chaves de contexto...');
    
    // Busca todas as chaves que começam com 'context:'
    const keys = await redis.keys('context:*');
    
    if (keys.length === 0) {
      logger.info('✅ Nenhum contexto encontrado no Redis. Base já está limpa!');
      return;
    }

    logger.info(`📋 Encontradas ${keys.length} chaves de contexto`);
    logger.info('🗑️  Iniciando limpeza...');

    // Deleta todas as chaves
    const deleted = await redis.del(keys);
    
    logger.info(`✅ Limpeza concluída! ${deleted} chaves deletadas com sucesso`);
    logger.info('');
    logger.info('📊 Resumo:');
    logger.info(`   - Chaves encontradas: ${keys.length}`);
    logger.info(`   - Chaves deletadas: ${deleted}`);
    
  } catch (error) {
    logger.error('❌ Erro ao limpar contextos do Redis:', error);
    throw error;
  }
}

/**
 * Função para limpar contexto de um telefone específico
 */
async function clearPhoneContext(phone: string) {
  try {
    const key = `context:${phone}`;
    logger.info(`🔍 Buscando contexto do telefone ${phone}...`);
    
    const exists = await redis.exists(key);
    
    if (!exists) {
      logger.info(`ℹ️  Nenhum contexto encontrado para ${phone}`);
      return;
    }

    await redis.del(key);
    logger.info(`✅ Contexto do telefone ${phone} deletado com sucesso!`);
    
  } catch (error) {
    logger.error(`❌ Erro ao limpar contexto do telefone ${phone}:`, error);
    throw error;
  }
}

/**
 * Função para listar todos os contextos sem deletar
 */
async function listAllContexts() {
  try {
    logger.info(' Buscando todas as chaves de contexto...');
    
    const keys = await redis.keys('context:*');
    
    if (keys.length === 0) {
      logger.info('📋 Nenhum contexto encontrado no Redis');
      return;
    }

    logger.info(`📋 Encontrados ${keys.length} contextos:\n`);
    
    for (const key of keys) {
      const phone = key.replace('context:', '');
      const ttl = await redis.ttl(key);
      const data = await redis.get(key);
      
      if (data) {
        const context = JSON.parse(data);
        const messagesCount = context.messages?.length || 0;
        const expiresIn = ttl > 0 ? `${Math.floor(ttl / 60)} minutos` : 'sem expiração';
        
        logger.info(`   📞 ${phone}`);
        logger.info(`      - Nome: ${context.name || 'Não informado'}`);
        logger.info(`      - Mensagens: ${messagesCount}`);
        logger.info(`      - Expira em: ${expiresIn}`);
        logger.info('');
      }
    }
    
  } catch (error) {
    logger.error('❌ Erro ao listar contextos do Redis:', error);
    throw error;
  }
}

// Execução do script
const args = process.argv.slice(2);
const command = args[0];
const param = args[1];

(async () => {
  try {
    switch (command) {
      case 'clear':
        await clearAllContexts();
        break;
      
      case 'clear-phone':
        if (!param) {
          logger.error('❌ Por favor, forneça o número do telefone');
          logger.info('Uso: npm run redis:clear -- clear-phone 5519999999999');
          process.exit(1);
        }
        await clearPhoneContext(param);
        break;
      
      case 'list':
        await listAllContexts();
        break;
      
      default:
        logger.info('📖 Uso do script:');
        logger.info('');
        logger.info('Limpar todos os contextos:');
        logger.info('  npm run redis:clear');
        logger.info('');
        logger.info('Limpar contexto de um telefone específico:');
        logger.info('  npm run redis:clear -- clear-phone 5519999999999');
        logger.info('');
        logger.info('Listar todos os contextos:');
        logger.info('  npm run redis:list');
        logger.info('');
        break;
    }
    
    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
})();
