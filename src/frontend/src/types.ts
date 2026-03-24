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
  duration?: number; // seconds
  startTime?: number; // ms timestamp
  endTime?: number; // ms timestamp
}

export type Screen = "setup" | "ride" | "summary" | "charts";

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

// Hex colors for Recharts (canvas cannot use CSS vars)
export const PLATFORM_HEX: Record<Platform, string> = {
  uber: "#1a73e8",
  "99": "#ffd600",
  indrive: "#f39c12",
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

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}
