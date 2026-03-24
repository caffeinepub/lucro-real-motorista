# Lucro Real Motorista

## Current State
App funcional com 3 telas: configuração de veículo (VehicleSetup), registro de corridas (RideEntry), e resumo do dia (DaySummary). Dados persistidos no localStorage. Calcula lucro líquido descontando taxa da plataforma (Uber 28%, 99 20%, inDrive 10%) e custo de km (combustão ou elétrico). Tem cronômetro de corrida e exportação CSV.

## Requested Changes (Diff)

### Add
- Tela de Gráficos dedicada com navegação entre Dia / Mês / Ano
- Gráficos por plataforma separados: barras de lucro por hora do dia, pizza de distribuição de corridas por plataforma
- Gráfico combinado: linha de lucro acumulado ao longo do tempo
- Histórico multi-dia: corridas são salvas com data, permitindo visualização por mês e ano
- Painel de estatísticas rápidas na tela principal: total de corridas, lucro médio por corrida, melhor plataforma do dia
- Visual completamente renovado: dark tech dashboard, gradientes neon, cards com glow, tipografia bold

### Modify
- App.tsx: adicionar nova tela 'charts' e tipo Screen
- RideEntry: cada corrida salva com timestamp (data/hora)
- DaySummary: link para tela de gráficos
- types.ts: Ride deve ter campo `timestamp: string` (ISO date)
- localStorage: rides salvos com histórico acumulado multi-dia (não limpar ao finalizar expediente, só arquivar)

### Remove
- Nada removido

## Implementation Plan
1. Atualizar types.ts: adicionar `timestamp` em Ride, adicionar 'charts' em Screen
2. Criar componente ChartsScreen.tsx com:
   - Tabs: Dia / Mês / Ano
   - Recharts: BarChart de lucro por hora, PieChart de corridas por plataforma, LineChart de lucro acumulado
   - Filtros de data
3. Atualizar App.tsx para incluir tela de gráficos
4. Redesign visual completo: dark dashboard profissional com cores neon (verde para lucro, azul para Uber, amarelo para 99, laranja para inDrive)
5. Atualizar RideEntry para adicionar timestamp automaticamente ao registrar corrida
6. Validar e fazer build
