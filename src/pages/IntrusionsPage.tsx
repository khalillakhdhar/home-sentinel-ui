import { ShieldAlert, ShieldCheck, Shield, Clock, MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/StatCard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const intrusions = [
  { id: 1, date: "07/04/2026", heure: "20:14", lieu: "Entrée principale", type: "Mouvement", statut: "Non résolu" },
  { id: 2, date: "07/04/2026", heure: "16:45", lieu: "Fenêtre arrière", type: "Ouverture", statut: "Résolu" },
  { id: 3, date: "06/04/2026", heure: "23:10", lieu: "Garage", type: "Mouvement", statut: "Résolu" },
  { id: 4, date: "05/04/2026", heure: "03:22", lieu: "Jardin", type: "Mouvement", statut: "Résolu" },
  { id: 5, date: "04/04/2026", heure: "14:55", lieu: "Porte latérale", type: "Ouverture", statut: "Résolu" },
];

const isSecure = intrusions.filter(i => i.statut === "Non résolu").length === 0;

export default function IntrusionsPage() {
  const unresolvedCount = intrusions.filter(i => i.statut === "Non résolu").length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Détection d'Intrusions</h1>
          <p className="text-muted-foreground mt-1">Historique et statut de sécurité</p>
        </div>
        <Badge
          variant="outline"
          className={isSecure ? "bg-success/10 text-success border-success/30" : "bg-danger/10 text-danger border-danger/30"}
        >
          {isSecure ? <><ShieldCheck className="mr-1.5 h-3 w-3" /> Sécurisé</> : <><ShieldAlert className="mr-1.5 h-3 w-3" /> Alerte</>}
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Intrusions" value={intrusions.length} subtitle="Ce mois" icon={Shield} variant="danger" />
        <StatCard title="Non Résolues" value={unresolvedCount} subtitle="Action requise" icon={ShieldAlert} variant="warning" />
        <StatCard title="Dernière Intrusion" value="20:14" subtitle="Aujourd'hui" icon={Clock} variant="default" />
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
