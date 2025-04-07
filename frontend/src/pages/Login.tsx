import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        localStorage.setItem("userEmail", email);
        alert("Login bem-sucedido!");

        setTimeout(() => {
          navigate("/timeline");
        }, 4000);
      } else {
        alert("Erro: " + data.detail);
        setIsLoading(false);
      }
    } catch (error: any) {
      alert("Erro de conexão: " + error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-azul-cremoso-DEFAULT">
          <div className="bg-gradient-to-r from-azul-cremoso-DEFAULT to-azul-cremoso-dark p-8 text-center">
            <h1 className="text-3xl font-bold text-[#4a7bc1]">Bem-vindo ao Jubileu</h1>
            <p className="text-[#7aaae8]/90 mt-2">Faça login para continuar</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[#4a7bc1] block text-sm font-medium text-azul-texto">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-3 rounded-lg border border-azul-cremoso-DEFAULT focus:ring-2 focus:ring-azul-cremoso-dark focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="password" className="text-[#4a7bc1] block text-sm font-medium text-azul-texto">
                Senha
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-5 py-3 rounded-lg border border-azul-cremoso-DEFAULT focus:ring-2 focus:ring-azul-cremoso-dark focus:border-transparent transition-all"
                required
              />

              <div className="text-right pt-1">
                <Link 
                  to="/recuperar-senha" 
                  className="text-sm text-azul-cremoso-dark hover:text-azul-texto hover:underline transition-colors"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${
                isLoading 
                  ? "bg-azul-cremoso-DEFAULT cursor-not-allowed" 
                  : "bg-azul-cremoso-dark hover:bg-azul-texto hover:shadow-lg"
              }`}
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Redirecionando...
                </span>
              ) : (
                "Entrar"
              )}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-[#7aaae8]">
                Não tem uma conta?{" "}
                <Link 
                  to="/cadastro" 
                  className="text-right font-semibold text-azul-cremoso-dark hover:text-azul-texto hover:underline transition-colors"
                >
                  Cadastre-se
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
