// src/pages/Login.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
// Usando react-hot-toast - Import apenas 'toast' se Toaster está no App.tsx
import toast from 'react-hot-toast';
// Removido: import { Toaster } from 'react-hot-toast'; // Não renderize aqui

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const navigate = useNavigate();
    const apiUrl = import.meta.env.VITE_API_BASE_URL || "https://jubileu-clone-twitter.onrender.com";

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // ATENÇÃO: A rota correta definida no App.tsx é /timeline
            navigate("/timeline");
        }
    }, [navigate]);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (isLoading) return;
        setIsLoading(true);
        setEmailError(""); setPasswordError("");
        if (!email.includes("@")) { setEmailError("Por favor, insira um e-mail válido."); setIsLoading(false); return; }
        if (password.length < 6) { setPasswordError("A senha deve ter pelo menos 6 caracteres."); setIsLoading(false); return; }

        try {
            // PASSO 1: Login
            console.log("Enviando para /api/users/login...");
            const loginResponse = await fetch(`${apiUrl}/api/users/login`, { method: "POST", headers: { "Content-Type": "application/x-www-form-urlencoded", }, body: new URLSearchParams({ email, password }), });
            console.log("Resposta do Login:", loginResponse.status);
            if (!loginResponse.ok) { const errorText = await loginResponse.text().catch(() => "Erro desconhecido"); try { const errorJson = JSON.parse(errorText); if (errorJson.detail) throw new Error(errorJson.detail); } catch {} throw new Error("Usuário ou senha inválidos."); }

            // PASSO 2: Token
            const tokenData = await loginResponse.json();
            const token = tokenData.access_token;
            if (!token) { throw new Error("Token de autenticação não recebido."); }
            localStorage.setItem("token", token);
            console.log("Token salvo no localStorage.");

            // PASSO 3: /me
            console.log("Buscando dados do usuário em /api/users/me...");
            const meResponse = await fetch(`${apiUrl}/api/users/me`, { method: 'GET', headers: { 'Authorization': `Bearer ${token}` } });
            console.log("Resposta do /me:", meResponse.status);
            if (!meResponse.ok) { localStorage.removeItem('token'); const errorData = await meResponse.json().catch(() => ({})); console.error("Erro ao buscar dados /me:", errorData); throw new Error(errorData.detail || 'Não foi possível buscar dados do usuário.'); }

            // PASSO 4: Salvar Dados
            const userData = await meResponse.json();
            console.log("Dados recebidos de /me:", userData);
            if (!userData.id || !userData.name || !userData.email) { localStorage.removeItem('token'); throw new Error('Dados essenciais do usuário não recebidos.'); }
            localStorage.setItem('userId', userData.id.toString());
            localStorage.setItem('userName', userData.name);
            localStorage.setItem('userEmail', userData.email);
            console.log("Dados salvos no localStorage:", { userId: userData.id, userName: userData.name, userEmail: userData.email }); // Adicionado log de confirmação

            // PASSO 5: Feedback e Navegação
            toast.success("Login bem-sucedido! Redirecionando..."); // <<< CHAMADA DO TOAST
            setTimeout(() => {
                 // ATENÇÃO: A rota correta definida no App.tsx é /timeline
                navigate("/timeline");
            }, 1500);

        } catch (error: any) {
            console.error("Erro durante o processo de login:", error);
            toast.error(error.message || "Erro ao fazer login."); // <<< CHAMADA DO TOAST DE ERRO
            localStorage.removeItem('token'); localStorage.removeItem('userId'); localStorage.removeItem('userName'); localStorage.removeItem('userEmail');
        } finally {
            setIsLoading(false);
        }
    };

    // JSX (removido <Toaster /> comentado)
    return (
        <div className="w-screen h-screen flex items-center justify-center bg-gray-100">
             {/* Removido: <Toaster /> não deve ficar aqui */}
            <div className="w-full max-w-md mx-auto p-4">
                <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
                    {/* ... (cabeçalho e form como antes) ... */}
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-8 text-center">
                        <h1 className="text-3xl font-bold text-white">Bem-vindo ao Jubileu</h1>
                        <p className="text-blue-100 mt-2">Faça login para continuar</p>
                    </div>
                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                        {/* ... (inputs e botão como antes) ... */}
                         <div className="space-y-1"> <label htmlFor="email" className="block text-sm font-medium text-gray-700"> E-mail </label> <input type="email" id="email" aria-label="E-mail" placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required /> {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>} </div>
                         <div className="space-y-1"> <label htmlFor="password" className="block text-sm font-medium text-gray-700"> Senha </label> <input type="password" id="password" aria-label="Senha" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-5 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" required /> {passwordError && <p className="text-red-500 text-xs mt-1">{passwordError}</p>} <div className="text-right pt-1"> <Link to="/recuperar-senha" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors"> Esqueceu sua senha? </Link> </div> </div>
                         <button type="submit" disabled={isLoading} className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${ isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-lg" }`} > {isLoading ? ( <span className="flex items-center justify-center"> <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"> <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle> <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path> </svg> Carregando... </span> ) : ( "Entrar" )} </button>
                         <div className="text-center pt-4"> <p className="text-sm text-gray-600"> Não tem uma conta?{" "} <Link to="/cadastro" className="font-semibold text-blue-600 hover:text-blue-800 hover:underline transition-colors" > Cadastre-se </Link> </p> </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;