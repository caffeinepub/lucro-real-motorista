# Lucro Real Motorista

## Current State
App funcional com fluxo: setup -> ride -> summary -> charts. Sem autenticação. Navegação por troca de tela. Dados em localStorage. Gráficos por plataforma (Uber, 99, inDrive) com visão dia/mês/ano.

## Requested Changes (Diff)

### Add
- Tela de Login com mascote pug 3D/caricatura no topo
- Formulário de cadastro: email, senha, data de nascimento
- Formulário de login: email e senha
- Botão "Entrar com Google" (simulado visualmente, sem OAuth real)
- Navegação por 3 abas inferiores: Login/Perfil | Ativar App | Gráficos
- Autenticação local simulada com localStorage (sem backend auth)
- Guard: abas 2 e 3 só acessíveis após login

### Modify
- App.tsx: reestruturar para 3 abas com bottom navigation
- Aba 2 "Ativar Aplicativo": unifica VehicleSetup + RideEntry + DaySummary
- Aba 3 "Gráficos": ChartsScreen existente
- Aba 1 após login vira "Perfil" com nome do usuário e botão sair

### Remove
- Botões de navegação inline entre telas (substituídos pelo bottom nav)

## Implementation Plan
1. Criar componente LoginScreen com pug image, formulários login/cadastro, botão Google simulado
2. Criar componente BottomNav com 3 abas
3. Criar AuthContext/state em App.tsx para controle de autenticação via localStorage
4. Integrar tudo em App.tsx com lógica de guarda de rota por aba
5. Adaptar RideEntry e VehicleSetup para remover navegação para charts (agora via bottom nav)
