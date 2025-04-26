// src/pages/Timeline.tsx
import { useEffect, useState } from "react";
import { MoreHorizontal, Heart, MessageCircle, Edit, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import toast from 'react-hot-toast';

// Interfaces
interface TweetOwner { id: number; name: string; email: string; created_at: string; }
interface Tweet { id: number; content: string; created_at: string; owner_id: number; owner: TweetOwner | null; curtidas?: number; }

// URL da API (ajuste conforme necessário ou via .env)
const apiUrl = import.meta.env.VITE_API_URL || "https://jubileu-clone-twitter.onrender.com";

const Timeline = () => {
    // Estados
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [userEmail, setUserEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [userId, setUserId] = useState<number | null>(null); // ID do usuário logado
    const [novoTweet, setNovoTweet] = useState<string>("");
    const [curtidos, setCurtidos] = useState<{ [tweetId: number]: boolean }>({});
    const [menuAberto, setMenuAberto] = useState<number | null>(null);
    const [seguindo, setSeguindoEstado] = useState<boolean>(localStorage.getItem("isFollowingPage") === "true" || false);
    const [mostrarModalPerfil, setMostrarModalPerfil] = useState<boolean>(false); // Renomeado para clareza
    const [novoNome, setNovoNomeEstado] = useState<string>("");
    const [novoEmail, setNovoEmailEstado] = useState<string>("");
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingTweet, setEditingTweet] = useState<Tweet | null>(null);
    const [editedContent, setEditedContent] = useState<string>("");

    // Efeito para buscar dados iniciais
    useEffect(() => {
        // **IMPORTANTE**: Esta função assume que o fluxo de LOGIN já salvou
        // 'userId', 'userName', 'userEmail' no localStorage após chamar /api/users/me
        const fetchData = async () => {
            // Busca Tweets
            try {
                const res = await fetch(`${apiUrl}/tweets/`);
                if (!res.ok) throw new Error('Falha ao buscar tweets');
                const data = await res.json();
                const tweetsComOwner = data.map((t: any) => ({ ...t, owner: t.owner || null }));
                setTweets(tweetsComOwner);
            } catch (error) { console.error("Erro ao buscar tweets:", error); toast.error("Não foi possível carregar os tweets."); }

            // Carrega dados do usuário do localStorage (salvos pelo processo de Login)
            const storedEmail = localStorage.getItem("userEmail");
            const storedName = localStorage.getItem("userName");
            const storedId = localStorage.getItem("userId");
            if (storedEmail) setUserEmail(storedEmail);
            if (storedName) setUserName(storedName);
            if (storedId) { const parsedUserId = parseInt(storedId, 10); if (!isNaN(parsedUserId)) setUserId(parsedUserId); }
             else { console.warn("Timeline: userId não encontrado no localStorage ao montar."); } // Avisa se ID não foi carregado

            // Inicializa estado do modal de perfil
            setNovoNomeEstado(storedName || ""); setNovoEmailEstado(storedEmail || "");
        };
        fetchData();
    }, []);

    // --- Funções Handler ---

    // Postar novo tweet
    const handleNovoTweet = async () => {
        if (novoTweet.trim() === "" || novoTweet.length > 280) return;
        const token = localStorage.getItem("token");
        // A verificação de userId aqui é mais uma garantia de que o estado de login está consistente no frontend
        if (!token || userId === null) {
            toast.error("Login necessário para postar.");
            return;
        }
        try {
            // Confia no backend para associar o owner_id baseado no token
            const res = await fetch(`${apiUrl}/tweets/`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ content: novoTweet }), // Não envia owner_id
            });
            if (!res.ok) { const errorData = await res.json().catch(() => ({})); throw new Error(errorData.detail || "Erro ao criar tweet"); }

            const tweetCriado = await res.json();
            // Adiciona o novo tweet à lista (idealmente a API já retorna o owner completo)
            // Se a API não retornar owner, preenchemos com dados locais para UI imediata
             const tweetFormatado = {
                 ...tweetCriado,
                 owner: tweetCriado.owner || { id: userId, name: userName, email: userEmail, created_at: new Date().toISOString() }
             };
            setTweets([tweetFormatado, ...tweets]);
            setNovoTweet("");
            toast.success("Tweet postado!");
        } catch (error) { console.error("Erro ao criar tweet:", error); toast.error(`Erro ao criar tweet: ${error instanceof Error ? error.message : String(error)}`); }
    };

    // Curtir tweet (requer API no backend)
    const handleCurtir = (tweetId: number) => {
        // TODO: Implementar chamada API para curtir/descurtir no backend e atualizar estado com base na resposta
        console.log("Tentativa de curtir (local):", tweetId);
        setTweets((prev) => prev.map((t) => t.id === tweetId ? { ...t, curtidas: curtidos[tweetId] ? (t.curtidas ?? 1) - 1 : (t.curtidas ?? 0) + 1 } : t ));
        setCurtidos((prev) => ({ ...prev, [tweetId]: !prev[tweetId] }));
    };

     // Abrir modal de edição de perfil
     const abrirModalEdicaoPerfil = () => {
        setNovoNomeEstado(userName); // Usa estado atual
        setNovoEmailEstado(userEmail); // Usa estado atual
        setMostrarModalPerfil(true);
    };

    // Salvar perfil (com chamada API)
    const handleSalvarPerfil = async () => {
        const token = localStorage.getItem("token");
        if (!token) {
            toast.error("Autenticação necessária.");
            return;
        }
        // Validação básica (opcional, backend deve validar também)
        if (!novoNome.trim() || !novoEmail.trim()) {
            toast.error("Nome e Email não podem ser vazios.");
            return;
        }

        try {
            // Chama a API para atualizar
            const response = await fetch(`${apiUrl}/api/users/me`, { // Usa a rota /me do users.py
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                 },
                body: JSON.stringify({ name: novoNome, email: novoEmail }) // Envia só o que pode mudar (UserUpdate)
            });

            if (!response.ok) {
                 const errorData = await response.json().catch(() => ({}));
                 throw new Error(errorData.detail || `Falha ao atualizar perfil (status ${response.status})`);
            }

            // Atualização bem-sucedida na API, agora atualiza localmente
            const updatedUserData = await response.json(); // API retorna os dados atualizados

            setUserName(updatedUserData.name); // Usa dados retornados pela API
            setUserEmail(updatedUserData.email); // Usa dados retornados pela API
            localStorage.setItem("userName", updatedUserData.name);
            localStorage.setItem("userEmail", updatedUserData.email);
            // O ID geralmente não muda, mas se mudar, atualize:
            // localStorage.setItem("userId", updatedUserData.id.toString());
            // setUserId(updatedUserData.id);

            // Atualiza o nome nos tweets existentes localmente
            if (userId !== null) {
                setTweets(prevTweets => prevTweets.map(tweet => {
                    if (tweet.owner && tweet.owner.id === userId) {
                        return { ...tweet, owner: { ...(tweet.owner as TweetOwner), name: updatedUserData.name } };
                    }
                    return tweet; })
                );
            }

            setMostrarModalPerfil(false); // Fecha o modal de perfil
            toast.success("Perfil atualizado com sucesso!");

        } catch (error) {
            console.error("Erro ao salvar perfil:", error);
            toast.error(`Erro ao salvar perfil: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    // Excluir Tweet
    const handleExcluirTweet = async (tweetId: number) => {
        setMenuAberto(null);
        if (!window.confirm("Tem certeza que deseja excluir este tweet?")) return;
        const token = localStorage.getItem("token");
        if (!token) { toast.error("Autenticação necessária para excluir."); return; }
        try {
            // Backend deve verificar ownership pelo token
            const response = await fetch(`${apiUrl}/tweets/${tweetId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (response.ok || response.status === 204) {
                setTweets(prevTweets => prevTweets.filter(t => t.id !== tweetId));
                toast.success("Tweet excluído com sucesso!");
            } else { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || `Falha ao excluir tweet`); }
        } catch (error) { console.error("Erro ao excluir tweet:", error); toast.error(`Erro ao excluir tweet: ${error instanceof Error ? error.message : String(error)}`); }
    };

    // Abrir Modal de Edição de Tweet
    const handleAbrirEditarTweet = (tweetParaEditar: Tweet) => {
        if (tweetParaEditar && tweetParaEditar.owner?.id === userId) { // Checa ownership antes de abrir
            setEditingTweet(tweetParaEditar);
            setEditedContent(tweetParaEditar.content);
            setShowEditModal(true);
            setMenuAberto(null);
        } else {
            toast.error("Você não pode editar este tweet.");
        }
    };

    // Salvar Edição do Tweet
    const handleSalvarEdicaoTweet = async () => {
        if (!editingTweet || editedContent.trim() === "") return;
        const token = localStorage.getItem("token");
        if (!token) { toast.error("Autenticação necessária para editar."); return; }
        try {
            // Backend deve verificar ownership pelo token
            const response = await fetch(`${apiUrl}/tweets/${editingTweet.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ content: editedContent }) // Envia apenas o conteúdo
            });
            if (response.ok) {
                const tweetAtualizado = await response.json();
                // Atualiza o tweet na lista local
                setTweets(prevTweets => prevTweets.map(t => t.id === editingTweet.id ? { ...t, content: tweetAtualizado.content || editedContent } : t ));
                setShowEditModal(false); setEditingTweet(null); // Fecha modal e limpa estado
                toast.success("Tweet atualizado com sucesso!");
            } else { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || `Falha ao atualizar tweet`); }
        } catch (error) { console.error("Erro ao atualizar tweet:", error); toast.error(`Erro ao atualizar tweet: ${error instanceof Error ? error.message : String(error)}`); }
    };


    // --- JSX ---
    return (
        <div className="min-h-screen flex w-full h-screen overflow-hidden">
            <Sidebar
                userName={userName} userEmail={userEmail} seguindo={seguindo}
                setSeguindo={setSeguindoEstado} setMostrarModal={abrirModalEdicaoPerfil}
                handleLogout={() => { localStorage.clear(); window.location.href = "/"; }}
            />
            <main className="flex-grow overflow-y-auto bg-gray-100">
                <div className="p-6">
                    {/* Área de postagem */}
                    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
                       <textarea className="w-full h-24 border border-gray-300 rounded-md p-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="O que está acontecendo?" value={novoTweet} onChange={(e) => setNovoTweet(e.target.value)} maxLength={280} />
                       <div className="flex justify-between items-center mt-3"> <span className={`text-sm ${novoTweet.length > 280 ? 'text-red-500' : 'text-gray-500'}`}> {novoTweet.length}/280 </span> <button onClick={handleNovoTweet} className={`font-bold py-2 px-5 rounded-full text-white transition-colors ${ novoTweet.trim() === "" || novoTweet.length > 280 ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600" }`} disabled={novoTweet.trim() === "" || novoTweet.length > 280}> Postar </button> </div>
                    </div>
                    {/* Lista de Tweets */}
                    <div className="space-y-4">
                        {tweets.length === 0 && ( <p className="text-center text-gray-500 py-4">Nenhum tweet para mostrar.</p> )}
                        {tweets.map((tweet) => (
                            <div key={tweet.id} className="bg-white rounded-lg shadow p-4 border border-gray-200">
                                <div className="flex justify-between items-start">
                                     <div> <h2 className="font-bold text-gray-900">{tweet.owner?.name || "Usuário Anônimo"}</h2> <p className="text-sm text-gray-500">@{tweet.owner?.email?.split('@')[0] || "username"} · {new Date(tweet.created_at).toLocaleDateString()}</p> </div>
                                     <div className="relative">
                                         <button onClick={() => setMenuAberto(prev => prev === tweet.id ? null : tweet.id)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full"> <MoreHorizontal className="w-5 h-5" /> </button>
                                         {menuAberto === tweet.id && (
                                             <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10 py-1">
                                                 <ul>
                                                     {/* Botões Editar/Excluir Condicionais */}
                                                     {userId === tweet.owner?.id && ( <li> <button onClick={() => handleAbrirEditarTweet(tweet)} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"> <Edit className="w-4 h-4"/> <span>Editar</span> </button> </li> )}
                                                     {userId === tweet.owner?.id && ( <li> <button onClick={() => handleExcluirTweet(tweet.id)} className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"> <Trash2 className="w-4 h-4"/> <span>Excluir</span> </button> </li> )}
                                                     {userId !== tweet.owner?.id && ( <li><button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Denunciar</button></li> )}
                                                 </ul>
                                             </div>
                                         )}
                                     </div>
                                </div>
                                 <p className="mt-2 text-gray-800 whitespace-pre-wrap">{tweet.content}</p>
                                 <div className="mt-4 flex items-center space-x-6 text-gray-500"> <button className="flex items-center space-x-1 group hover:text-blue-500"> <div className="p-2 rounded-full group-hover:bg-blue-100"> <MessageCircle className="w-5 h-5" /> </div> </button> <button onClick={() => handleCurtir(tweet.id)} className={`flex items-center space-x-1 group ${ curtidos[tweet.id] ? "text-red-500" : "hover:text-red-500" }`}> <div className="p-2 rounded-full group-hover:bg-red-100"> <Heart className={`w-5 h-5 ${curtidos[tweet.id] ? 'fill-current' : ''}`} /> </div> <span>{tweet.curtidas ?? 0}</span> </button> </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
            {/* Modal Edição Perfil */}
            {mostrarModalPerfil && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"> <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"> <h2 className="text-xl font-semibold mb-5 text-gray-800">Editar Perfil</h2> <div> <div className="mb-4"> <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-name">Nome</label> <input id="edit-name" type="text" value={novoNome} onChange={(e) => setNovoNomeEstado(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div className="mb-6"> <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-email">Email</label> <input id="edit-email" type="email" value={novoEmail} onChange={(e) => setNovoEmailEstado(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div className="flex justify-end space-x-3 mt-2"> <button type="button" onClick={() => setMostrarModalPerfil(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"> Cancelar </button> <button type="button" onClick={handleSalvarPerfil} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"> Salvar </button> </div> </div> </div> </div> )}
            {/* Modal Edição Tweet */}
            {showEditModal && editingTweet && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"> <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"> <h2 className="text-xl font-semibold mb-5 text-gray-800">Editar Tweet</h2> <div> <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={5} maxLength={280} className="w-full border border-gray-300 p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" /> <div className="text-right text-sm text-gray-500 mb-4"> {editedContent.length}/280 </div> <div className="flex justify-end space-x-3 mt-2"> <button type="button" onClick={() => { setShowEditModal(false); setEditingTweet(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"> Cancelar </button> <button type="button" onClick={handleSalvarEdicaoTweet} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors" disabled={editedContent.trim() === "" || editedContent === editingTweet.content} > Salvar Alterações </button> </div> </div> </div> </div> )}
        </div>
    );
};

export default Timeline;