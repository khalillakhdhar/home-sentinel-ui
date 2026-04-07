import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Play, Pause, Circle, Clock, Mic, MicOff, AlertTriangle } from "lucide-react";
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
  const [isActive, setIsActive] = useState(false);
  const [isMicAvailable, setIsMicAvailable] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playerContainerRef = useRef<HTMLDivElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const rafIdRef = useRef<number | null>(null);

  const stopAudioMeter = useCallback(() => {
    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    if (audioContextRef.current) {
      void audioContextRef.current.close();
      audioContextRef.current = null;
    }

    analyserRef.current = null;
    setAudioLevel(0);
  }, []);

  const stopStream = useCallback(() => {
    stopAudioMeter();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setIsActive(false);
    setIsMicAvailable(false);
  }, [stopAudioMeter]);

  const startAudioMeter = useCallback((stream: MediaStream) => {
    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      setIsMicAvailable(false);
      return;
    }

    const context = new AudioContext();
    const source = context.createMediaStreamSource(stream);
    const analyser = context.createAnalyser();
    analyser.fftSize = 512;
    source.connect(analyser);

    const data = new Uint8Array(analyser.fftSize);
    audioContextRef.current = context;
    analyserRef.current = analyser;
    setIsMicAvailable(true);

    const tick = () => {
      analyser.getByteTimeDomainData(data);

      let sum = 0;
      for (let i = 0; i < data.length; i += 1) {
        const normalized = (data[i] - 128) / 128;
        sum += normalized * normalized;
      }

      const rms = Math.sqrt(sum / data.length);
      setAudioLevel(Math.min(100, Math.round(rms * 220)));
      rafIdRef.current = requestAnimationFrame(tick);
    };

    tick();
  }, []);

  const startStream = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError("Votre navigateur ne supporte pas l'accès à la caméra/micro.");
      return;
    }

    setError(null);
    stopStream();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
        audio: true,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        void videoRef.current.play().catch(() => {
          // Some browsers delay autoplay despite camera permission.
        });
      }

      setIsActive(true);

      try {
        startAudioMeter(stream);
      } catch {
        setIsMicAvailable(false);
      }
    } catch {
      setError("Accès refusé. Autorisez la caméra et le micro dans le navigateur.");
      stopStream();
    }
  }, [startAudioMeter, stopStream]);

  const toggleStream = async () => {
    if (isActive) {
      stopStream();
      return;
    }

    await startStream();
  };

  const takeSnapshot = () => {
    if (!videoRef.current || !isActive) {
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const context = canvas.getContext("2d");

    if (!context) {
      return;
    }

    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const imageUrl = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `capture-${Date.now()}.png`;
    link.click();
  };

  const openFullscreen = async () => {
    if (!playerContainerRef.current) {
      return;
    }

    await playerContainerRef.current.requestFullscreen();
  };

  useEffect(() => {
    void startStream();

    return () => {
      stopStream();
    };
  }, [startStream, stopStream]);

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
            <div ref={playerContainerRef} className="relative aspect-video bg-foreground/5 flex items-center justify-center">
              <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-br from-foreground/5 to-foreground/10" />
              <video
                ref={videoRef}
                className={`relative z-10 h-full w-full object-cover transition-opacity ${isActive ? "opacity-100" : "opacity-0"}`}
                autoPlay
                playsInline
                muted
              />
              {isActive ? (
                <>
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-2 rounded-full bg-foreground/70 px-3 py-1 text-xs text-background">
                    {isMicAvailable ? <Mic className="h-3.5 w-3.5" /> : <MicOff className="h-3.5 w-3.5" />}
                    <span>Mic {isMicAvailable ? "ON" : "OFF"}</span>
                  </div>
                </>
              ) : (
                <div className="relative z-10 text-center space-y-3 px-6">
                  {error ? <AlertTriangle className="h-10 w-10 mx-auto text-danger" /> : <Camera className="h-12 w-12 mx-auto text-muted-foreground" />}
                  <p className="text-muted-foreground">{error || "Caméra désactivée"}</p>
                </div>
              )}

              {isActive && (
                <div className="absolute bottom-4 left-4 z-20 flex items-center gap-2 rounded-full bg-foreground/70 px-3 py-1 text-xs text-background">
                  <span>Niveau micro</span>
                  <div className="h-1.5 w-20 overflow-hidden rounded-full bg-background/40">
                    <div className="h-full bg-success transition-all" style={{ width: `${audioLevel}%` }} />
                  </div>
                </div>
              )}

              {isActive && (
                <div className="absolute top-4 left-4 z-20 flex items-center justify-center gap-1.5 rounded-full bg-foreground/70 px-3 py-1 text-xs text-background">
                  <Circle className="h-2 w-2 fill-danger text-danger animate-pulse" />
                  <span className="font-medium">LIVE</span>
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
                onClick={() => void toggleStream()}
              >
                {isActive ? <><Pause className="mr-2 h-4 w-4" /> Désactiver</> : <><Play className="mr-2 h-4 w-4" /> Activer</>}
              </Button>
              <div className="grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" onClick={takeSnapshot} disabled={!isActive}>Snapshot</Button>
                <Button variant="outline" size="sm" onClick={() => void openFullscreen()} disabled={!isActive}>Plein écran</Button>
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
