import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { Participant, DrawResult } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Users, Play } from "lucide-react";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);

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
        "¿Estás seguro? Esta acción no se puede deshacer. Se notificará a los participantes."
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              Panel Administrador
            </h1>
            <p className="text-gray-600 text-sm mt-1">Gestiona el sorteo</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="font-semibold text-gray-900">{user?.name}</p>
              <p className="text-sm text-gray-600">{user?.email}</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <LogOut size={18} />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users size={20} className="text-purple-600" />
                Participantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {participants.length}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Registrados en el sistema
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Estado del Sorteo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className={`text-3xl font-bold ${
                  hasDrawn ? "text-green-600" : "text-amber-600"
                }`}
              >
                {hasDrawn ? "Completado" : "Pendiente"}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {hasDrawn
                  ? "Sorteo realizado"
                  : "Esperando para ejecutar sorteo"}
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Fecha del Evento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">5 Dic</div>
              <p className="text-xs text-gray-500 mt-1">2025</p>
            </CardContent>
          </Card>
        </div>

        {/* Draw Button */}
        {!hasDrawn && (
          <Card className="border-0 shadow-lg mb-8 bg-gradient-to-r from-purple-50 to-cyan-50">
            <CardHeader>
              <CardTitle>Realizar Sorteo</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                {participants.length < 2
                  ? "Se necesitan al menos 2 participantes registrados"
                  : `Están registrados ${participants.length} participantes. ¿Listo para hacer el sorteo?`}
              </p>
              <Button
                onClick={handleDraw}
                disabled={isLoading || participants.length < 2}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold gap-2"
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
          <Card className="border-0 shadow-lg mb-8 bg-green-50">
            <CardHeader>
              <CardTitle className="text-green-900">
                ✓ Sorteo Completado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-800 text-sm mb-4">
                El sorteo ha sido realizado exitosamente. Los participantes ya
                pueden ver a quién les tocó.
              </p>
              <div className="space-y-2 text-sm text-green-700">
                {drawResults.slice(0, 5).map((result) => (
                  <div key={result.participantId} className="flex gap-2">
                    <span className="font-medium">→</span>
                    <span>
                      Un participante debe regalar a <strong>{result.assignedTo}</strong>
                    </span>
                  </div>
                ))}
                {drawResults.length > 5 && (
                  <p className="text-green-600 pt-2">
                    ... y {drawResults.length - 5} más
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants Table */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Participantes Registrados</CardTitle>
          </CardHeader>
          <CardContent>
            {participants.length === 0 ? (
              <div className="py-12 text-center">
                <Users size={48} className="mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">
                  Aún no hay participantes registrados
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  Los participantes aparecerán aquí cuando se registren
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Nombre
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Correo
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Teléfono
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                        Fecha de Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr
                        key={participant.id}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {participant.name}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {participant.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {participant.phone}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(participant.createdAt).toLocaleDateString(
                            "es-ES",
                            {
                              year: "numeric",
                              month: "2-digit",
                              day: "2-digit",
                              hour: "2-digit",
                              minute: "2-digit",
                            }
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
