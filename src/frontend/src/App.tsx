import { Toaster } from "@/components/ui/sonner";
import { BarChart2, User, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import ChartsScreen from "./components/ChartsScreen";
import DaySummary from "./components/DaySummary";
import LoginScreen from "./components/LoginScreen";
import RideEntry from "./components/RideEntry";
import VehicleSetup from "./components/VehicleSetup";
import type { Ride, User as UserType, VehicleConfig } from "./types";

const VEHICLE_KEY = "lucro_vehicle";
const RIDES_KEY = "lucro_rides";
const HISTORY_KEY = "lucro_rides_history";
const USER_KEY = "lucro_user";

type Tab = "login" | "app" | "charts";
type AppScreen = "setup" | "ride" | "summary";

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("login");
  const [user, setUser] = useState<UserType | null>(null);
  const [appScreen, setAppScreen] = useState<AppScreen>("setup");
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfig | null>(
    null,
  );
  const [rides, setRides] = useState<Ride[]>([]);
  const [allHistory, setAllHistory] = useState<Ride[]>([]);
  const [screenKey, setScreenKey] = useState(0);

  useEffect(() => {
    const savedUser = localStorage.getItem(USER_KEY);
    const savedVehicle = localStorage.getItem(VEHICLE_KEY);
    const savedRides = localStorage.getItem(RIDES_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);

    if (savedUser) {
      const u: UserType = JSON.parse(savedUser);
      setUser(u);
      setActiveTab("app");
    }
    if (savedVehicle) {
      const config: VehicleConfig = JSON.parse(savedVehicle);
      setVehicleConfig(config);
      setAppScreen("ride");
    }
    if (savedRides) setRides(JSON.parse(savedRides));
    if (savedHistory) setAllHistory(JSON.parse(savedHistory));
  }, []);

  const navigateApp = (s: AppScreen) => {
    setScreenKey((k) => k + 1);
    setAppScreen(s);
  };

  const handleLogin = (u: UserType) => {
    setUser(u);
    setActiveTab("app");
  };

  const handleLogout = () => {
    localStorage.removeItem(USER_KEY);
    setUser(null);
    setActiveTab("login");
  };

  const handleTabChange = (tab: Tab) => {
    if ((tab === "app" || tab === "charts") && !user) {
      setActiveTab("login");
      return;
    }
    setActiveTab(tab);
  };

  const handleVehicleSetup = (config: VehicleConfig) => {
    localStorage.setItem(VEHICLE_KEY, JSON.stringify(config));
    setVehicleConfig(config);
    navigateApp("ride");
  };

  const handleAddRide = (ride: Ride) => {
    const updatedRides = [...rides, ride];
    const updatedHistory = [...allHistory, ride];
    setRides(updatedRides);
    setAllHistory(updatedHistory);
    localStorage.setItem(RIDES_KEY, JSON.stringify(updatedRides));
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updatedHistory));
  };

  const handleFinishDay = () => {
    setRides([]);
    localStorage.removeItem(RIDES_KEY);
    navigateApp("ride");
  };

  const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "login",
      label: user ? "Perfil" : "Perfil",
      icon: <User size={22} />,
    },
    {
      id: "app",
      label: "Ativar",
      icon: <Zap size={22} />,
    },
    {
      id: "charts",
      label: "Gráficos",
      icon: <BarChart2 size={22} />,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: "oklch(0.10 0.015 240)",
        paddingBottom: user ? 72 : 0,
      }}
    >
      <meta name="theme-color" content="#0B0F14" />

      {/* Tab content */}
      <div key={screenKey} className="flex-1 flex flex-col screen-enter">
        {/* Aba 1: Login / Perfil */}
        {activeTab === "login" && !user && (
          <LoginScreen onLogin={handleLogin} />
        )}
        {activeTab === "login" && user && (
          <ProfileScreen user={user} onLogout={handleLogout} />
        )}

        {/* Aba 2: App */}
        {activeTab === "app" && user && (
          <>
            {appScreen === "setup" && (
              <VehicleSetup
                initialConfig={vehicleConfig}
                onComplete={handleVehicleSetup}
              />
            )}
            {appScreen === "ride" && vehicleConfig && (
              <RideEntry
                vehicleConfig={vehicleConfig}
                rides={rides}
                onAddRide={handleAddRide}
                onGoToSetup={() => navigateApp("setup")}
                onGoToSummary={() => navigateApp("summary")}
              />
            )}
            {appScreen === "summary" && vehicleConfig && (
              <DaySummary
                rides={rides}
                onFinishDay={handleFinishDay}
                onBack={() => navigateApp("ride")}
              />
            )}
          </>
        )}

        {/* Aba 3: Gráficos */}
        {activeTab === "charts" && user && (
          <ChartsScreen allHistory={allHistory} />
        )}
      </div>

      {/* Bottom Navigation (only when logged in) */}
      {user && (
        <nav
          className="fixed bottom-0 left-0 right-0 flex items-center"
          style={{
            height: 72,
            background: "oklch(0.13 0.02 242)",
            borderTop: "1px solid oklch(0.22 0.025 245)",
            zIndex: 50,
          }}
          data-ocid="nav.panel"
        >
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleTabChange(item.id)}
                className="flex-1 flex flex-col items-center justify-center gap-1 h-full transition-all active:scale-95"
                style={{
                  color: isActive ? "#1a73e8" : "oklch(0.50 0.02 240)",
                }}
                data-ocid={`nav.${item.id}.link`}
              >
                {item.icon}
                <span
                  className="text-xs font-semibold"
                  style={{ fontSize: 11 }}
                >
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}

      <Toaster position="top-center" />
    </div>
  );
}

function ProfileScreen({
  user,
  onLogout,
}: {
  user: UserType;
  onLogout: () => void;
}) {
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5"
      style={{ background: "oklch(0.10 0.015 240)" }}
      data-ocid="profile.page"
    >
      <div
        className="w-20 h-20 rounded-full flex items-center justify-center mb-4"
        style={{ background: "oklch(0.19 0.026 245)" }}
      >
        <User size={36} style={{ color: "#1a73e8" }} />
      </div>
      <h2
        className="text-2xl font-bold mb-1"
        style={{ color: "oklch(0.94 0.01 240)" }}
      >
        {user.name}
      </h2>
      <p className="text-sm mb-1" style={{ color: "oklch(0.60 0.02 240)" }}>
        {user.email}
      </p>
      {user.birthdate && (
        <p className="text-xs mb-6" style={{ color: "oklch(0.50 0.02 240)" }}>
          Nascimento:{" "}
          {new Date(`${user.birthdate}T12:00:00`).toLocaleDateString("pt-BR")}
        </p>
      )}
      {!user.birthdate && <div className="mb-6" />}
      <button
        type="button"
        onClick={onLogout}
        className="px-8 py-3 rounded-xl font-semibold text-sm transition-all active:scale-95"
        style={{
          background: "oklch(0.19 0.026 245)",
          border: "1px solid oklch(0.28 0.025 245)",
          color: "oklch(0.70 0.02 240)",
        }}
        data-ocid="profile.logout.button"
      >
        Sair da Conta
      </button>

      <p
        className="text-xs mt-12 text-center"
        style={{ color: "oklch(0.35 0.015 240)" }}
      >
        © {new Date().getFullYear()}.{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "oklch(0.45 0.02 240)" }}
        >
          caffeine.ai
        </a>
      </p>
    </div>
  );
}
