import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            404
          </h1>
          <h2 className="text-2xl font-bold text-blue-200 mb-2">
            Página no encontrada
          </h2>
          <p className="text-blue-300 mb-8 max-w-md mx-auto">
            La página que buscas no existe. Por favor, verifica la URL o regresa
            al inicio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold"
            size="lg"
          >
            Ir al Inicio
          </Button>

          {user && (
            <Button
              onClick={() =>
                navigate(user.role === "admin" ? "/admin" : "/participant")
              }
              variant="outline"
              size="lg"
              className="font-semibold text-blue-300 border-blue-400 hover:bg-blue-900/50"
            >
              Volver al Panel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
