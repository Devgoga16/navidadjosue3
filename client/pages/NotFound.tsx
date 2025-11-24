import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";

export default function NotFound() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-red-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-7xl font-bold bg-gradient-to-r from-amber-700 to-red-700 bg-clip-text text-transparent mb-2">
            404
          </h1>
          <h2 className="text-2xl font-bold text-red-900 mb-2">
            Página no encontrada
          </h2>
          <p className="text-red-700 mb-8 max-w-md mx-auto">
            La página que buscas no existe. Por favor, verifica la URL o regresa
            al inicio.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={() => navigate("/")}
            className="bg-gradient-to-r from-amber-700 to-red-700 hover:from-amber-800 hover:to-red-800 text-white font-semibold"
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
              className="font-semibold text-red-700 border-red-300 hover:bg-red-50"
            >
              Volver al Panel
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
