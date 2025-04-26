// src/pages/Signup.tsx (ou RegisterPage.tsx)
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from 'react-hot-toast'; // <<< 1. DESCOMENTADO/ADICIONADO IMPORT

const RegisterPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
    });
    const [error, setError] = useState<string>(""); // Mantido state de erro string
    const [isLoading, setIsLoading] = useState(false);
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://jubileu-clone-twitter.onrender.com";

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Validação básica (pode adicionar mais)
        if (formData.password.length < 8) {
            const msg = "A senha deve ter pelo menos 8 caracteres.";
            setError(msg);
            toast.error(msg); // Mostra erro da validação no toast também
            return;
        }
        if (!formData.name.trim()) {
             const msg = "O nome não pode ser vazio.";
             setError(msg);
             toast.error(msg);
             return;
        }
        // Limpa erros apenas se validações básicas passarem
        setError("");
        setIsLoading(true);

        try {
            const response = await fetch(`${apiUrl}/api/users/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json", },
                body: JSON.stringify(formData),
            });

            // Tenta pegar o corpo da resposta mesmo se não for ok, para o 'detail'
            const data = await response.json().catch(() => ({})); // Previne erro se não for JSON

            if (response.ok) {
                toast.success("Cadastro realizado com sucesso! Redirecionando para login...");
                setTimeout(() => {
                   navigate("/login");
                }, 2000);
            } else {
                // Usa 'detail' da resposta se existir, senão mensagem genérica
                const errorMessage = data?.detail || `Erro ${response.status}: Não foi possível realizar o cadastro.`;
                setError(errorMessage); // Atualiza estado de erro se quiser exibir no form
                toast.error(errorMessage); // <<< CHAMA O TOAST DE ERRO (agora deve funcionar)
            }
        } catch (err: any) {
             console.error("Erro de conexão/fetch no cadastro:", err);
             const connectionError = "Erro de conexão. Verifique sua internet ou tente mais tarde.";
             setError(connectionError);
             toast.error(connectionError); // <<< CHAMA O TOAST DE ERRO (agora deve funcionar)
        } finally {
             setIsLoading(false);
        }
    };

    return (
        // Layout geral da página
        <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
            {/* Lembre-se que o <Toaster /> precisa estar no App.tsx */}
            <div className="w-full max-w-md mx-auto p-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    {/* Cabeçalho */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center">
                        <h1 className="text-3xl font-bold text-white">Crie sua conta</h1>
                        <p className="text-blue-100 mt-2">Preencha os dados abaixo</p>
                    </div>

                    {/* Formulário */}
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* Exibição de Erro (opcional, pois o toast já mostra) */}
                        {error && ( <p className="text-red-600 text-sm bg-red-100 p-3 rounded-md">{error}</p> )}

                        {/* Input Nome */}
                        <div className="space-y-1">
                             <label htmlFor="name" className="block text-sm font-medium text-gray-700"> Nome </label>
                             <input type="text" id="name" name="name" placeholder="Seu nome completo" value={formData.name} onChange={handleChange}
                                 className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                         </div>
                        {/* Input Email */}
                        <div className="space-y-1">
                             <label htmlFor="email" className="block text-sm font-medium text-gray-700"> E-mail </label>
                             <input type="email" id="email" name="email" placeholder="seu@email.com" value={formData.email} onChange={handleChange}
                                 className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                         </div>
                        {/* Input Senha */}
                        <div className="space-y-1">
                             <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Senha </label>
                             <input type="password" id="password" name="password" placeholder="Pelo menos 8 caracteres" value={formData.password} onChange={handleChange}
                                 className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required />
                         </div>
                        {/* Botão Cadastrar */}
                        <button type="submit" disabled={isLoading}
                            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${ isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg" }`} >
                            {isLoading ? ( <span className="flex items-center justify-center"> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Cadastrando... </span> ) : ( "Cadastrar" )}
                        </button>
                        {/* Link "Voltar ao login" */}
                        <div className="text-center pt-4">
                             <Link to="/login" className="text-sm font-semibold text-blue-600 hover:text-blue-800 hover:underline" > Voltar ao login </Link>
                         </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;