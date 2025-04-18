import { useState } from "react";
import { useNavigate } from "react-router-dom";

const RegisterPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:8000/api/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("Cadastro realizado com sucesso!");
        navigate("/login");
      } else {
        const data = await response.json();
        setError(data.detail || "Erro ao cadastrar.");
      }
    } catch (err: any) {
      const data = await err.response?.json?.();
      setError(data?.detail || "Erro de conexão.");
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-azul-cremoso-DEFAULT">
          <div className="bg-gradient-to-r from-azul-cremoso-DEFAULT to-azul-cremoso-dark p-8 text-center">
            <h1 className="text-3xl font-bold text-[#4a7bc1]">Crie sua conta</h1>
            <p className="text-[#7aaae8]/90 mt-2">Preencha os dados abaixo</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {Array.isArray(error) ? (
              error.map((e: any, i) => (
                <p key={i} className="text-red-500 text-sm">{e.msg}</p>
              ))
            ) : (
              error && <p className="text-red-500 text-sm">{error}</p>
            )}

            <div className="space-y-1">
              <label htmlFor="name" className="text-[#4a7bc1] block text-sm font-medium text-azul-texto">
                Nome
              </label>
              <input
                type="text"
                id="name"
                name="name"
                placeholder="Seu nome"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-lg border border-azul-cremoso-DEFAULT focus:ring-2 focus:ring-azul-cremoso-dark focus:border-transparent transition-all"
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="email" className="text-[#4a7bc1] block text-sm font-medium text-azul-texto">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="seu@email.com"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-5 py-3 rounded-lg border border-azul-cremoso-DEFAULT focus:ring-2 focus:ring-azul-cremoso-dark focus:border-transparent transition-all"
                required
              />
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
                  Cadastrando...
                </span>
              ) : (
                "Cadastrar"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
