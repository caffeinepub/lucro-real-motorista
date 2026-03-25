import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Award, BarChart2, TrendingUp, Zap } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  PLATFORM_HEX,
  PLATFORM_LABELS,
  PLATFORM_RATES,
  type Platform,
  type Ride,
  formatBRL,
} from "../types";

interface Props {
  allHistory: Ride[];
  onBack?: () => void;
}

type BarEntry = { xKey: string; uber: number; "99": number; indrive: number };

const PLATFORMS: Platform[] = ["uber", "99", "indrive"];

const TOOLTIP_STYLE = {
  background: "#0f1319",
  border: "1px solid #2a2f3a",
  borderRadius: "8px",
  fontSize: "12px",
  color: "#e0e4ee",
};

const AXIS_TICK = { fontSize: 10, fill: "#6b7a99" };

function isSameDay(ts: number, now: Date) {
  const d = new Date(ts);
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function isSameMonth(ts: number, now: Date) {
  const d = new Date(ts);
  return (
    d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  );
}

function isSameYear(ts: number, now: Date) {
  const d = new Date(ts);
  return d.getFullYear() === now.getFullYear();
}

function buildHourlyData(rides: Ride[]): BarEntry[] {
  const map: Record<number, Record<Platform, number>> = {};
  for (const r of rides) {
    const h = new Date(r.timestamp).getHours();
    if (!map[h]) map[h] = { uber: 0, "99": 0, indrive: 0 };
    map[h][r.platform] += r.netProfit;
  }
  return Object.keys(map)
    .map(Number)
    .sort((a, b) => a - b)
    .map((h) => ({
      xKey: `${String(h).padStart(2, "0")}h`,
      uber: Number(map[h].uber.toFixed(2)),
      "99": Number(map[h]["99"].toFixed(2)),
      indrive: Number(map[h].indrive.toFixed(2)),
    }));
}

function buildDailyData(rides: Ride[]): BarEntry[] {
  const map: Record<string, Record<Platform, number>> = {};
  for (const r of rides) {
    const d = new Date(r.timestamp);
    const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!map[key]) map[key] = { uber: 0, "99": 0, indrive: 0 };
    map[key][r.platform] += r.netProfit;
  }
  return Object.entries(map)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([day, vals]) => ({
      xKey: day,
      uber: Number(vals.uber.toFixed(2)),
      "99": Number(vals["99"].toFixed(2)),
      indrive: Number(vals.indrive.toFixed(2)),
    }));
}

function buildMonthlyData(rides: Ride[]): BarEntry[] {
  const map: Record<string, Record<Platform, number>> = {};
  const MONTHS = [
    "Jan",
    "Fev",
    "Mar",
    "Abr",
    "Mai",
    "Jun",
    "Jul",
    "Ago",
    "Set",
    "Out",
    "Nov",
    "Dez",
  ];
  for (const r of rides) {
    const d = new Date(r.timestamp);
    const key = MONTHS[d.getMonth()];
    if (!map[key]) map[key] = { uber: 0, "99": 0, indrive: 0 };
    map[key][r.platform] += r.netProfit;
  }
  return Object.entries(map).map(([mes, vals]) => ({
    xKey: mes,
    uber: Number(vals.uber.toFixed(2)),
    "99": Number(vals["99"].toFixed(2)),
    indrive: Number(vals.indrive.toFixed(2)),
  }));
}

function buildCumulativeData(rides: Ride[]) {
  const sorted = [...rides].sort((a, b) => a.timestamp - b.timestamp);
  let acc = 0;
  const seen: Record<string, boolean> = {};
  const result: { label: string; acumulado: number }[] = [];
  for (const r of sorted) {
    const d = new Date(r.timestamp);
    const key = `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
    acc += r.netProfit;
    if (!seen[key]) {
      seen[key] = true;
      result.push({ label: key, acumulado: Number(acc.toFixed(2)) });
    } else {
      const last = result.find((x) => x.label === key);
      if (last) last.acumulado = Number(acc.toFixed(2));
    }
  }
  return result;
}

function buildPieData(rides: Ride[]) {
  return PLATFORMS.map((p) => {
    const pRides = rides.filter((r) => r.platform === p);
    const net = pRides.reduce((s, r) => s + r.netProfit, 0);
    return {
      name: PLATFORM_LABELS[p],
      value: Number(net.toFixed(2)),
      color: PLATFORM_HEX[p],
      platform: p,
    };
  }).filter((d) => d.value > 0);
}

function StatCards({ rides }: { rides: Ride[] }) {
  const totalNet = rides.reduce((s, r) => s + r.netProfit, 0);
  const avgPerRide = rides.length > 0 ? totalNet / rides.length : 0;
  const bestPlatform = PLATFORMS.map((p) => ({
    p,
    net: rides
      .filter((r) => r.platform === p)
      .reduce((s, r) => s + r.netProfit, 0),
  })).sort((a, b) => b.net - a.net)[0];

  const cards = [
    {
      icon: <BarChart2 size={16} color="#1a73e8" />,
      label: "Total Corridas",
      value: String(rides.length),
      color: "#1a73e8",
    },
    {
      icon: <TrendingUp size={16} color="#4ade80" />,
      label: "Lucro Total",
      value: formatBRL(totalNet),
      color: totalNet >= 0 ? "oklch(0.91 0.22 125)" : "oklch(0.65 0.22 22)",
    },
    {
      icon: (
        <Award
          size={16}
          color={bestPlatform ? PLATFORM_HEX[bestPlatform.p] : "#888"}
        />
      ),
      label: "Melhor Plataforma",
      value:
        bestPlatform && bestPlatform.net > 0
          ? PLATFORM_LABELS[bestPlatform.p]
          : "—",
      color: bestPlatform ? PLATFORM_HEX[bestPlatform.p] : "#888",
    },
    {
      icon: <Zap size={16} color="#f39c12" />,
      label: "Média / Corrida",
      value: rides.length > 0 ? formatBRL(avgPerRide) : "—",
      color: "#f39c12",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-5" data-ocid="charts.stats.panel">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl p-4 border flex flex-col gap-2"
          style={{
            background: "oklch(0.16 0.022 242)",
            borderColor: "oklch(0.24 0.025 245)",
          }}
        >
          <div className="flex items-center gap-2">
            {card.icon}
            <span
              className="text-xs"
              style={{ color: "oklch(0.68 0.025 225)" }}
            >
              {card.label}
            </span>
          </div>
          <div className="text-base font-bold" style={{ color: card.color }}>
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlatformBreakdown({ rides }: { rides: Ride[] }) {
  if (rides.length === 0) return null;
  return (
    <div
      className="rounded-xl p-4 mb-5 border"
      style={{
        background: "oklch(0.16 0.022 242)",
        borderColor: "oklch(0.24 0.025 245)",
      }}
      data-ocid="charts.platform_breakdown.panel"
    >
      <div className="text-sm font-semibold text-foreground mb-4">
        Por Plataforma
      </div>
      <div className="flex flex-col gap-3">
        {PLATFORMS.map((p) => {
          const pRides = rides.filter((r) => r.platform === p);
          if (pRides.length === 0) return null;
          const gross = pRides.reduce((s, r) => s + r.grossValue, 0);
          const fees = pRides.reduce((s, r) => s + r.platformFee, 0);
          const net = pRides.reduce((s, r) => s + r.netProfit, 0);
          return (
            <div
              key={p}
              className="rounded-lg p-3 border"
              style={{
                background: `${PLATFORM_HEX[p]}0d`,
                borderColor: `${PLATFORM_HEX[p]}33`,
              }}
              data-ocid={`charts.platform.${p}.card`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div
                    className="w-6 h-6 rounded-md flex items-center justify-center text-xs font-black"
                    style={{
                      background: PLATFORM_HEX[p],
                      color:
                        p === "99"
                          ? "#1a1a00"
                          : p === "indrive"
                            ? "#1a0e00"
                            : "#fff",
                    }}
                  >
                    {p === "uber" ? "U" : p === "99" ? "99" : "iD"}
                  </div>
                  <span className="text-sm font-bold text-foreground">
                    {PLATFORM_LABELS[p]}
                  </span>
                  <span
                    className="text-xs"
                    style={{ color: "oklch(0.68 0.025 225)" }}
                  >
                    {pRides.length} corridas
                  </span>
                </div>
                <span
                  className="text-sm font-bold"
                  style={{ color: PLATFORM_HEX[p] }}
                >
                  {formatBRL(net)}
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
                    {formatBRL(gross)}
                  </div>
                </div>
                <div>
                  <div
                    className="text-xs"
                    style={{ color: "oklch(0.68 0.025 225)" }}
                  >
                    Taxa ({Math.round(PLATFORM_RATES[p] * 100)}%)
                  </div>
                  <div className="text-xs font-medium text-foreground">
                    - {formatBRL(fees)}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ChartsPanel({
  rides,
  barData,
  label,
}: { rides: Ride[]; barData: BarEntry[]; label: string }) {
  const pieData = buildPieData(rides);
  const cumulativeData = buildCumulativeData(rides);

  return (
    <div>
      <StatCards rides={rides} />
      <PlatformBreakdown rides={rides} />

      {barData.length > 0 && (
        <div
          className="rounded-xl p-4 mb-5 border"
          style={{
            background: "oklch(0.16 0.022 242)",
            borderColor: "oklch(0.24 0.025 245)",
          }}
          data-ocid="charts.bar.panel"
        >
          <div className="text-sm font-semibold text-foreground mb-4">
            Lucro por {label}
          </div>
          <div style={{ height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 4, right: 4, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2535"
                  vertical={false}
                />
                <XAxis
                  dataKey="xKey"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                  }
                />
                <Tooltip
                  formatter={(v: number, name: string) => [
                    formatBRL(v),
                    PLATFORM_LABELS[name as Platform] ?? name,
                  ]}
                  contentStyle={TOOLTIP_STYLE}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                />
                <Legend
                  formatter={(val: string) =>
                    PLATFORM_LABELS[val as Platform] ?? val
                  }
                  wrapperStyle={{ fontSize: "11px", color: "#6b7a99" }}
                />
                <Bar
                  dataKey="uber"
                  stackId="a"
                  fill={PLATFORM_HEX.uber}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="99"
                  stackId="a"
                  fill={PLATFORM_HEX["99"]}
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="indrive"
                  stackId="a"
                  fill={PLATFORM_HEX.indrive}
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {pieData.length > 0 && (
        <div
          className="rounded-xl p-4 mb-5 border"
          style={{
            background: "oklch(0.16 0.022 242)",
            borderColor: "oklch(0.24 0.025 245)",
          }}
          data-ocid="charts.pie.panel"
        >
          <div className="text-sm font-semibold text-foreground mb-4">
            Distribuição por Plataforma
          </div>
          <div className="flex items-center gap-4">
            <div style={{ width: 140, height: 140, flexShrink: 0 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={3}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.platform} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatBRL(v)}
                    contentStyle={TOOLTIP_STYLE}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-col gap-2 flex-1">
              {pieData.map((entry) => {
                const total = pieData.reduce((s, e) => s + e.value, 0);
                const pct =
                  total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0";
                return (
                  <div key={entry.platform} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ background: entry.color }}
                        />
                        <span
                          className="text-xs"
                          style={{ color: "oklch(0.68 0.025 225)" }}
                        >
                          {entry.name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-foreground">
                        {pct}%
                      </span>
                    </div>
                    <div
                      className="w-full rounded-full overflow-hidden"
                      style={{
                        background: "oklch(0.12 0.018 240)",
                        height: "4px",
                      }}
                    >
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${pct}%`, background: entry.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {cumulativeData.length > 1 && (
        <div
          className="rounded-xl p-4 mb-5 border"
          style={{
            background: "oklch(0.16 0.022 242)",
            borderColor: "oklch(0.24 0.025 245)",
          }}
          data-ocid="charts.line.panel"
        >
          <div className="text-sm font-semibold text-foreground mb-4">
            Lucro Acumulado
          </div>
          <div style={{ height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={cumulativeData}
                margin={{ top: 4, right: 8, left: -18, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="#1e2535"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v: number) =>
                    v >= 1000 ? `${(v / 1000).toFixed(1)}k` : String(v)
                  }
                />
                <Tooltip
                  formatter={(v: number) => [formatBRL(v), "Acumulado"]}
                  contentStyle={TOOLTIP_STYLE}
                />
                <Line
                  type="monotone"
                  dataKey="acumulado"
                  stroke="#4ade80"
                  strokeWidth={2}
                  dot={{ fill: "#4ade80", r: 3, strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ChartsScreen({ allHistory, onBack }: Props) {
  const now = new Date();

  const todayRides = allHistory.filter((r) => isSameDay(r.timestamp, now));
  const monthRides = allHistory.filter((r) => isSameMonth(r.timestamp, now));
  const yearRides = allHistory.filter((r) => isSameYear(r.timestamp, now));

  const todayBarData = buildHourlyData(todayRides);
  const monthBarData = buildDailyData(monthRides);
  const yearBarData = buildMonthlyData(yearRides);

  const isEmpty = allHistory.length === 0;

  const EmptyPeriod = ({ emoji, msg }: { emoji: string; msg: string }) => (
    <div
      className="rounded-xl p-6 border text-center"
      style={{
        background: "oklch(0.16 0.022 242)",
        borderColor: "oklch(0.24 0.025 245)",
      }}
    >
      <div className="text-2xl mb-2">{emoji}</div>
      <div className="text-sm font-medium text-foreground">{msg}</div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      <header
        className="px-5 pt-10 pb-4 flex items-center gap-3"
        style={{ borderBottom: "1px solid oklch(0.24 0.025 245)" }}
      >
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-opacity hover:opacity-70"
            style={{ background: "oklch(0.19 0.026 245)" }}
            data-ocid="charts.back.button"
            aria-label="Voltar"
          >
            <ArrowLeft size={16} style={{ color: "oklch(0.68 0.025 225)" }} />
          </button>
        )}
        <div className="flex items-center gap-2 flex-1">
          <BarChart2 size={18} color="#1a73e8" />
          <h1 className="text-xl font-bold text-foreground">Gráficos</h1>
        </div>
        <div
          className="text-xs px-2.5 py-1 rounded-full font-semibold"
          style={{
            background: "oklch(0.19 0.026 245)",
            color: "oklch(0.68 0.025 225)",
          }}
        >
          {allHistory.length} corridas
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-5 pb-10 pt-5">
        {isEmpty ? (
          <div
            className="rounded-xl p-8 border text-center mt-4"
            style={{
              background: "oklch(0.16 0.022 242)",
              borderColor: "oklch(0.24 0.025 245)",
            }}
            data-ocid="charts.empty_state"
          >
            <div className="text-4xl mb-3">📊</div>
            <div className="text-base font-semibold text-foreground mb-2">
              Nenhum dado ainda
            </div>
            <div className="text-sm" style={{ color: "oklch(0.68 0.025 225)" }}>
              Registre corridas para ver gráficos e estatísticas por plataforma.
            </div>
          </div>
        ) : (
          <Tabs defaultValue="hoje" data-ocid="charts.period.tab">
            <TabsList
              className="w-full mb-5 rounded-xl p-1"
              style={{ background: "oklch(0.12 0.018 240)" }}
            >
              <TabsTrigger
                value="hoje"
                className="flex-1 rounded-lg text-sm font-semibold"
                data-ocid="charts.hoje.tab"
              >
                Hoje
              </TabsTrigger>
              <TabsTrigger
                value="mes"
                className="flex-1 rounded-lg text-sm font-semibold"
                data-ocid="charts.mes.tab"
              >
                Este Mês
              </TabsTrigger>
              <TabsTrigger
                value="ano"
                className="flex-1 rounded-lg text-sm font-semibold"
                data-ocid="charts.ano.tab"
              >
                Este Ano
              </TabsTrigger>
            </TabsList>

            <TabsContent value="hoje">
              {todayRides.length === 0 ? (
                <EmptyPeriod
                  emoji="🚗"
                  msg="Sem corridas hoje. Adicione corridas para ver os gráficos."
                />
              ) : (
                <ChartsPanel
                  rides={todayRides}
                  barData={todayBarData}
                  label="Hora"
                />
              )}
            </TabsContent>

            <TabsContent value="mes">
              {monthRides.length === 0 ? (
                <EmptyPeriod emoji="📅" msg="Sem corridas este mês." />
              ) : (
                <ChartsPanel
                  rides={monthRides}
                  barData={monthBarData}
                  label="Dia"
                />
              )}
            </TabsContent>

            <TabsContent value="ano">
              {yearRides.length === 0 ? (
                <EmptyPeriod emoji="📈" msg="Sem corridas este ano." />
              ) : (
                <ChartsPanel
                  rides={yearRides}
                  barData={yearBarData}
                  label="Mês"
                />
              )}
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
