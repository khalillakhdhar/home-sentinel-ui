import { useEffect, useRef, useState } from "react";
import { ShieldAlert, Camera, Flame, Clock, Activity, Wifi, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { fetchGasReading, fetchPresenceReading } from "@/lib/ubidots";
import { MAX_GAS_ALERT_THRESHOLD, MIN_GAS_ALERT_THRESHOLD, TIME_RANGE_OPTIONS, TimeRange, filterByTimeRange, playAlertTone, useMonitoringPreferences } from "@/lib/monitoring";

const eventTypeStyles = {
  intrusion: "bg-danger/10 text-danger",
  gas: "bg-warning/10 text-warning",
  camera: "bg-primary/10 text-primary",
};

function formatHour(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function DashboardPage() {
  const [range, setRange] = useState<TimeRange>("1h");
  const alertTriggeredRef = useRef(false);
  const [thresholdInput, setThresholdInput] = useState("");
  const {
    alertSoundEnabled,
    setAlertSoundEnabled,
    gasAlertThreshold,
    setGasAlertThreshold,
  } = useMonitoringPreferences();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["dashboard-live"],
    queryFn: async () => {
      const [gas, presence] = await Promise.all([fetchGasReading(300), fetchPresenceReading(300)]);
      return { gas, presence };
    },
    refetchInterval: 10000,
  });

  const gasHistory = filterByTimeRange(data?.gas.history ?? [], range);
  const presenceHistory = filterByTimeRange(data?.presence.history ?? [], range);

  const currentGas = data?.gas.current?.value ?? 0;
  const currentPresence = data?.presence.current?.value ?? 0;
  const intrusionsLast24 = presenceHistory.filter((item) => item.value >= 1).length;
  const gasStatus = currentGas >= gasAlertThreshold ? "Alerte" : "Normal";
  const shouldAlert = currentPresence >= 1 || currentGas >= gasAlertThreshold;

  useEffect(() => {
    setThresholdInput(String(gasAlertThreshold));
  }, [gasAlertThreshold]);

  useEffect(() => {
    if (alertSoundEnabled && shouldAlert && !alertTriggeredRef.current) {
      playAlertTone();
      alertTriggeredRef.current = true;
      return;
    }

    if (!shouldAlert) {
      alertTriggeredRef.current = false;
    }
  }, [alertSoundEnabled, shouldAlert]);

  const gasChartData = gasHistory.map((item) => ({
    heure: formatHour(item.timestamp),
    gaz: Number(item.value.toFixed(2)),
  }));

  const intrusionChartData = presenceHistory.map((item) => ({
    heure: formatHour(item.timestamp),
    intrusions: item.value >= 1 ? 1 : 0,
  }));

  const recentEvents = [
    ...presenceHistory
      .filter((item) => item.value >= 1)
      .slice(-3)
      .reverse()
      .map((item) => ({
        time: formatHour(item.timestamp),
        event: "Présence détectée par ultrason",
        type: "intrusion" as const,
      })),
    ...(data?.gas.current
      ? [
          {
            time: formatHour(data.gas.current.timestamp),
            event: `Niveau de gaz: ${data.gas.current.value.toFixed(2)} ppm`,
            type: "gas" as const,
          },
        ]
      : []),
    {
      time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
      event: "Flux caméra actif",
      type: "camera" as const,
    },
  ].slice(0, 5);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenue, Ahmed 👋</h1>
        <p className="text-muted-foreground mt-1">Voici un aperçu de votre maison intelligente</p>
        {isError && <p className="mt-2 text-sm text-danger">Connexion Ubidots indisponible. Vérifiez token/ID.</p>}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {TIME_RANGE_OPTIONS.map((option) => (
          <Button
            key={option.value}
            size="sm"
            variant={range === option.value ? "default" : "outline"}
            onClick={() => setRange(option.value)}
          >
            {option.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant={alertSoundEnabled ? "default" : "outline"}
          onClick={() => setAlertSoundEnabled(!alertSoundEnabled)}
        >
          Son alerte: {alertSoundEnabled ? "ON" : "OFF"}
        </Button>
        <div className="flex items-center gap-2 rounded-md border bg-card px-2 py-1">
          <span className="text-xs text-muted-foreground">Seuil gaz</span>
          <Input
            type="number"
            min={MIN_GAS_ALERT_THRESHOLD}
            max={MAX_GAS_ALERT_THRESHOLD}
            className="h-8 w-24"
            value={thresholdInput}
            onChange={(event) => setThresholdInput(event.target.value)}
            onBlur={() => setGasAlertThreshold(Number(thresholdInput))}
          />
          <span className="text-xs text-muted-foreground">ppm</span>
        </div>
      </div>

      {shouldAlert && (
        <Card className="border-danger/40 bg-danger/10">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger animate-pulse" />
            <p className="text-sm text-danger font-medium">
              Alerte active: {currentPresence >= 1 ? "Présence détectée (1)" : "Présence normale (0)"} {currentGas >= gasAlertThreshold ? `• Gaz élevé (${currentGas.toFixed(2)} ppm)` : ""}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Présence" value={isLoading ? "..." : intrusionsLast24} subtitle={`Détections (${range})`} icon={ShieldAlert} variant="danger" trend={currentPresence >= 1 ? "Présence: 1" : "Présence: 0"} trendUp={currentPresence < 1} />
        <StatCard title="Niveau de Gaz" value={isLoading ? "..." : `${currentGas.toFixed(2)} ppm`} subtitle="Capteur gaz" icon={Flame} variant="warning" trend={gasStatus} trendUp={gasStatus === "Normal"} />
        <StatCard title="Caméra" value="Actif" subtitle="2 caméras en ligne" icon={Camera} variant="success" />
        <StatCard title="Dernière Sync" value={new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} subtitle="Ubidots" icon={Clock} variant="default" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Niveau de Gaz (live)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={gasChartData}>
                <defs>
                  <linearGradient id="gasGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(174, 72%, 40%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
                <XAxis dataKey="heure" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220, 16%, 90%)' }} />
                <Area type="monotone" dataKey="gaz" stroke="hsl(174, 72%, 40%)" fill="url(#gasGradient)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-danger" />
              Présence (1/0)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={intrusionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
                <XAxis dataKey="heure" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" domain={[0, 1]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220, 16%, 90%)' }} />
                <Bar dataKey="intrusions" fill="hsl(0, 72%, 51%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Events */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Wifi className="h-4 w-4 text-primary" />
            Événements Récents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors">
                <span className={`px-2 py-1 rounded-md text-xs font-semibold ${eventTypeStyles[ev.type as keyof typeof eventTypeStyles]}`}>
                  {ev.time}
                </span>
                <span className="text-sm text-foreground">{ev.event}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
