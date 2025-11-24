import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Participant, DrawResult } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, Play } from "lucide-react";
import BibleVerse, { getVerseByTheme } from "@/components/BibleVerse";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);

  const verse = getVerseByTheme("harmony");

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/");
    }
    fetchParticipants();

    // Poll for participants every 5 seconds
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchParticipants = async () => {
    try {
      const response = await fetch("/api/participants");
      const data = await response.json();
      setParticipants(data.participants || []);
    } catch {
      toast.error("Error al cargar participantes");
    }
  };

  const handleDraw = async () => {
    if (participants.length < 2) {
      toast.error("Se necesitan al menos 2 participantes para hacer el sorteo");
      return;
    }

    if (
      !window.confirm(
        "¿Estás seguro? Esta acción no se puede deshacer. Se notificará a los participantes.",
      )
    ) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/draw", { method: "POST" });
      const data = await response.json();

      if (data.success) {
        setHasDrawn(true);
        setDrawResults(data.results || []);
        toast.success("¡Sorteo realizado exitosamente!");
      } else {
        toast.error(data.message || "Error al realizar el sorteo");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900/80 to-slate-900/80 shadow-lg border-b-4 border-blue-500/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Familia Josué
            </h1>
            <p className="text-blue-200 font-semibold mt-1">
              Panel Administrador
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-blue-200">{user?.name}</p>
              <p className="text-sm text-blue-300">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2 text-blue-300 border-blue-500/50 hover:bg-blue-900/50"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </Button>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pb-4">
          <BibleVerse
            verse={verse.verse}
            reference={verse.reference}
            className="text-blue-100"
          />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-blue-500/20">
              <CardTitle className="text-sm font-medium text-blue-200 flex items-center gap-2">
                <Users size={20} className="text-blue-400" />
                Participantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-300">
                {participants.length}
              </div>
              <p className="text-xs text-blue-300/70 mt-1">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-blue-500/20">
              <CardTitle className="text-sm font-medium text-blue-200">
                Estado del Sorteo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  hasDrawn ? "text-green-400" : "text-blue-300"
                }`}
              >
                {hasDrawn ? "Completado" : "Pendiente"}
              </div>
              <p className="text-xs text-blue-300/70 mt-1">
                {hasDrawn
                  ? "Sorteo realizado"
                  : "Esperando para ejecutar sorteo"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="pb-3 border-b border-blue-500/20">
              <CardTitle className="text-sm font-medium text-blue-200">
                Fecha del Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-300">5 Dic</div>
              <p className="text-xs text-blue-300/70 mt-1">2025</p>
            </CardContent>
          </Card>
        </div>

        {/* Draw Button */}
        {!hasDrawn && (
          <Card className="border-2 border-orange-500/40 shadow-lg mb-8 bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-orange-500/20">
              <CardTitle className="text-blue-200">Realizar Sorteo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-300 mb-4">
                {participants.length < 2
                  ? "Se necesitan al menos 2 participantes registrados"
                  : `Están registrados ${participants.length} participantes. ¿Listo para hacer el sorteo?`}
              </p>
              <Button
                onClick={handleDraw}
                disabled={isLoading || participants.length < 2}
                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold gap-2"
                size="lg"
              >
                <Play size={20} />
                {isLoading ? "Procesando..." : "Ejecutar Sorteo"}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Draw Results */}
        {hasDrawn && drawResults.length > 0 && (
          <Card className="border-2 border-green-500/40 shadow-lg mb-8 bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-green-500/20">
              <CardTitle className="text-green-400">
                ✓ Sorteo Completado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-sm mb-4">
                El sorteo ha sido realizado exitosamente. Los participantes ya
                pueden ver a quién les tocó.
              </p>
              <div className="space-y-2 text-sm text-blue-300">
                {drawResults.slice(0, 5).map((result) => (
                  <div key={result.participantId} className="flex gap-2">
                    <span className="font-medium">→</span>
                    <span>
                      Un participante debe regalar a{" "}
                      <strong>{result.assignedTo}</strong>
                    </span>
                  </div>
                ))}
                {drawResults.length > 5 && (
                  <p className="text-blue-300/70 pt-2">
                    ... y {drawResults.length - 5} más
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants Table */}
        <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="border-b border-blue-500/20">
            <CardTitle className="text-blue-200">
              Participantes Registrados
            </CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={48} className="mx-auto text-blue-500/50 mb-4" />
                <p className="text-blue-300 font-medium">
                  Aún no hay participantes registrados
                </p>
                <p className="text-sm text-blue-300/70 mt-2">
                  Los participantes aparecerán aquí cuando se registren
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-blue-500/20">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-200">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-200">
                        Correo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-200">
                        Teléfono
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-blue-200">
                        Fecha de Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="border-b border-blue-500/10 hover:bg-blue-900/30 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-blue-200 font-medium">
                          {participant.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-300">
                          {participant.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-300">
                          {participant.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-blue-300/70">
                          {new Date(participant.createdAt).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
