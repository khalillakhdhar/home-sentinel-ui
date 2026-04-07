import { useState } from "react";
import { Camera, Play, Pause, Circle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const cameraEvents = [
  { time: "20:14", description: "Mouvement détecté à l'entrée principale", severity: "high" },
  { time: "18:45", description: "Mouvement détecté dans le jardin", severity: "medium" },
  { time: "16:30", description: "Personne détectée au garage", severity: "high" },
  { time: "14:32", description: "Mouvement détecté - chat dans le jardin", severity: "low" },
  { time: "12:15", description: "Activation automatique - mode nuit", severity: "info" },
  { time: "08:00", description: "Système de caméras démarré", severity: "info" },
];

const severityStyles = {
  high: "bg-danger/10 text-danger border-danger/20",
  medium: "bg-warning/10 text-warning border-warning/20",
  low: "bg-success/10 text-success border-success/20",
  info: "bg-primary/10 text-primary border-primary/20",
};

export default function CameraPage() {
  const [isActive, setIsActive] = useState(true);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Caméra de Surveillance</h1>
          <p className="text-muted-foreground mt-1">Visualisation en direct et événements</p>
        </div>
        <Badge variant="outline" className={isActive ? "bg-success/10 text-success border-success/30" : "bg-muted text-muted-foreground"}>
          <Circle className={`mr-1.5 h-2 w-2 fill-current ${isActive ? "animate-pulse" : ""}`} />
          {isActive ? "En ligne" : "Hors ligne"}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Video feed */}
        <Card className="lg:col-span-2">
          <CardContent className="p-0 overflow-hidden rounded-xl">
            <div className="relative aspect-video bg-foreground/5 flex items-center justify-center">
              <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
              {isActive ? (
                <div className="relative z-10 text-center space-y-3">
                  <div className="flex h-16 w-16 mx-auto items-center justify-center rounded-full bg-primary/10">
                    <Camera className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-foreground font-medium">Flux caméra en direct</p>
                  <p className="text-xs text-muted-foreground">Caméra 1 — Entrée principale</p>
                  <div className="flex items-center justify-center gap-1.5">
                    <Circle className="h-2 w-2 fill-danger text-danger animate-pulse" />
                    <span className="text-xs font-medium text-danger">REC</span>
                  </div>
                </div>
              ) : (
                <div className="relative z-10 text-center space-y-3">
                  <Camera className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">Caméra désactivée</p>
                </div>
              )}
              {/* Overlay controls */}
              <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between z-10">
                <span className="text-xs bg-foreground/60 text-background px-2 py-1 rounded">CAM-01</span>
                <span className="text-xs bg-foreground/60 text-background px-2 py-1 rounded">
                  {new Date().toLocaleTimeString("fr-FR")}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Controls */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Contrôles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className={`w-full ${isActive ? "bg-danger text-danger-foreground hover:bg-danger/90" : "gradient-primary text-primary-foreground hover:opacity-90"}`}
                onClick={() => setIsActive(!isActive)}
              >
                {isActive ? <><Pause className="mr-2 h-4 w-4" /> Désactiver</> : <><Play className="mr-2 h-4 w-4" /> Activer</>}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm">Snapshot</Button>
                <Button variant="outline" size="sm">Plein écran</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Infos Caméra</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Modèle</span><span className="text-foreground font-medium">SmartCam Pro</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Résolution</span><span className="text-foreground font-medium">1080p</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Mode nuit</span><span className="text-success font-medium">Actif</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">Stockage</span><span className="text-foreground font-medium">64 Go</span></div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Events */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Historique des Événements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {cameraEvents.map((ev, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <Badge variant="outline" className={severityStyles[ev.severity as keyof typeof severityStyles]}>
                  {ev.time}
                </Badge>
                <span className="text-sm text-foreground">{ev.description}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
