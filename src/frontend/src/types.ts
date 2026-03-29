export type VehicleType = "combustao" | "eletrico";

export interface VehicleConfig {
  type: VehicleType;
  energyPrice: number; // price per liter or per kWh
  consumption: number; // km/L or km/kWh
  costPerKm: number; // computed
}

export type Platform = "uber" | "99" | "indrive";

export interface Ride {
  id: string;
  platform: Platform;
  grossValue: number;
  km: number;
  platformFee: number;
  rideCost: number;
  netProfit: number;
  timestamp: number;
}

export type Screen = "setup" | "ride" | "summary";

export const PLATFORM_RATES: Record<Platform, number> = {
  uber: 0.28,
  "99": 0.2,
  indrive: 0.1,
};

export const PLATFORM_LABELS: Record<Platform, string> = {
  uber: "UBER",
  "99": "99",
  indrive: "inDRIVE",
};

export function formatBRL(value: number): string {
  return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatKm(value: number): string {
  return `${value.toLocaleString("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  })} km`;
}
