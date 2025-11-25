import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { API_ENDPOINTS } from "@/lib/api";
import type { LoginRequest, RegisterRequest, SendAccessCodeRequest } from "@shared/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import BibleVerse from "@/components/BibleVerse";
import {
  SkeletonText,
  SkeletonInput,
  SkeletonButton,
} from "@/components/SkeletonLoader";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [useAccessCode, setUseAccessCode] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    phone: "",
    password: "",
    name: "",
    accessCode: "",
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && codeSent) {
      setCodeSent(false);
    }
  }, [countdown, codeSent]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSendAccessCode = async () => {
    if (!formData.phone) {
      toast.error("Por favor ingresa tu número de teléfono");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(API_ENDPOINTS.SEND_ACCESS_CODE, {
        method: "POST",
        headers: { 
          "accept": "application/json",
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          numeroTelefono: formData.phone,
        } as SendAccessCodeRequest),
      });

      const data = await response.json();

      if (data.success) {
        setCodeSent(true);
        setCountdown(300); // 5 minutos
        toast.success("¡Código enviado por WhatsApp!");
      } else {
        toast.error(data.error || data.message || "Error al enviar el código");
      }
    } catch (error) {
      console.error("Error al enviar código:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const loginData: LoginRequest = {
        numeroTelefono: formData.phone,
      };

      if (useAccessCode) {
        if (!formData.accessCode) {
          toast.error("Por favor ingresa el código de acceso");
          setIsLoading(false);
          return;
        }
        loginData.codigoAcceso = formData.accessCode;
      } else {
        if (!formData.password) {
          toast.error("Por favor ingresa tu contraseña");
          setIsLoading(false);
          return;
        }
        loginData.contrasena = formData.password;
      }

      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: "POST",
        headers: { 
          "accept": "application/json",
          "Content-Type": "application/json" 
        },
        body: JSON.stringify(loginData),
      });

      const data = await response.json();

      if (data.success && data.data) {
        login(data.data);
        toast.success("¡Iniciado sesión correctamente!");
        navigate(data.data.esAdmin ? "/admin" : "/participant");
      } else {
        toast.error(data.error || data.message || "Error al iniciar sesión");
      }
    } catch (error) {
      console.error("Error de login:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: "POST",
        headers: { 
          "accept": "application/json",
          "Content-Type": "application/json" 
        },
        body: JSON.stringify({
          nombreCompleto: formData.name,
          numeroTelefono: formData.phone,
          contrasena: formData.password,
          esAdmin: false,
        } as RegisterRequest),
      });

      const data = await response.json();

      if (data.success && data.data) {
        login(data.data);
        toast.success("¡Registro completado!");
        navigate(data.data.esAdmin ? "/admin" : "/participant");
      } else {
        toast.error(data.error || data.message || "Error al registrarse");
      }
    } catch (error) {
      console.error("Error de registro:", error);
      toast.error("Error de conexión");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Content Container */}
      <div className="w-full max-w-md">
        {/* Header with group name */}
        <div className="text-center mb-5">
          <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-400 via-blue-300 to-cyan-400 bg-clip-text text-transparent mb-1">
            Familia Josué
          </h1>
          <p className="text-blue-200 font-semibold text-xs md:text-sm mb-3">
            Sistema de Sorteo - Amigo Secreto
          </p>
          <BibleVerse className="text-blue-100" />
        </div>

        {/* Auth Card */}
        <div className="w-full">
          <Card className="shadow-2xl border-2 border-blue-500/30 bg-slate-900/95 backdrop-blur-sm">
            <CardHeader className="space-y-1 bg-gradient-to-r from-blue-900/50 to-slate-900/50 border-b border-blue-500/20">
              <CardTitle className="text-lg md:text-xl bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
                {isLogin ? "Iniciar Sesión" : "Registro"}
              </CardTitle>
              <CardDescription className="text-blue-200 text-xs md:text-sm">
                {isLogin
                  ? "Ingresa con tu cuenta para continuar"
                  : "Crea una nueva cuenta para participar"}
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-6">
              {isLoading ? (
                <div className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-2">
                        <SkeletonText width="w-1/3" height="h-4" />
                        <SkeletonInput />
                      </div>
                      <div className="space-y-2">
                        <SkeletonText width="w-1/4" height="h-4" />
                        <SkeletonInput />
                      </div>
                      <div className="space-y-2">
                        <SkeletonText width="w-1/4" height="h-4" />
                        <SkeletonInput />
                      </div>
                    </>
                  )}
                  <div className="space-y-2">
                    <SkeletonText width="w-1/3" height="h-4" />
                    <SkeletonInput />
                  </div>
                  <div className="space-y-2">
                    <SkeletonText width="w-1/3" height="h-4" />
                    <SkeletonInput />
                  </div>
                  <SkeletonButton />
                </div>
              ) : (
                <form
                  onSubmit={isLogin ? handleLogin : handleRegister}
                  className="space-y-4"
                >
                  {/* REGISTRO - Campos de registro */}
                  {!isLogin && (
                    <>
                      <div className="space-y-1">
                        <label className="text-xs md:text-sm font-medium text-blue-200">
                          Nombre Completo
                        </label>
                        <Input
                          type="text"
                          name="name"
                          placeholder="Tu nombre completo"
                          value={formData.name}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-blue-500/30 text-blue-50 placeholder-blue-400/50 focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs md:text-sm font-medium text-blue-200">
                          Número de Teléfono
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          placeholder="987654321"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-blue-500/30 text-blue-50 placeholder-blue-400/50 focus:border-blue-400"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs md:text-sm font-medium text-blue-200">
                          Contraseña
                        </label>
                        <Input
                          type="password"
                          name="password"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-blue-500/30 text-blue-50 placeholder-blue-400/50 focus:border-blue-400"
                        />
                      </div>
                    </>
                  )}

                  {/* LOGIN - Selector de método PRIMERO */}
                  {isLogin && (
                    <>
                      <div className="flex gap-2 p-1 bg-slate-800/50 rounded-lg border border-blue-500/30">
                        <button
                          type="button"
                          onClick={() => {
                            setUseAccessCode(false);
                            setFormData({ ...formData, password: "", accessCode: "" });
                          }}
                          className={`flex-1 py-2 px-3 rounded-md text-xs md:text-sm font-medium transition-all ${
                            !useAccessCode
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                              : "text-blue-300 hover:text-blue-100"
                          }`}
                        >
                          🔑 Contraseña
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setUseAccessCode(true);
                            setFormData({ ...formData, password: "", accessCode: "" });
                          }}
                          className={`flex-1 py-2 px-3 rounded-md text-xs md:text-sm font-medium transition-all ${
                            useAccessCode
                              ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg"
                              : "text-blue-300 hover:text-blue-100"
                          }`}
                        >
                          📱 Código WhatsApp
                        </button>
                      </div>

                      {/* Número de teléfono para ambos métodos */}
                      <div className="space-y-1">
                        <label className="text-xs md:text-sm font-medium text-blue-200">
                          Número de Teléfono
                        </label>
                        <Input
                          type="tel"
                          name="phone"
                          placeholder="987654321"
                          value={formData.phone}
                          onChange={handleInputChange}
                          required
                          className="bg-slate-800/50 border-blue-500/30 text-blue-50 placeholder-blue-400/50 focus:border-blue-400"
                        />
                      </div>

                      {/* MÉTODO 1: Contraseña */}
                      {!useAccessCode && (
                        <div className="space-y-1">
                          <label className="text-xs md:text-sm font-medium text-blue-200">
                            Contraseña
                          </label>
                          <Input
                            type="password"
                            name="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={handleInputChange}
                            required
                            className="bg-slate-800/50 border-blue-500/30 text-blue-50 placeholder-blue-400/50 focus:border-blue-400"
                          />
                        </div>
                      )}

                      {/* MÉTODO 2: Código WhatsApp */}
                      {useAccessCode && (
                        <div className="space-y-3">
                          {/* Instrucciones */}
                          <div className="bg-blue-900/30 border border-blue-500/30 rounded-lg p-3">
                            <p className="text-xs text-blue-200">
                              <strong>Paso 1:</strong> Solicita tu código presionando "📱 Enviar Código"
                            </p>
                            <p className="text-xs text-blue-200 mt-1">
                              <strong>Paso 2:</strong> Ingresa el código que recibiste por WhatsApp
                            </p>
                            <p className="text-xs text-blue-200 mt-1">
                              <strong>Paso 3:</strong> Presiona "Iniciar Sesión con Código"
                            </p>
                          </div>

                          {/* Botón para solicitar código */}
                          <Button
                            type="button"
                            onClick={handleSendAccessCode}
                            disabled={isLoading || countdown > 0 || !formData.phone}
                            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold"
                          >
                            {countdown > 0 
                              ? `Reenviar en ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                              : "📱 Enviar Código por WhatsApp"}
                          </Button>

                          {codeSent && (
                            <div className="flex items-center gap-2 text-xs text-green-400 bg-green-950/30 border border-green-500/30 rounded-lg p-2">
                              <span>✓</span>
                              <span>Código enviado por WhatsApp exitosamente</span>
                            </div>
                          )}

                          {/* Input para el código */}
                          <div className="space-y-1">
                            <label className="text-xs md:text-sm font-medium text-blue-200">
                              Código de Acceso
                            </label>
                            <Input
                              type="text"
                              name="accessCode"
                              placeholder="Ingresa el código de 6 dígitos"
                              value={formData.accessCode}
                              onChange={handleInputChange}
                              required
                              maxLength={6}
                              disabled={!codeSent}
                              className="bg-slate-800/50 border-blue-500/30 text-blue-50 placeholder-blue-400/50 focus:border-blue-400 disabled:opacity-50"
                            />
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  <Button
                    type="submit"
                    disabled={isLoading || (isLogin && useAccessCode && !codeSent)}
                    className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-2 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading
                      ? "Procesando..."
                      : isLogin
                        ? useAccessCode
                          ? "Iniciar Sesión con Código"
                          : "Iniciar Sesión con Contraseña"
                        : "Registrarse"}
                  </Button>
                  
                  {isLogin && useAccessCode && !codeSent && (
                    <p className="text-xs text-center text-blue-300/70 -mt-2">
                      Primero debes solicitar un código presionando "Enviar"
                    </p>
                  )}
                </form>
              )}

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-blue-500/30" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-slate-900/90 px-2 text-blue-400">
                      {isLogin ? "¿No tienes cuenta?" : "¿Ya tienes cuenta?"}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setIsLogin(!isLogin);
                    setFormData({
                      phone: "",
                      password: "",
                      name: "",
                      accessCode: "",
                    });
                  }}
                  className="w-full mt-4 px-4 py-2.5 text-sm font-semibold text-blue-200 bg-blue-900/30 border-2 border-blue-500/40 rounded-lg hover:bg-blue-900/50 hover:border-blue-400/60 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
                >
                  {isLogin ? "Crear cuenta nueva" : "Iniciar sesión"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer with verse */}
        <div className="mt-6 md:mt-8 text-center">
          <p className="text-xs text-blue-300 mb-1">
            Bendiciones para "Familia Josué"
          </p>
          <p className="text-xs md:text-sm italic text-blue-200">
            "Que la paz de Cristo reine en vuestros corazones, a la cual
            asimismo fuisteis llamados en un solo cuerpo."
          </p>
          <p className="text-xs text-blue-300 mt-1">Colosenses 3:15</p>
        </div>
      </div>
    </div>
  );
}
