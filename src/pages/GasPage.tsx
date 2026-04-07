import { Flame, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const gasHistory = [
  { heure: "06h", ppm: 280 },
  { heure: "08h", ppm: 320 },
  { heure: "10h", ppm: 350 },
  { heure: "12h", ppm: 410 },
  { heure: "14h", ppm: 450 },
  { heure: "16h", ppm: 380 },
  { heure: "18h", ppm: 340 },
  { heure: "20h", ppm: 360 },
  { heure: "22h", ppm: 310 },
];

const currentPPM = 450;
const maxPPM = 1000;
const dangerThreshold = 600;
const isNormal = currentPPM < dangerThreshold;

export default function GasPage() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Détection de Gaz</h1>
          <p className="text-muted-foreground mt-1">Surveillance en temps réel du niveau de gaz</p>
        </div>
        <Badge
          variant="outline"
          className={isNormal ? "bg-success/10 text-success border-success/30" : "bg-danger/10 text-danger border-danger/30"}
        >
          {isNormal ? <><CheckCircle className="mr-1.5 h-3 w-3" /> Normal</> : <><AlertTriangle className="mr-1.5 h-3 w-3" /> Danger</>}
        </Badge>
      </div>

      {/* Main gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <CardContent className="pt-6 flex flex-col items-center justify-center text-center space-y-6">
            <div className="relative">
              <div className={`flex h-40 w-40 items-center justify-center rounded-full border-8 ${isNormal ? "border-success/30" : "border-danger/30"}`}>
                <div className="text-center">
                  <span className={`text-4xl font-bold ${isNormal ? "text-success" : "text-danger"}`}>{currentPPM}</span>
                  <p className="text-xs text-muted-foreground mt-1">ppm</p>
                </div>
              </div>
              <div className={`absolute -top-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full ${isNormal ? "bg-success" : "bg-danger"}`}>
                <Flame className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>

            <div className="w-full space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0 ppm</span>
                <span>Seuil: {dangerThreshold} ppm</span>
                <span>{maxPPM} ppm</span>
              </div>
              <Progress value={(currentPPM / maxPPM) * 100} className="h-3" />
            </div>

            <div className="grid grid-cols-2 gap-4 w-full text-sm">
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Min (24h)</p>
                <p className="text-foreground font-bold">280 ppm</p>
              </div>
              <div className="bg-muted/50 p-3 rounded-lg">
                <p className="text-muted-foreground text-xs">Max (24h)</p>
                <p className="text-foreground font-bold">450 ppm</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Historique du Niveau de Gaz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={gasHistory}>
                <defs>
                  <linearGradient id="gasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 16%, 90%)" />
                <XAxis dataKey="heure" tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" />
                <YAxis tick={{ fontSize: 12 }} stroke="hsl(220, 10%, 50%)" domain={[0, maxPPM]} />
                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid hsl(220, 16%, 90%)' }} />
                <ReferenceLine y={dangerThreshold} stroke="hsl(0, 72%, 51%)" strokeDasharray="5 5" label={{ value: "Seuil danger", position: "insideTopRight", fontSize: 11, fill: "hsl(0, 72%, 51%)" }} />
                <Area type="monotone" dataKey="ppm" stroke="hsl(38, 92%, 50%)" fill="url(#gasGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Info cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Flame className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Capteur</p>
              <p className="text-sm font-semibold text-foreground">MQ-2 — Cuisine</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <CheckCircle className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Dernière alerte</p>
              <p className="text-sm font-semibold text-foreground">Il y a 3 jours</p>
            </div>
          </div>
        </Card>
        <Card className="stat-card">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
              <AlertTriangle className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Alertes ce mois</p>
              <p className="text-sm font-semibold text-foreground">2 alertes</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
