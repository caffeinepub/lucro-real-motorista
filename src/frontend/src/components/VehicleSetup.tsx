import { ChevronRight, Flame, Zap } from "lucide-react";
import { useState } from "react";
import { type VehicleConfig, type VehicleType, formatBRL } from "../types";

interface Props {
  initialConfig: VehicleConfig | null;
  onComplete: (config: VehicleConfig) => void;
}

export default function VehicleSetup({ initialConfig, onComplete }: Props) {
  const [vehicleType, setVehicleType] = useState<VehicleType>(
    initialConfig?.type ?? "combustao",
  );
  const [energyPrice, setEnergyPrice] = useState(
    initialConfig?.energyPrice?.toString() ?? "",
  );
  const [consumption, setConsumption] = useState(
    initialConfig?.consumption?.toString() ?? "",
  );

  const costPerKm =
    energyPrice && consumption && Number.parseFloat(consumption) > 0
      ? Number.parseFloat(energyPrice.replace(",", ".")) /
        Number.parseFloat(consumption.replace(",", "."))
      : null;

  const handleSubmit = () => {
    const ep = Number.parseFloat(energyPrice.replace(",", "."));
    const con = Number.parseFloat(consumption.replace(",", "."));
    if (!ep || !con || con <= 0) return;
    const config: VehicleConfig = {
      type: vehicleType,
      energyPrice: ep,
      consumption: con,
      costPerKm: ep / con,
    };
    onComplete(config);
  };

  const isValid =
    energyPrice &&
    consumption &&
    Number.parseFloat(consumption.replace(",", ".")) > 0 &&
    Number.parseFloat(energyPrice.replace(",", ".")) > 0;

  const energyLabel =
    vehicleType === "combustao" ? "Preço por Litro (R$)" : "Preço por kWh (R$)";
  const consumptionLabel =
    vehicleType === "combustao"
      ? "Consumo Médio (km/L)"
      : "Consumo Médio (km/kWh)";
  const consumptionUnit = vehicleType === "combustao" ? "km/L" : "km/kWh";

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header className="px-5 pt-12 pb-6">
        <div className="flex items-center gap-2 mb-1">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: "oklch(0.91 0.22 125)" }}
          >
            <span
              className="text-sm font-bold"
              style={{ color: "oklch(0.14 0.04 125)" }}
            >
              L
            </span>
          </div>
          <span
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: "oklch(0.68 0.025 225)" }}
          >
            Lucro Real Motorista
          </span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mt-4">
          Configurar Veículo
        </h1>
        <p className="text-sm mt-1" style={{ color: "oklch(0.68 0.025 225)" }}>
          Informe os dados do seu veículo para calcular o custo por km.
        </p>
      </header>

      <main className="flex-1 px-5 pb-8 flex flex-col gap-5">
        {/* Vehicle type toggle */}
        <div
          className="p-1 rounded-2xl flex gap-1"
          style={{ background: "oklch(0.12 0.018 240)" }}
          data-ocid="vehicle.toggle"
        >
          <button
            type="button"
            onClick={() => setVehicleType("combustao")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background:
                vehicleType === "combustao"
                  ? "oklch(0.72 0.18 55)"
                  : "transparent",
              color:
                vehicleType === "combustao"
                  ? "oklch(0.10 0.01 55)"
                  : "oklch(0.68 0.025 225)",
            }}
            data-ocid="vehicle.combustao.toggle"
          >
            <Flame size={16} />
            Combustão
          </button>
          <button
            type="button"
            onClick={() => setVehicleType("eletrico")}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all duration-200"
            style={{
              background:
                vehicleType === "eletrico"
                  ? "oklch(0.91 0.22 125)"
                  : "transparent",
              color:
                vehicleType === "eletrico"
                  ? "oklch(0.14 0.04 125)"
                  : "oklch(0.68 0.025 225)",
            }}
            data-ocid="vehicle.eletrico.toggle"
          >
            <Zap size={16} />
            Elétrico
          </button>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="energy-price"
              className="text-sm font-medium"
              style={{ color: "oklch(0.68 0.025 225)" }}
            >
              {energyLabel}
            </label>
            <div
              className="flex items-center gap-3 px-4 rounded-xl border"
              style={{
                background: "oklch(0.12 0.018 240)",
                borderColor: "oklch(0.24 0.025 245)",
                height: "52px",
              }}
            >
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                R$
              </span>
              <input
                id="energy-price"
                type="number"
                inputMode="decimal"
                value={energyPrice}
                onChange={(e) => setEnergyPrice(e.target.value)}
                placeholder="0,00"
                className="flex-1 bg-transparent text-foreground text-base outline-none placeholder:text-muted-foreground"
                style={{ fontSize: "16px" }}
                data-ocid="vehicle.energy_price.input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="consumption"
              className="text-sm font-medium"
              style={{ color: "oklch(0.68 0.025 225)" }}
            >
              {consumptionLabel}
            </label>
            <div
              className="flex items-center gap-3 px-4 rounded-xl border"
              style={{
                background: "oklch(0.12 0.018 240)",
                borderColor: "oklch(0.24 0.025 245)",
                height: "52px",
              }}
            >
              <input
                id="consumption"
                type="number"
                inputMode="decimal"
                value={consumption}
                onChange={(e) => setConsumption(e.target.value)}
                placeholder="0,0"
                className="flex-1 bg-transparent text-foreground text-base outline-none placeholder:text-muted-foreground"
                style={{ fontSize: "16px" }}
                data-ocid="vehicle.consumption.input"
              />
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                {consumptionUnit}
              </span>
            </div>
          </div>
        </div>

        {/* Cost preview */}
        <div
          className="rounded-xl px-4 py-3 border flex items-center justify-between"
          style={{
            background: "oklch(0.16 0.022 242)",
            borderColor: costPerKm
              ? "oklch(0.91 0.22 125 / 0.3)"
              : "oklch(0.24 0.025 245)",
          }}
        >
          <span className="text-sm" style={{ color: "oklch(0.68 0.025 225)" }}>
            Custo por km:
          </span>
          <span
            className="text-base font-bold"
            style={{
              color: costPerKm
                ? "oklch(0.91 0.22 125)"
                : "oklch(0.68 0.025 225)",
            }}
          >
            {costPerKm !== null ? formatBRL(costPerKm) : "R$ —"}
          </span>
        </div>

        <div className="flex-1" />

        {/* CTA */}
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid}
          className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          style={{
            background: isValid
              ? "oklch(0.91 0.22 125)"
              : "oklch(0.19 0.026 245)",
            color: isValid ? "oklch(0.14 0.04 125)" : "oklch(0.45 0.02 240)",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
          data-ocid="vehicle.submit_button"
        >
          Começar a Rodar
          <ChevronRight size={18} />
        </button>
      </main>
    </div>
  );
}
