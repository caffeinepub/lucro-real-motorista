import { ArrowLeft, RotateCcw } from "lucide-react";
import { PLATFORM_LABELS, type Platform, type Ride, formatBRL } from "../types";

interface Props {
  rides: Ride[];
  onFinishDay: () => void;
  onBack: () => void;
}

const PLATFORM_ACCENT: Record<Platform, string> = {
  uber: "oklch(0.85 0.01 0)",
  "99": "oklch(0.65 0.22 25)",
  indrive: "oklch(0.72 0.18 145)",
};

interface PlatformStats {
  platform: Platform;
  count: number;
  gross: number;
  fees: number;
  cost: number;
  net: number;
}

const STATS_ITEMS = [
  { key: "gross", label: "Receita Bruta", color: "oklch(0.94 0.01 240)" },
  { key: "fees", label: "Taxas Pagas", color: "oklch(0.65 0.22 22)" },
  { key: "cost", label: "Custo Veículo", color: "oklch(0.72 0.18 55)" },
] as const;

export default function DaySummary({ rides, onFinishDay, onBack }: Props) {
  const totalGross = rides.reduce((s, r) => s + r.grossValue, 0);
  const totalFees = rides.reduce((s, r) => s + r.platformFee, 0);
  const totalCost = rides.reduce((s, r) => s + r.rideCost, 0);
  const totalNet = rides.reduce((s, r) => s + r.netProfit, 0);

  const platforms: Platform[] = ["uber", "99", "indrive"];

  const platformStats: PlatformStats[] = platforms
    .map((p) => {
      const pRides = rides.filter((r) => r.platform === p);
      return {
        platform: p,
        count: pRides.length,
        gross: pRides.reduce((s, r) => s + r.grossValue, 0),
        fees: pRides.reduce((s, r) => s + r.platformFee, 0),
        cost: pRides.reduce((s, r) => s + r.rideCost, 0),
        net: pRides.reduce((s, r) => s + r.netProfit, 0),
      };
    })
    .filter((s) => s.count > 0);

  const bestPlatform =
    platformStats.length > 0
      ? platformStats.reduce((best, cur) => (cur.net > best.net ? cur : best))
      : null;

  const maxBarNet =
    platformStats.length > 0
      ? Math.max(...platformStats.map((s) => Math.max(s.net, 0)))
      : 0;

  const statsValues: Record<string, string> = {
    gross: formatBRL(totalGross),
    fees: formatBRL(totalFees),
    cost: formatBRL(totalCost),
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Header */}
      <header
        className="px-5 pt-10 pb-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid oklch(0.24 0.025 245)" }}
      >
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
          style={{ background: "oklch(0.19 0.026 245)" }}
          data-ocid="summary.back.button"
          aria-label="Voltar"
        >
          <ArrowLeft size={16} style={{ color: "oklch(0.68 0.025 225)" }} />
        </button>
        <h1 className="text-xl font-bold text-foreground">Resumo do Dia</h1>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-36 pt-5">
        {rides.length === 0 ? (
          <div
            className="rounded-xl p-8 border text-center mt-4"
            style={{
              background: "oklch(0.16 0.022 242)",
              borderColor: "oklch(0.24 0.025 245)",
            }}
            data-ocid="summary.empty_state"
          >
            <div className="text-3xl mb-3">📊</div>
            <div className="text-base font-semibold text-foreground mb-1">
              Sem dados ainda
            </div>
            <div className="text-sm" style={{ color: "oklch(0.68 0.025 225)" }}>
              Adicione corridas para ver o resumo financeiro.
            </div>
          </div>
        ) : (
          <>
            {/* Hero net profit */}
            <div
              className="rounded-2xl p-6 mb-5 border text-center"
              style={{
                background: "oklch(0.16 0.022 242)",
                borderColor: "oklch(0.91 0.22 125 / 0.3)",
                boxShadow: "0 0 24px oklch(0.91 0.22 125 / 0.1)",
              }}
              data-ocid="summary.net_profit.card"
            >
              <div
                className="text-sm uppercase tracking-widest font-semibold mb-2"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                Lucro Líquido Real
              </div>
              <div
                className="font-bold mb-1"
                style={{
                  fontSize: "clamp(2rem, 8vw, 2.75rem)",
                  color:
                    totalNet >= 0
                      ? "oklch(0.91 0.22 125)"
                      : "oklch(0.65 0.22 22)",
                  lineHeight: 1.1,
                }}
              >
                {formatBRL(totalNet)}
              </div>
              <div
                className="text-sm"
                style={{ color: "oklch(0.68 0.025 225)" }}
              >
                {rides.length} corrida{rides.length !== 1 ? "s" : ""} registrada
                {rides.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* Stats row */}
            <div
              className="grid grid-cols-3 gap-3 mb-5"
              data-ocid="summary.stats.row"
            >
              {STATS_ITEMS.map((stat) => (
                <div
                  key={stat.key}
                  className="rounded-xl p-3 border text-center"
                  style={{
                    background: "oklch(0.16 0.022 242)",
                    borderColor: "oklch(0.24 0.025 245)",
                  }}
                >
                  <div
                    className="text-xs mb-1"
                    style={{ color: "oklch(0.68 0.025 225)" }}
                  >
                    {stat.label}
                  </div>
                  <div
                    className="text-sm font-bold"
                    style={{ color: stat.color }}
                  >
                    {statsValues[stat.key]}
                  </div>
                </div>
              ))}
            </div>

            {/* Bar chart */}
            {platformStats.length > 0 && (
              <div
                className="rounded-xl p-4 mb-5 border"
                style={{
                  background: "oklch(0.16 0.022 242)",
                  borderColor: "oklch(0.24 0.025 245)",
                }}
                data-ocid="summary.chart.panel"
              >
                <div className="text-sm font-semibold text-foreground mb-4">
                  Lucro por Plataforma
                </div>
                <div className="flex flex-col gap-3">
                  {platformStats.map((stat) => {
                    const isBest = bestPlatform?.platform === stat.platform;
                    const barWidth =
                      maxBarNet > 0
                        ? Math.max((stat.net / maxBarNet) * 100, 4)
                        : 4;
                    return (
                      <div
                        key={stat.platform}
                        data-ocid={`summary.chart.${stat.platform}.row`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <div
                              className="w-5 h-5 rounded text-xs font-black flex items-center justify-center"
                              style={{
                                background: PLATFORM_ACCENT[stat.platform],
                                color:
                                  stat.platform === "uber"
                                    ? "oklch(0.10 0 0)"
                                    : "oklch(0.98 0 0)",
                              }}
                            >
                              {stat.platform === "uber"
                                ? "U"
                                : stat.platform === "99"
                                  ? "9"
                                  : "i"}
                            </div>
                            <span className="text-sm font-medium text-foreground">
                              {PLATFORM_LABELS[stat.platform]}
                            </span>
                            {isBest && (
                              <span
                                className="text-xs px-1.5 py-0.5 rounded-full font-semibold"
                                style={{
                                  background: "oklch(0.91 0.22 125 / 0.15)",
                                  color: "oklch(0.91 0.22 125)",
                                }}
                              >
                                melhor
                              </span>
                            )}
                          </div>
                          <span
                            className="text-sm font-bold"
                            style={{
                              color: isBest
                                ? "oklch(0.91 0.22 125)"
                                : "oklch(0.94 0.01 240)",
                            }}
                          >
                            {formatBRL(stat.net)}
                          </span>
                        </div>
                        <div
                          className="w-full rounded-full overflow-hidden"
                          style={{
                            background: "oklch(0.12 0.018 240)",
                            height: "6px",
                          }}
                        >
                          <div
                            className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${barWidth}%`,
                              background: isBest
                                ? "oklch(0.91 0.22 125)"
                                : PLATFORM_ACCENT[stat.platform],
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Breakdown table */}
            <div
              className="rounded-xl border overflow-hidden mb-5"
              style={{ borderColor: "oklch(0.24 0.025 245)" }}
              data-ocid="summary.breakdown.table"
            >
              <div
                className="px-4 py-3 text-sm font-semibold text-foreground"
                style={{ background: "oklch(0.19 0.026 245)" }}
              >
                Detalhamento por Plataforma
              </div>
              {platformStats.map((stat, i) => {
                const isBest = bestPlatform?.platform === stat.platform;
                return (
                  <div
                    key={stat.platform}
                    className="px-4 py-3"
                    style={{
                      background: isBest
                        ? "oklch(0.91 0.22 125 / 0.06)"
                        : i % 2 === 0
                          ? "oklch(0.16 0.022 242)"
                          : "oklch(0.14 0.02 242)",
                      borderTop:
                        i > 0 ? "1px solid oklch(0.24 0.025 245)" : undefined,
                    }}
                    data-ocid={`summary.breakdown.item.${i + 1}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="text-sm font-bold"
                          style={{
                            color: isBest
                              ? "oklch(0.91 0.22 125)"
                              : "oklch(0.94 0.01 240)",
                          }}
                        >
                          {PLATFORM_LABELS[stat.platform]}
                        </span>
                        <span
                          className="text-xs"
                          style={{ color: "oklch(0.68 0.025 225)" }}
                        >
                          {stat.count} corrida{stat.count !== 1 ? "s" : ""}
                        </span>
                      </div>
                      <span
                        className="text-sm font-bold"
                        style={{
                          color: isBest
                            ? "oklch(0.91 0.22 125)"
                            : stat.net >= 0
                              ? "oklch(0.94 0.01 240)"
                              : "oklch(0.65 0.22 22)",
                        }}
                      >
                        {formatBRL(stat.net)}
                      </span>
                    </div>
                    <div className="flex gap-4">
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.68 0.025 225)" }}
                        >
                          Bruto
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          {formatBRL(stat.gross)}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.68 0.025 225)" }}
                        >
                          Taxas
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          - {formatBRL(stat.fees)}
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-xs"
                          style={{ color: "oklch(0.68 0.025 225)" }}
                        >
                          Custo
                        </div>
                        <div className="text-xs font-medium text-foreground">
                          - {formatBRL(stat.cost)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </main>

      {/* Bottom actions */}
      <div
        className="fixed bottom-0 left-0 right-0 px-5 pb-8 pt-4 flex flex-col gap-3"
        style={{
          background:
            "linear-gradient(to top, oklch(0.10 0.015 240) 70%, transparent)",
        }}
      >
        <button
          type="button"
          onClick={onFinishDay}
          className="w-full py-4 rounded-xl text-base font-bold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95"
          style={{
            background: "oklch(0.55 0.2 22)",
            color: "oklch(0.98 0 0)",
          }}
          data-ocid="summary.finish_day.button"
        >
          <RotateCcw size={16} />
          Finalizar Expediente e Zerar
        </button>
        <button
          type="button"
          onClick={onBack}
          className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 active:scale-95 border"
          style={{
            background: "transparent",
            borderColor: "oklch(0.24 0.025 245)",
            color: "oklch(0.68 0.025 225)",
          }}
          data-ocid="summary.back.secondary_button"
        >
          <ArrowLeft size={14} />
          Voltar ao Registro
        </button>
      </div>

      {/* Footer */}
      <div
        className="pb-2 pt-1 text-center"
        style={{ color: "oklch(0.45 0.02 240)", fontSize: "11px" }}
      >
        © {new Date().getFullYear()}. Feito com ❤️ usando{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.91 0.22 125)" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
