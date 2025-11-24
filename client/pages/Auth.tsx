import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { LoginRequest, RegisterRequest, UserRole } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import BibleVerse, { getVerseByTheme } from "@/components/BibleVerse";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>("participant");
  const navigate = useNavigate();
  const { login } = useAuth();

  const verse = getVerseByTheme("christmas");

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        } as LoginRequest),
      });

      const data = await response.json();

      if (data.success && data.user) {
        login(data.user);
        toast.success("¡Iniciado sesión correctamente!");
        navigate(data.user.role === "admin" ? "/admin" : "/participant");
      } else {
        toast.error(data.message || "Error al iniciar sesión");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role,
        } as RegisterRequest),
      });

      const data = await response.json();

      if (data.success && data.user) {
        login(data.user);
        toast.success("¡Registro completado!");
        navigate(data.user.role === "admin" ? "/admin" : "/participant");
      } else {
        toast.error(data.message || "Error al registrarse");
      }
    } catch {
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-yellow-50 to-green-50 flex flex-col items-center justify-center p-4">
      {/* Header with group name */}
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-emerald-700 to-green-700 bg-clip-text text-transparent mb-2">
          Familia Josué
        </h1>
        <p className="text-emerald-800 font-semibold text-lg mb-4">
          Sistema de Sorteo - Amigo Secreto
        </p>
        <BibleVerse verse={verse.verse} reference={verse.reference} className="max-w-2xl mx-auto" />
      </div>

      {/* Auth Card */}
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-2 border-green-200">
          <CardHeader className="space-y-1 bg-gradient-to-r from-green-50 to-yellow-50">
            <CardTitle className="text-2xl text-emerald-900">
              {isLogin ? "Iniciar Sesión" : "Registro"}
            </CardTitle>
            <CardDescription className="text-emerald-700">
              {isLogin
                ? "Ingresa con tu cuenta para continuar"
                : "Crea una nueva cuenta para participar"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-900">
                      Nombre Completo
                    </label>
                    <Input
                      type="text"
                      name="name"
                      placeholder="Tu nombre completo"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-900">
                      Teléfono
                    </label>
                    <Input
                      type="tel"
                      name="phone"
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-emerald-900">
                      Tipo de Cuenta
                    </label>
                    <div className="flex gap-4">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="participant"
                          checked={role === "participant"}
                          onChange={(e) =>
                            setRole(e.target.value as UserRole)
                          }
                          className="mr-2 accent-emerald-700"
                        />
                        <span className="text-sm text-emerald-800">Participante</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="admin"
                          checked={role === "admin"}
                          onChange={(e) =>
                            setRole(e.target.value as UserRole)
                          }
                          className="mr-2 accent-emerald-700"
                        />
                        <span className="text-sm text-emerald-800">Administrador</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-900">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-emerald-900">
                  Contraseña
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-emerald-700 to-green-700 hover:from-emerald-800 hover:to-green-800 text-white font-semibold py-2 rounded-lg transition-all"
              >
                {isLoading
                  ? "Procesando..."
                  : isLogin
                    ? "Iniciar Sesión"
                    : "Registrarse"}
              </Button>
            </form>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setFormData({ email: "", password: "", name: "", phone: "" });
                }}
                className="w-full text-center text-sm text-emerald-700 hover:text-emerald-900 font-medium"
              >
                {isLogin
                  ? "¿No tienes cuenta? Regístrate aquí"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-green-200">
              <p className="text-xs text-emerald-700 text-center mb-4 font-semibold">
                Cuenta de prueba:
              </p>
              <div className="bg-green-50 p-3 rounded-lg space-y-1 text-xs border border-green-200">
                <p className="text-emerald-800">
                  <strong>Admin:</strong> admin@amigosecreto.com / admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer with verse */}
      <div className="mt-12 text-center max-w-2xl">
        <p className="text-xs text-emerald-700 mb-2">Bendiciones para "Familia Josué"</p>
        <p className="text-sm italic text-emerald-600">
          "Que la paz de Cristo reine en vuestros corazones, a la cual asimismo fuisteis llamados en un solo cuerpo."
        </p>
        <p className="text-xs text-emerald-700 mt-1">Colosenses 3:15</p>
      </div>
    </div>
  );
}
