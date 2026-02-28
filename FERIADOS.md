# 🎉 Configuração de Feriados

Este guia explica como configurar os feriados em que a clínica não atende.

## 📝 Como Configurar

Adicione a variável `CLINIC_HOLIDAYS` no seu arquivo `.env`:

```env
# Feriados (aceita formato ISO ou brasileiro)
CLINIC_HOLIDAYS=2026-01-01,2026-12-25,2026-04-21,2026-11-15,2026-11-20
```

## 📅 Formatos Aceitos

O sistema aceita **dois formatos** de data:

### Formato ISO (YYYY-MM-DD)
```env
CLINIC_HOLIDAYS=2026-01-01,2026-12-25,2026-04-21
```

### Formato Brasileiro (DD/MM/YYYY)
```env
CLINIC_HOLIDAYS=01/01/2026,25/12/2026,21/04/2026
```

### Formato Misto (ambos juntos)
```env
CLINIC_HOLIDAYS=01/01/2026,2026-12-25,21/04/2026
```

### ✅ Todos Corretos
```env
CLINIC_HOLIDAYS=2026-01-01,2026-12-25,2026-04-21
CLINIC_HOLIDAYS=01/01/2026,25/12/2026,21/04/2026
CLINIC_HOLIDAYS=01/01/2026,2026-12-25,21/04/2026
```

### ❌ Incorretos
```env
CLINIC_HOLIDAYS=2026-01-01, 2026-12-25  # Tem espaços (mas funciona se tiver)
CLINIC_HOLIDAYS=1/1/2026                # Falta zero à esquerda (mas funciona)
```

## 🇧🇷 Feriados Nacionais do Brasil 2026

Use este exemplo como base:

```env
CLINIC_HOLIDAYS=2026-01-01,2026-02-16,2026-02-17,2026-04-03,2026-04-21,2026-05-01,2026-06-04,2026-09-07,2026-10-12,2026-11-02,2026-11-15,2026-11-20,2026-12-25
```

**Lista detalhada:**
- `2026-01-01` - Confraternização Universal
- `2026-02-16` - Carnaval (Segunda-feira)
- `2026-02-17` - Carnaval (Terça-feira)
- `2026-04-03` - Sexta-feira Santa
- `2026-04-21` - Tiradentes
- `2026-05-01` - Dia do Trabalho
- `2026-06-04` - Corpus Christi
- `2026-09-07` - Independência do Brasil
- `2026-10-12` - Nossa Senhora Aparecida
- `2026-11-02` - Finados
- `2026-11-15` - Proclamação da República
- `2026-11-20` - Dia da Consciência Negra
- `2026-12-25` - Natal

## 🏙️ Feriados Municipais/Estaduais

Você pode adicionar feriados locais da sua cidade/estado:

```env
# Exemplo: São Paulo
CLINIC_HOLIDAYS=2026-01-01,2026-01-25,2026-02-16,2026-02-17,2026-04-03,2026-04-21,2026-05-01,2026-06-04,2026-07-09,2026-09-07,2026-10-12,2026-11-02,2026-11-15,2026-11-20,2026-12-25
```

Feriados adicionais de São Paulo:
- `2026-01-25` - Aniversário de São Paulo
- `2026-07-09` - Revolução Constitucionalista

## 📱 Como Funciona no Bot

Quando um paciente tenta agendar em um feriado, o bot responde:

```
❌ Infelizmente não atendemos neste dia pois é feriado.

🎉 A clínica estará fechada.

Por favor, escolha outra data para seu agendamento.
```

## 🔄 Atualizando Feriados

### Para o Ano Seguinte

1. **Pesquise** os feriados do próximo ano
2. **Edite** o arquivo `.env`
3. **Substitua** as datas antigas pelas novas
4. **Reinicie** o bot: `npm run dev`

### Ferramenta Online

Use sites como:
- https://www.calendario.com.br/feriados/
- https://www.feriados.com.br/

## 💡 Dicas

### Deixar Vazio
Se não quiser configurar feriados, deixe vazio:
```env
CLINIC_HOLIDAYS=
```

### Apenas Feriados Principais
Configure apenas os feriados em que realmente não atende:
```env
# Apenas Natal e Ano Novo
CLINIC_HOLIDAYS=2026-01-01,2026-12-25
```

### Pontos Facultativos
Se sua clínica **atende** em pontos facultativos (ex: Carnaval), **não** adicione essas datas.

## 🚀 Aplicar Mudanças

Após editar o `.env`:

```bash
# Pare o bot (Ctrl+C)
# Reinicie
npm run dev
```

As mudanças são aplicadas imediatamente! 🎉

## 📊 Exemplo Completo no .env

```env
# Configurações da Clínica
CLINIC_NAME=Clínica Odontológica Dr. Silva
CLINIC_ADDRESS=Rua das Flores, 123 - Centro
CLINIC_PHONE=+55 11 99999-9999
CLINIC_BUSINESS_HOURS_START=08:00
CLINIC_BUSINESS_HOURS_END=18:00
CLINIC_APPOINTMENT_DURATION=30
CLINIC_WORKING_DAYS=1,2,3,4,5
CLINIC_HOLIDAYS=2026-01-01,2026-02-16,2026-02-17,2026-04-03,2026-04-21,2026-05-01,2026-06-04,2026-09-07,2026-10-12,2026-11-02,2026-11-15,2026-11-20,2026-12-25
```

---

**Pronto!** Sua clínica agora reconhece automaticamente feriados e impede agendamentos nessas datas. ✨
