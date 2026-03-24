import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import ChartsScreen from "./components/ChartsScreen";
import DaySummary from "./components/DaySummary";
import RideEntry from "./components/RideEntry";
import VehicleSetup from "./components/VehicleSetup";
import type { Ride, Screen, VehicleConfig } from "./types";

const VEHICLE_KEY = "lucro_vehicle";
const RIDES_KEY = "lucro_rides";
const HISTORY_KEY = "lucro_rides_history";

export default function App() {
  const [screen, setScreen] = useState<Screen>("setup");
  const [vehicleConfig, setVehicleConfig] = useState<VehicleConfig | null>(
    null,
  );
  const [rides, setRides] = useState<Ride[]>([]);
  const [allHistory, setAllHistory] = useState<Ride[]>([]);
  const [screenKey, setScreenKey] = useState(0);

  useEffect(() => {
    const savedVehicle = localStorage.getItem(VEHICLE_KEY);
    const savedRides = localStorage.getItem(RIDES_KEY);
    const savedHistory = localStorage.getItem(HISTORY_KEY);
    if (savedVehicle) {
      const config: VehicleConfig = JSON.parse(savedVehicle);
      setVehicleConfig(config);
      setScreen("ride");
    }
    if (savedRides) {
      setRides(JSON.parse(savedRides));
    }
    if (savedHistory) {
      setAllHistory(JSON.parse(savedHistory));
    }
  }, []);

  const navigateTo = (s: Screen) => {
    setScreenKey((k) => k + 1);
    setScreen(s);
  };

  const handleVehicleSetup = (config: VehicleConfig) => {
    localStorage.setItem(VEHICLE_KEY, JSON.stringify(config));
    setVehicleConfig(config);
    navigateTo("ride");
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
    // Keep history but clear current day rides
    setRides([]);
    localStorage.removeItem(RIDES_KEY);
    navigateTo("ride");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <meta name="theme-color" content="#0B0F14" />
      <div key={screenKey} className="flex-1 flex flex-col screen-enter">
        {screen === "setup" && (
          <VehicleSetup
            initialConfig={vehicleConfig}
            onComplete={handleVehicleSetup}
          />
        )}
        {screen === "ride" && vehicleConfig && (
          <RideEntry
            vehicleConfig={vehicleConfig}
            rides={rides}
            onAddRide={handleAddRide}
            onGoToSetup={() => navigateTo("setup")}
            onGoToSummary={() => navigateTo("summary")}
            onGoToCharts={() => navigateTo("charts")}
          />
        )}
        {screen === "summary" && vehicleConfig && (
          <DaySummary
            rides={rides}
            onFinishDay={handleFinishDay}
            onBack={() => navigateTo("ride")}
          />
        )}
        {screen === "charts" && (
          <ChartsScreen
            allHistory={allHistory}
            onBack={() => navigateTo("ride")}
          />
        )}
      </div>
      <Toaster position="top-center" />
    </div>
  );
}
