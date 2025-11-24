import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { LogOut, Gift, Clock, User } from "lucide-react";
import BibleVerse, { getVerseByTheme } from "@/components/BibleVerse";

interface CountdownState {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [countdown, setCountdown] = useState<CountdownState>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hasAssignment, setHasAssignment] = useState<string | null>(null);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);
  const [showAssignment, setShowAssignment] = useState(false);

  const verse = getVerseByTheme("love");

  useEffect(() => {
    if (user?.role !== "participant") {
      navigate("/");
    }

    // Update countdown every second
    const updateCountdown = () => {
      // December 5, 2025 at 00:00:00
      const drawDate = new Date("2025-12-05T00:00:00").getTime();
      const now = new Date().getTime();
      const diff = drawDate - now;

      if (diff > 0) {
        setCountdown({
          days: Math.floor(diff / (1000 * 60 * 60 * 24)),
          hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((diff / (1000 * 60)) % 60),
          seconds: Math.floor((diff / 1000) % 60),
        });
      } else {
        setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        // Try to fetch assignment if draw date has passed
        fetchAssignment();
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    // Try to fetch assignment on load
    fetchAssignment();

    return () => clearInterval(interval);
  }, [user, navigate]);

  const fetchAssignment = async () => {
    if (!user) return;
    setIsLoadingAssignment(true);
    try {
      const response = await fetch("/api/my-assignment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id }),
      });
      const data = await response.json();
      if (data.assigned) {
        setHasAssignment(data.assigned);
        setShowAssignment(true);
      }
    } catch {
      // Silently fail - assignment might not be available yet
    } finally {
      setIsLoadingAssignment(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const drawDatePassed =
    countdown.days === 0 &&
    countdown.hours === 0 &&
    countdown.minutes === 0 &&
    countdown.seconds === 0;

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
              Panel de Participante
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
        {/* Assignment Card */}
        {showAssignment && hasAssignment ? (
          <Card className="border-2 border-orange-500/40 shadow-lg mb-8 bg-slate-800/70 backdrop-blur-sm">
            <CardHeader className="border-b border-orange-500/20">
              <CardTitle className="text-orange-300 flex items-center gap-2">
                <Gift size={24} className="text-orange-400" />
                ¡Tu Asignación!
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-blue-200 mb-4 font-semibold">
                  Debes comprar un regalo para:
                </p>
                <div className="bg-slate-700/50 rounded-lg shadow-md p-8 inline-block border-2 border-blue-500/30 backdrop-blur-sm">
                  <User size={48} className="mx-auto text-orange-400 mb-4" />
                  <p className="text-4xl font-bold bg-gradient-to-r from-orange-300 to-orange-400 bg-clip-text text-transparent">
                    {hasAssignment}
                  </p>
                </div>
                <p className="text-blue-200 mt-6 text-sm max-w-md mx-auto font-medium">
                  El sorteo ha sido realizado. Tienes asignado a {hasAssignment}
                  . ¡Prepara un regalo especial con mucho amor!
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Waiting Card */}
            <Card className="border-2 border-blue-500/40 shadow-lg mb-8 bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="text-blue-200 flex items-center gap-2">
                  <Clock size={24} className="text-blue-400" />
                  {drawDatePassed
                    ? "El Sorteo Ha Comenzado"
                    : "Contando los Días..."}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="text-center">
                  {drawDatePassed ? (
                    <div className="py-8">
                      <p className="text-blue-200 mb-6 font-medium">
                        El sorteo ya se ha realizado. Tu asignación debería
                        estar disponible pronto.
                      </p>
                      <Button
                        onClick={fetchAssignment}
                        disabled={isLoadingAssignment}
                        className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
                      >
                        {isLoadingAssignment
                          ? "Cargando..."
                          : "Ver Mi Asignación"}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <p className="text-blue-200 mb-12 font-medium text-lg">
                        Falta poco para el sorteo del evento
                      </p>
                      <div className="flex justify-center items-center gap-3 mb-8 flex-wrap">
                        {/* Days */}
                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-xl p-8 shadow-2xl border-2 border-blue-400/50 backdrop-blur-sm min-w-[120px]">
                            <div className="text-6xl font-black bg-gradient-to-r from-blue-200 to-cyan-200 bg-clip-text text-transparent">
                              {String(countdown.days).padStart(2, "0")}
                            </div>
                          </div>
                          <p className="text-blue-300 font-bold mt-3 text-sm uppercase tracking-widest">
                            Días
                          </p>
                        </div>

                        {/* Separator */}
                        <div className="text-3xl text-blue-400/50 font-light self-start mt-6">
                          :
                        </div>

                        {/* Hours */}
                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-xl p-8 shadow-2xl border-2 border-cyan-400/50 backdrop-blur-sm min-w-[120px]">
                            <div className="text-6xl font-black bg-gradient-to-r from-cyan-200 to-blue-200 bg-clip-text text-transparent">
                              {String(countdown.hours).padStart(2, "0")}
                            </div>
                          </div>
                          <p className="text-cyan-300 font-bold mt-3 text-sm uppercase tracking-widest">
                            Horas
                          </p>
                        </div>

                        {/* Separator */}
                        <div className="text-3xl text-cyan-400/50 font-light self-start mt-6">
                          :
                        </div>

                        {/* Minutes */}
                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-br from-purple-600 to-purple-800 rounded-xl p-8 shadow-2xl border-2 border-purple-400/50 backdrop-blur-sm min-w-[120px]">
                            <div className="text-6xl font-black bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">
                              {String(countdown.minutes).padStart(2, "0")}
                            </div>
                          </div>
                          <p className="text-purple-300 font-bold mt-3 text-sm uppercase tracking-widest">
                            Minutos
                          </p>
                        </div>

                        {/* Separator */}
                        <div className="text-3xl text-purple-400/50 font-light self-start mt-6">
                          :
                        </div>

                        {/* Seconds */}
                        <div className="flex flex-col items-center">
                          <div className="bg-gradient-to-br from-orange-600 to-red-800 rounded-xl p-8 shadow-2xl border-2 border-orange-400/50 backdrop-blur-sm min-w-[120px]">
                            <div className="text-6xl font-black bg-gradient-to-r from-orange-200 to-red-200 bg-clip-text text-transparent">
                              {String(countdown.seconds).padStart(2, "0")}
                            </div>
                          </div>
                          <p className="text-orange-300 font-bold mt-3 text-sm uppercase tracking-widest">
                            Segundos
                          </p>
                        </div>
                      </div>
                      <div className="bg-slate-700/70 rounded-lg p-6 shadow-md inline-block border-2 border-blue-500/30 backdrop-blur-sm">
                        <p className="text-blue-200 font-medium">
                          Fecha del evento:{" "}
                          <strong className="text-blue-100">
                            5 de Diciembre de 2025
                          </strong>
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-2 border-blue-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="border-b border-blue-500/20">
                <CardTitle className="text-blue-200">
                  Información del Evento
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900/70 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-500/30">
                      <Gift size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-200">
                        ¿Qué es Amigo Secreto?
                      </h3>
                      <p className="text-blue-300/70 text-sm mt-1">
                        Es un juego donde cada participante debe regalar algo a
                        la persona que le toque en el sorteo, de forma anónima o
                        sorpresa.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900/70 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-500/30">
                      <Clock size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-200">
                        ¿Cuándo se realiza el sorteo?
                      </h3>
                      <p className="text-blue-300/70 text-sm mt-1">
                        El sorteo se realizará el 5 de diciembre de 2025. Una
                        vez realizado, podrás ver a quién le debes comprar el
                        regalo.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-900/70 rounded-lg flex items-center justify-center flex-shrink-0 border-2 border-blue-500/30">
                      <User size={24} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-blue-200">
                        ¿Cómo participo?
                      </h3>
                      <p className="text-blue-300/70 text-sm mt-1">
                        Ya estás registrado. Solo espera a que se realice el
                        sorteo y verás a quién te tocó en esta página.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
