import {
  BarChart2,
  ChevronRight,
  Clock,
  Plus,
  Settings,
  Square,
  Timer,
  TrendingUp,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  PLATFORM_LABELS,
  PLATFORM_RATES,
  type Platform,
  type Ride,
  type VehicleConfig,
  formatBRL,
  formatDuration,
  formatKm,
} from "../types";

interface Props {
  vehicleConfig: VehicleConfig;
  rides: Ride[];
  onAddRide: (ride: Ride) => void;
  onGoToSetup: () => void;
  onGoToSummary: () => void;
  onGoToCharts: () => void;
}

const PLATFORM_BG: Record<Platform, string> = {
  uber: "#1a73e8",
  "99": "#ffd600",
  indrive: "#f39c12",
};

const PLATFORM_TEXT: Record<Platform, string> = {
  uber: "#ffffff",
  "99": "#1a1a00",
  indrive: "#1a0e00",
};

export default function RideEntry({
  vehicleConfig,
  rides,
  onAddRide,
  onGoToSetup,
  onGoToSummary,
  onGoToCharts,
}: Props) {
  const [grossValue, setGrossValue] = useState("");
  const [km, setKm] = useState("");
  const [platform, setPlatform] = useState<Platform | null>(null);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [rideStartTime, setRideStartTime] = useState<number | null>(null);
  const [rideEndTime, setRideEndTime] = useState<number | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleStartRide = () => {
    const now = Date.now();
    setRideStartTime(now);
    setRideEndTime(null);
    setElapsed(0);
    setIsRunning(true);
  };

  const handleStopRide = () => {
    setIsRunning(false);
    setRideEndTime(Date.now());
  };

  const resetTimer = () => {
    setIsRunning(false);
    setElapsed(0);
    setRideStartTime(null);
    setRideEndTime(null);
  };

  const totalGross = rides.reduce((s, r) => s + r.grossValue, 0);
  const totalNetProfit = rides.reduce((sum, r) => sum + r.netProfit, 0);
  const totalKm = rides.reduce((s, r) => s + r.km, 0);

  const preview = (() => {
    const g = Number.parseFloat(grossValue.replace(",", "."));
    const k = Number.parseFloat(km.replace(",", "."));
    if (!g || !k || !platform) return null;
    const fee = g * PLATFORM_RATES[platform];
    const cost = k * vehicleConfig.costPerKm;
    const net = g - fee - cost;
    return { fee, cost, net };
  })();

  const isValid =
    grossValue &&
    km &&
    platform &&
    Number.parseFloat(grossValue.replace(",", ".")) > 0 &&
    Number.parseFloat(km.replace(",", ".")) > 0;

  const handleAdd = () => {
    if (!isValid || !platform) return;
    const g = Number.parseFloat(grossValue.replace(",", "."));
    const k = Number.parseFloat(km.replace(",", "."));
    const fee = g * PLATFORM_RATES[platform];
    const cost = k * vehicleConfig.costPerKm;
    const net = g - fee - cost;
    const ride: Ride = {
      id: Date.now().toString(),
      platform,
      grossValue: g,
      km: k,
      platformFee: fee,
      rideCost: cost,
      netProfit: net,
      timestamp: Date.now(),
      duration: rideEndTime ? elapsed : undefined,
      startTime: rideStartTime ?? undefined,
      endTime: rideEndTime ?? undefined,
    };
    onAddRide(ride);
    setGrossValue("");
    setKm("");
    setPlatform(null);
    resetTimer();
    toast.success(`Corrida adicionada! Lucro: ${formatBRL(net)}`);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top bar */}
      <header
        className="px-5 pt-10 pb-4 flex items-center justify-between"
        style={{ borderBottom: "1px solid oklch(0.24 0.025 245)" }}
      >
        <button
          type="button"
          onClick={onGoToSetup}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: "oklch(0.19 0.026 245)" }}
          data-ocid="ride.settings.button"
          aria-label="Configurações"
        >
          <Settings size={16} style={{ color: "oklch(0.68 0.025 225)" }} />
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onGoToCharts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: "oklch(0.16 0.022 242)" }}
            data-ocid="ride.charts.button"
          >
            <BarChart2 size={14} style={{ color: "#1a73e8" }} />
            <span
              className="text-xs font-semibold"
              style={{ color: "oklch(0.68 0.025 225)" }}
            >
              Gráficos
            </span>
          </button>

          <button
            type="button"
            onClick={onGoToSummary}
            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all active:scale-95"
            style={{ background: "oklch(0.16 0.022 242)" }}
            data-ocid="ride.summary.button"
          >
            <TrendingUp size={14} style={{ color: "oklch(0.91 0.22 125)" }} />
            <div className="text-right">
              <div
                className="text-xs"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                Lucro do Dia
              </div>
              <div
                className="text-sm font-bold"
                style={{
                  color:
                    rides.length > 0
                      ? "oklch(0.91 0.22 125)"
                      : "oklch(0.68 0.025 225)",
                }}
              >
                {formatBRL(totalNetProfit)}
              </div>
            </div>
            <ChevronRight
              size={14}
              style={{ color: "oklch(0.68 0.025 225)" }}
            />
          </button>
        </div>
      </header>

      {/* Mini dashboard */}
      {rides.length > 0 && (
        <div
          className="mx-5 mt-4 rounded-2xl p-4 border"
          style={{
            background: "oklch(0.13 0.02 242)",
            borderColor: "oklch(0.24 0.025 245)",
          }}
          data-ocid="ride.dashboard.panel"
        >
          <div
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "oklch(0.50 0.02 240)" }}
          >
            Painel do Dia
          </div>
          <div className="grid grid-cols-4 gap-2">
            {[
              {
                label: "Corridas",
                value: String(rides.length),
                isProfit: false,
              },
              { label: "Bruto", value: formatBRL(totalGross), isProfit: false },
              { label: "Km Total", value: formatKm(totalKm), isProfit: false },
              {
                label: "Líquido",
                value: formatBRL(totalNetProfit),
                isProfit: true,
              },
            ].map((item) => (
              <div key={item.label} className="text-center">
                <div
                  className="text-xs mb-1"
                  style={{ color: "oklch(0.68 0.025 225)" }}
                >
                  {item.label}
                </div>
                <div
                  className="text-base font-bold"
                  style={{
                    color: item.isProfit
                      ? totalNetProfit >= 0
                        ? "oklch(0.91 0.22 125)"
                        : "oklch(0.65 0.22 22)"
                      : "oklch(0.94 0.01 240)",
                  }}
                >
                  {item.value}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <main className="flex-1 overflow-y-auto px-5 pb-32">
        <h2 className="text-xl font-bold text-foreground mt-5 mb-5">
          Registrar Corrida
        </h2>

        {/* Timer */}
        <div
          className="rounded-xl p-4 mb-5 border"
          style={{
            background: "oklch(0.13 0.02 242)",
            borderColor: isRunning
              ? "oklch(0.91 0.22 125 / 0.4)"
              : "oklch(0.24 0.025 245)",
            boxShadow: isRunning
              ? "0 0 16px oklch(0.91 0.22 125 / 0.12)"
              : "none",
          }}
          data-ocid="ride.timer.panel"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer
                size={16}
                style={{
                  color: isRunning
                    ? "oklch(0.91 0.22 125)"
                    : "oklch(0.68 0.025 225)",
                }}
              />
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                Cronômetro
              </span>
            </div>
            <div
              className="font-mono text-2xl font-bold tracking-widest"
              style={{
                color: isRunning
                  ? "oklch(0.91 0.22 125)"
                  : rideEndTime
                    ? "oklch(0.94 0.01 240)"
                    : "oklch(0.45 0.02 240)",
              }}
            >
              {formatDuration(elapsed)}
            </div>
          </div>
          <div className="flex gap-2 mt-3">
            {!isRunning && !rideEndTime && (
              <button
                type="button"
                onClick={handleStartRide}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: "oklch(0.91 0.22 125)",
                  color: "oklch(0.14 0.04 125)",
                }}
                data-ocid="ride.timer_start.button"
              >
                <Clock size={14} />
                Iniciar Corrida
              </button>
            )}
            {isRunning && (
              <button
                type="button"
                onClick={handleStopRide}
                className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-all active:scale-95"
                style={{
                  background: "oklch(0.55 0.2 22)",
                  color: "oklch(0.98 0 0)",
                }}
                data-ocid="ride.timer_stop.button"
              >
                <Square size={14} />
                Finalizar Corrida
              </button>
            )}
            {!isRunning && rideEndTime && (
              <>
                <div
                  className="flex-1 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2"
                  style={{
                    background: "oklch(0.91 0.22 125 / 0.12)",
                    color: "oklch(0.91 0.22 125)",
                  }}
                >
                  <Clock size={14} />
                  {formatDuration(elapsed)} registrado
                </div>
                <button
                  type="button"
                  onClick={resetTimer}
                  className="px-4 py-2.5 rounded-lg text-sm font-semibold transition-all active:scale-95"
                  style={{
                    background: "oklch(0.19 0.026 245)",
                    color: "oklch(0.68 0.025 225)",
                  }}
                  data-ocid="ride.timer_reset.button"
                >
                  Reset
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inputs */}
        <div className="flex flex-col gap-4 mb-5">
          <div className="flex flex-col gap-2">
            <label
              htmlFor="gross-value"
              className="text-sm font-medium"
              style={{ color: "oklch(0.68 0.025 225)" }}
            >
              Valor Bruto da Corrida
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
                id="gross-value"
                type="number"
                inputMode="decimal"
                value={grossValue}
                onChange={(e) => setGrossValue(e.target.value)}
                placeholder="0,00"
                className="flex-1 bg-transparent text-foreground text-base outline-none placeholder:text-muted-foreground"
                style={{ fontSize: "16px" }}
                data-ocid="ride.gross_value.input"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label
              htmlFor="ride-km"
              className="text-sm font-medium"
              style={{ color: "oklch(0.68 0.025 225)" }}
            >
              Quilometragem
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
                id="ride-km"
                type="number"
                inputMode="decimal"
                value={km}
                onChange={(e) => setKm(e.target.value)}
                placeholder="0,0"
                className="flex-1 bg-transparent text-foreground text-base outline-none placeholder:text-muted-foreground"
                style={{ fontSize: "16px" }}
                data-ocid="ride.km.input"
              />
              <span
                className="text-sm font-medium"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                km
              </span>
            </div>
          </div>
        </div>

        {/* Platform selector */}
        <div className="mb-5">
          <p
            className="text-sm font-medium mb-3"
            style={{ color: "oklch(0.68 0.025 225)" }}
          >
            Plataforma
          </p>
          <div
            className="grid grid-cols-3 gap-3"
            data-ocid="ride.platform.select"
          >
            {(["uber", "99", "indrive"] as Platform[]).map((p) => {
              const isSelected = platform === p;
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  className="flex flex-col items-center justify-center py-4 rounded-xl border-2 transition-all duration-150 active:scale-95"
                  style={{
                    background: isSelected
                      ? `${PLATFORM_BG[p]}18`
                      : "oklch(0.13 0.02 240)",
                    borderColor: isSelected
                      ? PLATFORM_BG[p]
                      : "oklch(0.24 0.025 245)",
                    boxShadow: isSelected
                      ? `0 0 16px ${PLATFORM_BG[p]}44`
                      : "none",
                  }}
                  data-ocid={`ride.platform.${p}.button`}
                >
                  <div
                    className="w-8 h-8 rounded-lg mb-2 flex items-center justify-center text-xs font-black"
                    style={{
                      background: PLATFORM_BG[p],
                      color: PLATFORM_TEXT[p],
                    }}
                  >
                    {p === "uber" ? "U" : p === "99" ? "99" : "iD"}
                  </div>
                  <span
                    className="text-xs font-bold"
                    style={{
                      color: isSelected
                        ? PLATFORM_BG[p]
                        : "oklch(0.68 0.025 225)",
                    }}
                  >
                    {PLATFORM_LABELS[p]}
                  </span>
                  <span
                    className="text-xs mt-0.5"
                    style={{ color: "oklch(0.50 0.02 240)" }}
                  >
                    {Math.round(PLATFORM_RATES[p] * 100)}%
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Live preview */}
        {preview && (
          <div
            className="rounded-xl p-4 mb-5 border slide-up"
            style={{
              background: "oklch(0.16 0.022 242)",
              borderColor: "oklch(0.91 0.22 125 / 0.25)",
            }}
          >
            <div
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "oklch(0.68 0.025 225)" }}
            >
              Prévia da Corrida
            </div>
            <div className="flex justify-between items-center mb-2">
              <span
                className="text-sm"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                Taxa da plataforma
              </span>
              <span className="text-sm font-medium text-foreground">
                - {formatBRL(preview.fee)}
              </span>
            </div>
            <div className="flex justify-between items-center mb-3">
              <span
                className="text-sm"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                Custo do veículo
              </span>
              <span className="text-sm font-medium text-foreground">
                - {formatBRL(preview.cost)}
              </span>
            </div>
            <div
              className="flex justify-between items-center pt-3"
              style={{ borderTop: "1px solid oklch(0.24 0.025 245)" }}
            >
              <span className="text-sm font-semibold text-foreground">
                Lucro Líquido
              </span>
              <span
                className="text-lg font-bold"
                style={{
                  color:
                    preview.net >= 0
                      ? "oklch(0.91 0.22 125)"
                      : "oklch(0.65 0.22 22)",
                }}
              >
                {formatBRL(preview.net)}
              </span>
            </div>
          </div>
        )}

        {/* Add button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={!isValid}
          className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 mb-6"
          style={{
            background: isValid
              ? "oklch(0.91 0.22 125)"
              : "oklch(0.19 0.026 245)",
            color: isValid ? "oklch(0.14 0.04 125)" : "oklch(0.45 0.02 240)",
            cursor: isValid ? "pointer" : "not-allowed",
          }}
          data-ocid="ride.add.primary_button"
        >
          <Plus size={18} />
          Adicionar ao Dia
        </button>

        {/* Rides list */}
        {rides.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-foreground">
                Corridas de Hoje ({rides.length})
              </h3>
              <span
                className="text-xs"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                {formatBRL(totalNetProfit)} líquido
              </span>
            </div>
            <div className="flex flex-col gap-3" data-ocid="ride.list">
              {[...rides].reverse().map((ride, i) => (
                <div
                  key={ride.id}
                  className="rounded-xl p-4 border"
                  style={{
                    background: "oklch(0.16 0.022 242)",
                    borderColor: "oklch(0.24 0.025 245)",
                  }}
                  data-ocid={`ride.item.${rides.length - i}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                        style={{
                          background: PLATFORM_BG[ride.platform],
                          color: PLATFORM_TEXT[ride.platform],
                        }}
                      >
                        {ride.platform === "uber"
                          ? "U"
                          : ride.platform === "99"
                            ? "99"
                            : "iD"}
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {PLATFORM_LABELS[ride.platform]}
                      </span>
                      <span
                        className="text-xs"
                        style={{ color: "oklch(0.68 0.025 225)" }}
                      >
                        {formatKm(ride.km)}
                      </span>
                      {ride.duration && (
                        <span
                          className="text-xs flex items-center gap-0.5"
                          style={{ color: "oklch(0.55 0.18 250)" }}
                        >
                          <Clock size={10} />
                          {formatDuration(ride.duration)}
                        </span>
                      )}
                    </div>
                    <span
                      className="text-base font-bold"
                      style={{
                        color:
                          ride.netProfit >= 0
                            ? "oklch(0.91 0.22 125)"
                            : "oklch(0.65 0.22 22)",
                      }}
                    >
                      {formatBRL(ride.netProfit)}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    {[
                      { label: "Bruto", value: formatBRL(ride.grossValue) },
                      {
                        label: "Taxa",
                        value: `- ${formatBRL(ride.platformFee)}`,
                      },
                      {
                        label: "Custo",
                        value: `- ${formatBRL(ride.rideCost)}`,
                      },
                    ].map((item) => (
                      <div key={item.label}>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.68 0.025 225)" }}
                        >
                          {item.label}
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          {item.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {rides.length === 0 && (
          <div
            className="rounded-xl p-8 border text-center"
            style={{
              background: "oklch(0.16 0.022 242)",
              borderColor: "oklch(0.24 0.025 245)",
            }}
            data-ocid="ride.empty_state"
          >
            <div className="text-2xl mb-2">🚗</div>
            <div className="text-sm font-medium text-foreground mb-1">
              Nenhuma corrida ainda
            </div>
            <div className="text-xs" style={{ color: "oklch(0.68 0.025 225)" }}>
              Adicione sua primeira corrida acima.
            </div>
          </div>
        )}
      </main>

      {/* Bottom summary button */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4"
        style={{
          background:
            "linear-gradient(to top, oklch(0.10 0.015 240) 70%, transparent)",
        }}
      >
        <button
          type="button"
          onClick={onGoToSummary}
          className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 border"
          style={{
            background: "oklch(0.16 0.022 242)",
            borderColor: "oklch(0.91 0.22 125 / 0.35)",
            color: "oklch(0.91 0.22 125)",
          }}
          data-ocid="ride.view_summary.button"
        >
          <TrendingUp size={18} />
          Ver Resumo do Dia
        </button>
      </div>
    </div>
  );
}
