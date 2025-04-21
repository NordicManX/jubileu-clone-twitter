import { useState } from "react";
import { Link } from "react-router-dom";

const RecuperarSenha = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("https://jubileu-clone-twitter.onrender.com/api/users/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Instruções de recuperação enviadas para seu e-mail.");
      } else {
        alert("Erro: " + data.detail);
      }
    } catch (error: any) {
      alert("Erro de conexão: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-azul-cremoso-DEFAULT">
          <div className="bg-gradient-to-r from-azul-cremoso-DEFAULT to-azul-cremoso-dark p-8 text-center">
            <h1 className="text-2xl font-bold text-[#4a7bc1]">Recuperar Senha</h1>
            <p className="text-[#7aaae8]/90 mt-2">Digite seu e-mail para redefinir a senha</p>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-azul-texto">
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

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${
                isLoading
                  ? "bg-azul-cremoso-DEFAULT cursor-not-allowed"
                  : "bg-azul-cremoso-dark hover:bg-azul-texto hover:shadow-lg"
              }`}
            >
              {isLoading ? "Enviando..." : "Enviar link de recuperação"}
            </button>

            <div className="text-center pt-4">
              <p className="text-sm text-[#7aaae8]">
                Lembrou a senha?{" "}
                <Link
                  to="/login"
                  className="font-semibold text-azul-cremoso-dark hover:text-azul-texto hover:underline"
                >
                  Voltar ao login
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecuperarSenha;
