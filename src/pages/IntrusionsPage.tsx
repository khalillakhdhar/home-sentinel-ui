import { useEffect, useRef, useState } from "react";
import { ShieldAlert, ShieldCheck, Shield, Clock, MapPin, AlertTriangle } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { fetchPresenceReading } from "@/lib/ubidots";
import { TIME_RANGE_OPTIONS, TimeRange, filterByTimeRange, playAlertTone, useMonitoringPreferences } from "@/lib/monitoring";

function formatDate(timestamp: number) {
  return new Date(timestamp).toLocaleDateString("fr-FR");
}

function formatTime(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

export default function IntrusionsPage() {
  const [range, setRange] = useState<TimeRange>("1h");
  const alertTriggeredRef = useRef(false);
  const { alertSoundEnabled, setAlertSoundEnabled } = useMonitoringPreferences();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["presence-live"],
    queryFn: () => fetchPresenceReading(300),
    refetchInterval: 10000,
  });

  const filteredHistory = filterByTimeRange(data?.history || [], range);
  const detections = filteredHistory.filter((item) => item.value >= 1);
  const currentPresence = data?.current?.value ?? 0;

  useEffect(() => {
    const shouldAlert = currentPresence >= 1;

    if (alertSoundEnabled && shouldAlert && !alertTriggeredRef.current) {
      playAlertTone();
      alertTriggeredRef.current = true;
      return;
    }

    if (!shouldAlert) {
      alertTriggeredRef.current = false;
    }
  }, [alertSoundEnabled, currentPresence]);

  const intrusions = detections
    .slice()
    .reverse()
    .map((item, index) => ({
      id: index + 1,
      date: formatDate(item.timestamp),
      heure: formatTime(item.timestamp),
      lieu: "Capteur ultrason",
      type: `Présence ${item.value}`,
      statut: index === 0 && currentPresence >= 1 ? "Non résolu" : "Résolu",
    }));

  const unresolvedCount = intrusions.filter(i => i.statut === "Non résolu").length;
  const isSecure = unresolvedCount === 0;
  const lastDetectionTime = intrusions[0]?.heure || "--:--";

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Détection d'Intrusions</h1>
          <p className="text-muted-foreground mt-1">Historique et statut de sécurité</p>
          {isError && <p className="mt-2 text-sm text-danger">Impossible de lire la présence ultrason depuis Ubidots.</p>}
        </div>
        <Badge
          variant="outline"
          className={isSecure ? "bg-success/10 text-success border-success/30" : "bg-danger/10 text-danger border-danger/30"}
        >
          {isSecure ? <><ShieldCheck className="mr-1.5 h-3 w-3" /> Sécurisé</> : <><ShieldAlert className="mr-1.5 h-3 w-3" /> Alerte</>}
        </Badge>
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
      </div>

      {currentPresence >= 1 && (
        <Card className="border-danger/40 bg-danger/10">
          <CardContent className="py-3 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-danger animate-pulse" />
            <p className="text-sm text-danger font-medium">Alerte présence active: ultrason = 1</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Détections" value={isLoading ? "..." : intrusions.length} subtitle={`Ultrason (${range})`} icon={Shield} variant="danger" />
        <StatCard title="Non Résolues" value={unresolvedCount} subtitle="Action requise" icon={ShieldAlert} variant="warning" />
        <StatCard title="Dernière Détection" value={isLoading ? "..." : lastDetectionTime} subtitle="Aujourd'hui" icon={Clock} variant="default" />
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-danger" />
            Liste des Intrusions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Heure</TableHead>
                  <TableHead>Lieu</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {intrusions.length === 0 && !isLoading && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                      Aucune présence détectée (valeur 1)
                    </TableCell>
                  </TableRow>
                )}
                {intrusions.map((intr) => (
                  <TableRow key={intr.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium text-muted-foreground">{intr.id}</TableCell>
                    <TableCell>{intr.date}</TableCell>
                    <TableCell className="font-mono text-sm">{intr.heure}</TableCell>
                    <TableCell>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {intr.lieu}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-muted/50 text-foreground text-xs">
                        {intr.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          intr.statut === "Résolu"
                            ? "bg-success/10 text-success border-success/20"
                            : "bg-danger/10 text-danger border-danger/20"
                        }
                      >
                        {intr.statut}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
