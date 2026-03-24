# Lucro Real Motorista

## Current State
New project. No existing application files.

## Requested Changes (Diff)

### Add
- Screen 1 (Vehicle Setup): toggle combustão/elétrico, price per liter/kWh input, avg consumption input, cost-per-km calculation, "Começar a Rodar" button
- Screen 2 (Ride Entry): gross ride value input, km input, platform selector (Uber/99/inDrive), "Adicionar ao Dia" button, running ride list
- Screen 3 (Financial Summary): daily totals (gross revenue, platform fees, operating cost, net profit), per-platform profit breakdown table, "Finalizar Expediente e Zerar" button
- Fixed platform fee rates: Uber 28%, 99 20%, inDrive 10%
- Per-ride math: platform fee = gross × rate; ride cost = km × cost per km; net = gross − fee − cost
- Currency formatted as R$ with Brazilian decimal notation
- Mobile-first dark high-contrast theme
- Smooth navigation between screens
- Backend storage for vehicle config and daily rides

### Modify
- N/A

### Remove
- N/A

## Implementation Plan
1. Backend: store vehicle config (type, energy price, avg consumption, cost per km) and daily rides (gross, km, platform, fee, cost, net profit)
2. Frontend: three-screen flow with bottom nav or tab navigation
3. Screen 1: vehicle type toggle, two inputs, save button
4. Screen 2: ride entry form, platform buttons, add ride, scrollable ride list
5. Screen 3: computed daily summary, platform breakdown, reset button
6. Dark theme with lime-green accent (#B7F23D), high-contrast for outdoor use
