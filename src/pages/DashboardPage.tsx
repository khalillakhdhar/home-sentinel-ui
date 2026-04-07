import { ShieldAlert, Camera, Flame, Clock, Activity, Wifi } from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const activityData = [
  { heure: "08h", gaz: 320, intrusions: 0 },
  { heure: "10h", gaz: 350, intrusions: 0 },
  { heure: "12h", gaz: 410, intrusions: 1 },
  { heure: "14h", gaz: 450, intrusions: 0 },
  { heure: "16h", gaz: 380, intrusions: 1 },
  { heure: "18h", gaz: 340, intrusions: 0 },
  { heure: "20h", gaz: 360, intrusions: 1 },
  { heure: "22h", gaz: 310, intrusions: 0 },
];

const recentEvents = [
  { time: "20:14", event: "Mouvement détecté - Entrée principale", type: "intrusion" },
  { time: "18:32", event: "Niveau de gaz élevé - Cuisine", type: "gas" },
  { time: "16:45", event: "Intrusion détectée - Fenêtre arrière", type: "intrusion" },
  { time: "14:22", event: "Caméra activée - Garage", type: "camera" },
  { time: "12:10", event: "Mouvement détecté - Jardin", type: "intrusion" },
];

const eventTypeStyles = {
  intrusion: "bg-danger/10 text-danger",
  gas: "bg-warning/10 text-warning",
  camera: "bg-primary/10 text-primary",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Bienvenue, Ahmed 👋</h1>
        <p className="text-muted-foreground mt-1">Voici un aperçu de votre maison intelligente</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Intrusions" value={3} subtitle="Dernières 24h" icon={ShieldAlert} variant="danger" trend="↑ +1 aujourd'hui" />
        <StatCard title="Niveau de Gaz" value="450 ppm" subtitle="Cuisine" icon={Flame} variant="warning" trend="Normal" trendUp />
        <StatCard title="Caméra" value="Actif" subtitle="2 caméras en ligne" icon={Camera} variant="success" />
        <StatCard title="Dernière Connexion" value="20:14" subtitle="Aujourd'hui" icon={Clock} variant="default" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4 text-primary" />
              Niveau de Gaz (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={activityData}>
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
              Intrusions (24h)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
                <XAxis dataKey="heure" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
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
