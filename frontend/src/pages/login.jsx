import { useState } from "react";
import { Link } from "react-router-dom"; // Importe o componente Link se estiver usando React Router

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
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
        alert("Login bem-sucedido!");
      } else {
        alert("Erro: " + data.detail);
      }
    } catch (error) {
      alert("Erro de conexão: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f8ff] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-[#e6f2ff]">
          <div className="bg-[#d9ecff] p-6 text-center">
            <h1 className="text-2xl font-bold text-[#2a4a6e]">Bem-vindo de volta</h1>
          </div>
          
          <form onSubmit={handleSubmit} className="p-6">
            <div className="mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-[#4a6b8a] mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-6 py-3 rounded-lg border border-[#cce0ff] focus:ring-2 focus:ring-[#a3c8ff] focus:border-transparent"
                required
              />
            </div>
            
            <div className="mb-6">
              <label htmlFor="password" className="block text-sm font-medium text-[#4a6b8a] mb-2">
                Senha
              </label>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-[#cce0ff] focus:ring-2 focus:ring-[#a3c8ff] focus:border-transparent"
                required
              />
              
              {/* Link para recuperar senha */}
              <div className="text-right mt-2">
                <Link 
                  to="/recuperar-senha" 
                  className="text-sm text-[#5d8fd6] hover:text-[#4a7bc1] hover:underline"
                >
                  Esqueceu sua senha?
                </Link>
              </div>
            </div>

            <div className="mb-6">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3 px-4 rounded-lg font-medium text-white ${
                  isLoading ? "bg-[#a3c8ff]" : "bg-[#7aaae8] hover:bg-[#5d8fd6]"
                }`}
              >
                {isLoading ? "Processando..." : "Entrar"}
              </button>
            </div>

            {/* Link para cadastro */}
            <div className="text-center">
              <p className="text-sm text-[#4a6b8a]">
                Não tem uma conta?{" "}
                <Link 
                  to="/cadastro" 
                  className="font-medium text-[#5d8fd6] hover:text-[#4a7bc1] hover:underline"
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