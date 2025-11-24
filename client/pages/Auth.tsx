import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import type { LoginRequest, RegisterRequest, UserRole } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>("participant");
  const navigate = useNavigate();
  const { login } = useAuth();

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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent mb-2">
            Amigo Secreto
          </h1>
          <p className="text-gray-600">Sistema de Sorteo</p>
        </div>

        <Card className="shadow-lg border-0">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl">
              {isLogin ? "Iniciar Sesión" : "Registro"}
            </CardTitle>
            <CardDescription>
              {isLogin
                ? "Ingresa con tu cuenta para continuar"
                : "Crea una nueva cuenta para participar"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form
              onSubmit={isLogin ? handleLogin : handleRegister}
              className="space-y-4"
            >
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">
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
                    <label className="text-sm font-medium text-gray-700">
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
                    <label className="text-sm font-medium text-gray-700">
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
                          className="mr-2"
                        />
                        <span className="text-sm">Participante</span>
                      </label>
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          value="admin"
                          checked={role === "admin"}
                          onChange={(e) =>
                            setRole(e.target.value as UserRole)
                          }
                          className="mr-2"
                        />
                        <span className="text-sm">Administrador</span>
                      </label>
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Correo Electrónico
                </label>
                <Input
                  type="email"
                  name="email"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Contraseña
                </label>
                <Input
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="border-gray-300"
                />
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white font-semibold py-2 rounded-lg transition-all"
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
                className="w-full text-center text-sm text-gray-600 hover:text-gray-900 font-medium"
              >
                {isLogin
                  ? "¿No tienes cuenta? Regístrate aquí"
                  : "¿Ya tienes cuenta? Inicia sesión"}
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs text-gray-500 text-center mb-4">
                Cuenta de prueba:
              </p>
              <div className="bg-gray-50 p-3 rounded-lg space-y-1 text-xs">
                <p className="text-gray-700">
                  <strong>Admin:</strong> admin@amigosecreto.com / admin123
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
