import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import type { Participant, DrawResult } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { LogOut, Users, Play, Gift, Snowflake, Sparkles, Star, Candy } from "lucide-react";
import BibleVerse from "@/components/BibleVerse";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [drawResults, setDrawResults] = useState<DrawResult[]>([]);
  const [showDrawDialog, setShowDrawDialog] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    if (!user?.esAdmin) {
      navigate("/");
    }
    fetchParticipants();

    // Poll for participants every 5 seconds
    const interval = setInterval(fetchParticipants, 5000);
    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchParticipants = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.PARTICIPANTES);
      const result = await response.json();
      setParticipants(result.data || []);
      
      // Actualizar estado del sorteo si existe
      if (result.sorteo && result.sorteo.estado === "completado") {
        setHasDrawn(true);
      }
    } catch {
      toast.error("Error al cargar participantes");
    }
  };

  const handleDraw = async () => {
    if (participants.length < 2) {
      toast.error("Se necesitan al menos 2 participantes para hacer el sorteo");
      return;
    }

    setShowDrawDialog(true);
  };

  const confirmDraw = async () => {
    setShowDrawDialog(false);
    setShowAnimation(true);
    
    // Wait 10 seconds for animation
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    setShowAnimation(false);
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SORTEO, { 
        method: "POST",
        headers: {
          "accept": "application/json"
        }
      });
      const result = await response.json();

      if (result.success) {
        setHasDrawn(true);
        setDrawResults(result.data || []);
        toast.success(result.message || "¡Sorteo realizado exitosamente!");
      } else {
        toast.error(result.error || result.message || "Error al realizar el sorteo");
      }
    } catch (error) {
      console.error("Error al realizar sorteo:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDraw = async () => {
    setShowResetDialog(true);
  };

  const confirmResetDraw = async () => {
    setShowResetDialog(false);
    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SORTEO_RESET, { 
        method: "DELETE",
        headers: {
          "accept": "application/json"
        }
      });
      const result = await response.json();

      if (result.success) {
        setHasDrawn(false);
        setDrawResults([]);
        toast.success(result.message || "¡Sorteo reseteado exitosamente!");
        // Refrescar participantes
        fetchParticipants();
      } else {
        toast.error(result.error || result.message || "Error al resetear el sorteo");
      }
    } catch (error) {
      console.error("Error al resetear sorteo:", error);
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
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Familia Josué
            </h1>
            <p className="text-blue-200 font-semibold text-sm mt-0.5">
              Panel Administrador
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="font-semibold text-blue-200 text-sm">
                {user?.nombreCompleto}
              </p>
              <p className="text-xs text-blue-300">{user?.numeroTelefono}</p>
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
        <div className="max-w-7xl mx-auto px-4 md:px-6 pb-3">
          <BibleVerse className="text-blue-100 text-xs md:text-sm" />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4 md:mb-6">
          <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2 border-b border-blue-500/20">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-200 flex items-center gap-2">
                <Users size={16} className="text-blue-400" />
                Participantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-blue-300">
                {participants.length}
              </div>
              <p className="text-xs text-blue-300/70 mt-1">Registrados</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2 border-b border-blue-500/20">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-200">
                Estado del Sorteo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <div
                  className={`text-2xl md:text-3xl font-bold ${
                    hasDrawn ? "text-green-400" : "text-blue-300"
                  }`}
                >
                  {hasDrawn ? "Completado" : "Pendiente"}
                </div>
                <p className="text-xs text-blue-300/70 mt-1">
                  {hasDrawn ? "Realizado" : "En espera"}
                </p>
              </div>
              {hasDrawn && (
                <Button
                  onClick={handleResetDraw}
                  disabled={isLoading}
                  variant="outline"
                  size="sm"
                  className="w-full text-red-400 border-red-500/50 hover:bg-red-900/50 hover:text-red-300"
                >
                  {isLoading ? "Procesando..." : "Resetear Sorteo"}
                </Button>
              )}
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="pb-2 border-b border-blue-500/20">
              <CardTitle className="text-xs md:text-sm font-medium text-blue-200">
                Fecha del Sorteo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl md:text-3xl font-bold text-blue-300">
                {new Date(import.meta.env.VITE_DRAW_DATE).toLocaleDateString("es-ES", { 
                  day: "numeric", 
                  month: "short" 
                })}
              </div>
              <p className="text-xs text-blue-300/70 mt-1">
                {new Date(import.meta.env.VITE_DRAW_DATE).getFullYear()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Draw Button */}
        {!hasDrawn && (
          <Card className="border-2 border-orange-500/40 shadow-lg mb-4 md:mb-6 bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-orange-500/20 pb-2">
              <CardTitle className="text-sm md:text-base text-blue-200">
                Realizar Sorteo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-300 mb-3 text-sm">
                {participants.length < 2
                  ? "Se necesitan al menos 2 participantes"
                  : `${participants.length} participantes registrados`}
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
          <Card className="border-2 border-green-500/40 shadow-lg mb-4 md:mb-6 bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-green-500/20 pb-2">
              <CardTitle className="text-sm md:text-base text-green-400">
                ✓ Sorteo Completado
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-blue-200 text-xs md:text-sm mb-3">
                El sorteo ha sido realizado exitosamente. {drawResults.length} participantes tienen asignado su amigo secreto.
              </p>
              <div className="space-y-1 text-xs md:text-sm text-blue-300">
                {drawResults.map((result) => (
                  <div key={result.participante} className="flex gap-2 items-center">
                    <span className="font-medium">✓</span>
                    <span>
                      <strong>{result.nombreParticipante}</strong>
                      {result.tieneAmigoSecreto ? (
                        <span className="text-green-400 ml-2">tiene amigo secreto asignado</span>
                      ) : (
                        <span className="text-red-400 ml-2">sin asignación</span>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Participants Table */}
        <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="border-b border-blue-500/20 pb-2">
            <CardTitle className="text-sm md:text-base text-blue-200">
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
                      <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-blue-200">
                        Nombre
                      </th>
                      <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-blue-200">
                        Teléfono
                      </th>
                      <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-blue-200">
                        Encuesta
                      </th>
                      <th className="px-2 md:px-4 py-2 md:py-3 text-left text-xs md:text-sm font-semibold text-blue-200">
                        Fecha de Registro
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((participant) => (
                      <tr
                        key={participant._id}
                        className="border-b border-blue-500/10 hover:bg-blue-900/30 transition-colors"
                      >
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-blue-200 font-medium">
                          {participant.nombreCompleto}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-blue-300">
                          {participant.numeroTelefono}
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            participant.encuestaCompletada
                              ? "bg-purple-900/30 text-purple-400 border border-purple-500/30" 
                              : "bg-orange-900/30 text-orange-400 border border-orange-500/30"
                          }`}>
                            {participant.encuestaCompletada ? "✓ Completada" : "Pendiente"}
                          </span>
                        </td>
                        <td className="px-2 md:px-4 py-2 md:py-3 text-xs md:text-sm text-blue-300/70">
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

      {/* Sorteo Dialog */}
      <AlertDialog open={showDrawDialog} onOpenChange={setShowDrawDialog}>
        <AlertDialogContent className="bg-slate-800 border-blue-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-blue-200">
              ¿Ejecutar Sorteo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300/80">
              Esta acción no se puede deshacer. Se asignará un amigo secreto a cada participante de forma aleatoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-blue-200 border-blue-500/50 hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDraw}
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
            >
              Sí, ejecutar sorteo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reset Dialog */}
      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent className="bg-slate-800 border-red-500/50">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">
              ¿Resetear Sorteo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-blue-300/80">
              Esta acción eliminará todas las asignaciones de amigo secreto. Los participantes seguirán registrados, pero deberás ejecutar el sorteo nuevamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-700 text-blue-200 border-blue-500/50 hover:bg-slate-600">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmResetDraw}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white"
            >
              Sí, resetear sorteo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Christmas Animation Modal */}
      {showAnimation && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex items-center justify-center">
          <div className="text-center space-y-8 px-4">
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-orange-300 via-red-300 to-pink-300 bg-clip-text text-transparent animate-pulse">
              🎄 Realizando Sorteo... 🎁
            </h2>
            
            {/* Animated Christmas Icons */}
            <div className="relative w-full max-w-2xl h-64 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-3 gap-8 animate-bounce">
                  <Gift className="text-red-400 w-16 h-16 animate-spin" style={{ animationDuration: '3s' }} />
                  <Snowflake className="text-blue-300 w-16 h-16 animate-spin" style={{ animationDuration: '4s' }} />
                  <Star className="text-yellow-300 w-16 h-16 animate-spin" style={{ animationDuration: '2.5s' }} />
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="grid grid-cols-5 gap-6 mt-32">
                  <Sparkles className="text-pink-300 w-12 h-12 animate-pulse" style={{ animationDelay: '0s' }} />
                  <Candy className="text-red-300 w-12 h-12 animate-pulse" style={{ animationDelay: '0.2s' }} />
                  <Gift className="text-green-300 w-12 h-12 animate-pulse" style={{ animationDelay: '0.4s' }} />
                  <Star className="text-yellow-400 w-12 h-12 animate-pulse" style={{ animationDelay: '0.6s' }} />
                  <Snowflake className="text-cyan-300 w-12 h-12 animate-pulse" style={{ animationDelay: '0.8s' }} />
                </div>
              </div>
              
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-64 h-64 bg-gradient-to-r from-red-500/20 via-green-500/20 to-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              </div>
            </div>
            
            <p className="text-blue-200 text-xl font-semibold animate-pulse">
              Asignando amigos secretos de la familia Josué...
            </p>
            
            {/* Progress bar */}
            <div className="w-full max-w-md mx-auto bg-slate-700/50 rounded-full h-3 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-red-500 via-green-500 to-blue-500 animate-pulse"
                style={{ 
                  animation: 'progress 10s linear forwards',
                  width: '0%'
                }}
              ></div>
            </div>
          </div>
          
          <style>{`
            @keyframes progress {
              from { width: 0%; }
              to { width: 100%; }
            }
          `}</style>
        </div>
      )}
    </div>
  );
}
