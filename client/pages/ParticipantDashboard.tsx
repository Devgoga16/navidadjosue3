import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import type { MiAmigoSecretoResponse, EncuestaRequest, EncuestaVerificarResponse, EncuestaAmigoSecretoResponse } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { LogOut, Gift, User, ClipboardList, Heart } from "lucide-react";
import BibleVerse from "@/components/BibleVerse";

interface AmigoSecreto {
  _id: string;
  nombreCompleto: string;
  numeroTelefono: string;
}

export default function ParticipantDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [amigoSecreto, setAmigoSecreto] = useState<AmigoSecreto | null>(null);
  const [isLoadingAssignment, setIsLoadingAssignment] = useState(false);
  const [sorteoRealizado, setSorteoRealizado] = useState(false);
  const [assignmentFetched, setAssignmentFetched] = useState(false);
  
  // Encuesta del amigo secreto
  const [encuestaAmigoSecreto, setEncuestaAmigoSecreto] = useState<EncuestaAmigoSecretoResponse['data'] | null>(null);
  const [isLoadingEncuestaAmigo, setIsLoadingEncuestaAmigo] = useState(false);
  const [encuestaAmigoFetched, setEncuestaAmigoFetched] = useState(false);
  
  // Encuesta states
  const [encuestaEnviada, setEncuestaEnviada] = useState(false);
  const [isLoadingEncuesta, setIsLoadingEncuesta] = useState(false);
  const [isVerificandoEncuesta, setIsVerificandoEncuesta] = useState(true);
  const [encuestaVerificada, setEncuestaVerificada] = useState(false);
  const [encuestaData, setEncuestaData] = useState({
    gustosActuales: "",
    colorFavorito: "",
    tipoRegalo: "",
    quiereProbar: "",
    tallaRopa: "",
  });

  useEffect(() => {
    if (user?.esAdmin) {
      navigate("/admin");
      return;
    }

    // Try to fetch assignment on load only once
    if (!assignmentFetched) {
      fetchAssignment();
      setAssignmentFetched(true);
    }
    
    // Verificar si ya completó la encuesta (solo una vez)
    if (!encuestaVerificada) {
      verificarEncuesta();
      setEncuestaVerificada(true);
    }
  }, [user, navigate]);

  const verificarEncuesta = async () => {
    if (!user?._id) return;
    setIsVerificandoEncuesta(true);
    try {
      const response = await fetch(API_ENDPOINTS.ENCUESTA_VERIFICAR(user._id), {
        method: "GET",
        headers: { "accept": "application/json" },
      });
      const data: EncuestaVerificarResponse = await response.json();
      
      if (data.success && data.data?.completada && data.data.respuestas) {
        setEncuestaEnviada(true);
        setEncuestaData(data.data.respuestas);
      }
    } catch (error) {
      console.error("Error al verificar encuesta:", error);
    } finally {
      setIsVerificandoEncuesta(false);
    }
  };

  const fetchAssignment = async () => {
    if (!user?._id) return;
    setIsLoadingAssignment(true);
    try {
      const response = await fetch(API_ENDPOINTS.MI_AMIGO_SECRETO(user._id), {
        method: "GET",
        headers: { "accept": "application/json" },
      });
      const data: MiAmigoSecretoResponse = await response.json();
      
      if (data.success && data.data) {
        setAmigoSecreto(data.data.amigoSecreto);
        setSorteoRealizado(true);
        // Fetch secret friend's survey after getting assignment (only once)
        if (!encuestaAmigoFetched) {
          fetchEncuestaAmigoSecreto();
          setEncuestaAmigoFetched(true);
        }
      } else {
        // Sorteo no realizado todavía
        setAmigoSecreto(null);
        setSorteoRealizado(false);
      }
    } catch (error) {
      console.error("Error al obtener amigo secreto:", error);
      // Silently fail - assignment might not be available yet
    } finally {
      setIsLoadingAssignment(false);
    }
  };

  const fetchEncuestaAmigoSecreto = async () => {
    if (!user?._id) return;
    setIsLoadingEncuestaAmigo(true);
    try {
      console.log('se esta llamando')
      const response = await fetch(API_ENDPOINTS.ENCUESTA_AMIGO_SECRETO(user._id), {
        method: "GET",
        headers: { "accept": "application/json" },
      });
      const data: EncuestaAmigoSecretoResponse = await response.json();
      
      if (data.success && data.data) {
        setEncuestaAmigoSecreto(data.data);
      }
    } catch (error) {
      console.error("Error al obtener encuesta del amigo secreto:", error);
    } finally {
      setIsLoadingEncuestaAmigo(false);
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  const handleEncuestaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEncuestaData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEncuesta = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?._id) return;

    setIsLoadingEncuesta(true);
    try {
      const requestData: EncuestaRequest = {
        userId: user._id,
        ...encuestaData,
      };

      const response = await fetch(API_ENDPOINTS.ENCUESTA, {
        method: "POST",
        headers: {
          "accept": "*/*",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestData),
      });

      const data = await response.json();

      if (data.success) {
        setEncuestaEnviada(true);
        toast.success("¡Encuesta enviada exitosamente!");
      } else {
        toast.error(data.error || data.message || "Error al enviar la encuesta");
      }
    } catch (error) {
      console.error("Error al enviar encuesta:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoadingEncuesta(false);
    }
  };

  const hasAssignmentData = Boolean(sorteoRealizado && amigoSecreto);

  return (
    <div className="min-h-screen bg-transparent">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-900/80 to-slate-900/80 shadow-lg border-b-4 border-blue-500/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 md:px-6 md:py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Familia Josué
            </h1>
            <p className="text-blue-200 font-semibold text-sm mt-0.5">
              Participante
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
        {/* Assignment Card */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-4 md:mb-6">
            {/* Left: Tu Asignación */}
            <Card className="border-2 border-orange-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
              <CardHeader className="border-b border-orange-500/20 pb-2">
                <CardTitle className="text-orange-300 flex items-center gap-2 text-sm md:text-base">
                  <Gift size={20} className="text-orange-400" />
                  ¡Tu Asignación!
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-3 md:pt-6">
                {isLoadingAssignment && !hasAssignmentData ? (
                  <div className="py-6 space-y-6">
                    <Skeleton className="h-4 w-48 bg-slate-600/60 mx-auto" />
                    <div className="bg-slate-700/50 rounded-lg shadow-md p-6 border-2 border-slate-600/40 backdrop-blur-sm">
                      <Skeleton className="h-10 w-10 rounded-full bg-slate-600/60 mx-auto mb-4" />
                      <Skeleton className="h-8 w-3/4 bg-slate-600/60 mx-auto" />
                      <Skeleton className="h-4 w-1/2 bg-slate-600/60 mx-auto mt-3" />
                    </div>
                    <Skeleton className="h-3 w-64 bg-slate-600/60 mx-auto" />
                  </div>
                ) : (
                  <div className="text-center py-4 md:py-8">
                    <p className="text-blue-200 mb-3 md:mb-4 font-semibold text-sm">
                      Tu amigo(a) secreto es:
                    </p>
                    <div className="bg-slate-700/50 rounded-lg shadow-md p-4 md:p-8 inline-block border-2 border-blue-500/30 backdrop-blur-sm">
                      <User
                        size={32}
                        className="mx-auto text-orange-400 mb-2 md:mb-4"
                      />
                      <p className="text-2xl md:text-4xl font-bold bg-gradient-to-r from-orange-300 to-orange-400 bg-clip-text text-transparent">
                        {amigoSecreto?.nombreCompleto}
                      </p>
                      <p className="text-blue-300 mt-2 text-sm">
                        {amigoSecreto?.numeroTelefono}
                      </p>
                    </div>
                    {amigoSecreto && (
                      <p className="text-blue-200 mt-4 md:mt-6 text-xs md:text-sm max-w-md mx-auto font-medium">
                        El sorteo ha sido realizado. Tienes asignado a {amigoSecreto.nombreCompleto}. ¡Prepara un regalo especial!
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Right: Encuesta del Amigo Secreto */}
            {hasAssignmentData && (
              <Card className="border-2 border-pink-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
                <CardHeader className="border-b border-pink-500/20 pb-2">
                  <CardTitle className="text-pink-300 flex items-center gap-2 text-sm md:text-base">
                    <Heart size={20} className="text-pink-400" />
                    Preferencias de {amigoSecreto?.nombreCompleto}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-4">
                  {isLoadingEncuestaAmigo ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 gap-3">
                        {[1, 2, 3, 4, 5].map((item) => (
                          <div key={item} className="bg-slate-900/50 rounded-lg p-3 border border-pink-500/10">
                            <Skeleton className="h-3 w-1/3 bg-slate-600/60 mb-2" />
                            <Skeleton className="h-4 w-full bg-slate-600/60" />
                          </div>
                        ))}
                      </div>
                      <Skeleton className="h-3 w-32 bg-slate-600/60" />
                    </div>
                  ) : encuestaAmigoSecreto ? (
                    <div className="space-y-4">
                      <p className="text-blue-300/80 text-sm mb-4">
                        Tu amigo secreto ha compartido sus preferencias para ayudarte a elegir el regalo perfecto:
                      </p>
                      
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-pink-500/20">
                        <label className="text-pink-300 font-semibold text-xs mb-1 block">
                          Gustos Actuales
                        </label>
                        <p className="text-blue-200 text-xs whitespace-pre-wrap">
                          {encuestaAmigoSecreto.gustosActuales || "No especificado"}
                        </p>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3 border border-pink-500/20">
                        <label className="text-pink-300 font-semibold text-xs mb-1 block">
                          Color Favorito
                        </label>
                        <p className="text-blue-200 text-xs">
                          {encuestaAmigoSecreto.colorFavorito || "No especificado"}
                        </p>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3 border border-pink-500/20">
                        <label className="text-pink-300 font-semibold text-xs mb-1 block">
                          Tipo de Regalo Preferido
                        </label>
                        <p className="text-blue-200 text-xs">
                          {encuestaAmigoSecreto.tipoRegalo || "No especificado"}
                        </p>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3 border border-pink-500/20">
                        <label className="text-pink-300 font-semibold text-xs mb-1 block">
                          Cosas que Quiere Probar
                        </label>
                        <p className="text-blue-200 text-xs whitespace-pre-wrap">
                          {encuestaAmigoSecreto.quiereProbar || "No especificado"}
                        </p>
                      </div>

                      <div className="bg-slate-900/50 rounded-lg p-3 border border-pink-500/20">
                        <label className="text-pink-300 font-semibold text-xs mb-1 block">
                          Talla de Ropa
                        </label>
                        <p className="text-blue-200 text-xs">
                          {encuestaAmigoSecreto.tallaRopa || "No especificado"}
                        </p>
                      </div>

                      <p className="text-blue-300/60 text-xs mt-4 italic">
                        Encuesta completada el {new Date(encuestaAmigoSecreto.fechaCompletada).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-blue-300/70 text-sm">
                        Tu amigo secreto aún no ha completado la encuesta de preferencias.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

        {/* Encuesta Card */}
        <Card className="border-2 border-purple-500/40 shadow-lg bg-slate-800/70 backdrop-blur-sm">
          <CardHeader className="border-b border-purple-500/20 pb-2">
            <CardTitle className="text-purple-300 flex items-center gap-2 text-sm md:text-base">
              <ClipboardList size={20} className="text-purple-400" />
              Encuesta de Preferencias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {isVerificandoEncuesta ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-blue-300/70 text-sm">Cargando encuesta...</p>
              </div>
            ) : encuestaEnviada ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-green-500/40">
                  <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-green-400 font-semibold mb-2">¡Encuesta completada!</p>
                <p className="text-blue-300/70 text-sm">
                  Gracias por compartir tus preferencias. Esto ayudará a tu amigo secreto a elegir el regalo perfecto para ti.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitEncuesta} className="space-y-4">
                <p className="text-blue-200 text-sm mb-4">
                  Ayuda a tu amigo secreto a conocerte mejor respondiendo estas preguntas:
                </p>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-blue-200">
                    1. ¿Qué cosas te gustan actualmente?
                    <span className="text-blue-400/70 font-normal ml-1">(música, películas, hobbies, comida, etc.)</span>
                  </label>
                  <Textarea
                    name="gustosActuales"
                    value={encuestaData.gustosActuales}
                    onChange={handleEncuestaChange}
                    placeholder="Ejemplo: Me gusta el rock, las películas de acción y cocinar"
                    required
                    className="bg-slate-800/50 border-purple-500/30 text-blue-50 placeholder-blue-400/50 focus:border-purple-400 min-h-[80px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-blue-200">
                    2. ¿Cuál es tu color favorito?
                  </label>
                  <Input
                    type="text"
                    name="colorFavorito"
                    value={encuestaData.colorFavorito}
                    onChange={handleEncuestaChange}
                    placeholder="Ejemplo: Azul"
                    required
                    className="bg-slate-800/50 border-purple-500/30 text-blue-50 placeholder-blue-400/50 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-blue-200">
                    3. ¿Prefieres regalos útiles o detalles más creativos/sorpresa?
                  </label>
                  <Input
                    type="text"
                    name="tipoRegalo"
                    value={encuestaData.tipoRegalo}
                    onChange={handleEncuestaChange}
                    placeholder="Ejemplo: Prefiero regalos útiles"
                    required
                    className="bg-slate-800/50 border-purple-500/30 text-blue-50 placeholder-blue-400/50 focus:border-purple-400"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-blue-200">
                    4. ¿Hay algo que te gustaría empezar a usar o probar?
                    <span className="text-blue-400/70 font-normal ml-1">(un nuevo hobby, algún accesorio, etc.)</span>
                  </label>
                  <Textarea
                    name="quiereProbar"
                    value={encuestaData.quiereProbar}
                    onChange={handleEncuestaChange}
                    placeholder="Ejemplo: Me gustaría probar yoga"
                    required
                    className="bg-slate-800/50 border-purple-500/30 text-blue-50 placeholder-blue-400/50 focus:border-purple-400 min-h-[60px]"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs md:text-sm font-medium text-blue-200">
                    5. ¿Cuál es tu talla de polo o prenda superior?
                  </label>
                  <Input
                    type="text"
                    name="tallaRopa"
                    value={encuestaData.tallaRopa}
                    onChange={handleEncuestaChange}
                    placeholder="Ejemplo: M, L, XL"
                    required
                    className="bg-slate-800/50 border-purple-500/30 text-blue-50 placeholder-blue-400/50 focus:border-purple-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isLoadingEncuesta}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold"
                >
                  {isLoadingEncuesta ? "Enviando..." : "Enviar Encuesta"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
