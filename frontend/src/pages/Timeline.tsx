// src/pages/Timeline.tsx
import { useEffect, useState } from "react";
import { MoreHorizontal, Heart, MessageCircle, Edit, Trash2, Send, LogOut, Menu } from "lucide-react";
import Sidebar from "../components/Sidebar"; // Importa Sidebar Desktop
import SuggestionsSidebar from "../components/SuggestionsSidebar";
import MobileSidebar from "../components/MobileSidebar";
import toast from 'react-hot-toast';
import { useNavigate } from "react-router-dom";

// Interfaces
interface TweetOwner { id: number; name: string; email: string; created_at: string; }
interface Tweet { id: number; content: string; created_at: string; owner_id: number; owner: TweetOwner | null; curtidas?: number; }
interface UserInfo { id: number; name: string; }
interface FollowStatusMap { [userId: number]: boolean; }
interface LocalComment { id: string; text: string; author: string; timestamp: number; }
interface LocalCommentsMap { [tweetId: number]: LocalComment[]; }

const apiUrl = import.meta.env.VITE_API_URL || "https://jubileu-clone-twitter.onrender.com";
const LOCAL_COMMENTS_KEY = 'localTweetComments';
const LOCAL_FOLLOW_KEY = 'followStatusData';

const Timeline = () => {
    // Estados (todos como antes)
    const [tweets, setTweets] = useState<Tweet[]>([]);
    const [userEmail, setUserEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [userId, setUserId] = useState<number | null>(null);
    const [novoTweet, setNovoTweet] = useState<string>("");
    const [curtidos, setCurtidos] = useState<{ [tweetId: number]: boolean }>({});
    const [menuAberto, setMenuAberto] = useState<number | null>(null);
    const [seguindo, setSeguindoEstado] = useState<boolean>(localStorage.getItem("isFollowingPage") === "true" || false);
    const [mostrarModalPerfil, setMostrarModalPerfil] = useState<boolean>(false);
    const [novoNome, setNovoNomeEstado] = useState<string>("");
    const [novoEmail, setNovoEmailEstado] = useState<string>("");
    const [showEditModal, setShowEditModal] = useState<boolean>(false);
    const [editingTweet, setEditingTweet] = useState<Tweet | null>(null);
    const [editedContent, setEditedContent] = useState<string>("");
    const [followStatus, setFollowStatus] = useState<FollowStatusMap>({});
    const [timelineUsersList, setTimelineUsersList] = useState<UserInfo[]>([]);
    const [openCommentSectionId, setOpenCommentSectionId] = useState<number | null>(null);
    const [newCommentText, setNewCommentText] = useState<string>("");
    const [localComments, setLocalComments] = useState<LocalCommentsMap>(() => { const saved = localStorage.getItem(LOCAL_COMMENTS_KEY); try { return saved ? JSON.parse(saved) : {}; } catch (e) { localStorage.removeItem(LOCAL_COMMENTS_KEY); return {}; } });
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

    const navigate = useNavigate();

    // Efeitos (como antes)
    useEffect(() => { const fetchData = async () => { try {const res = await fetch(`${apiUrl}/tweets/`);if (!res.ok) throw new Error('Falha ao buscar tweets');const data = await res.json();const tweetsComOwner = data.map((t: any) => ({ ...t, owner: t.owner || null }));setTweets(tweetsComOwner);} catch (error) { console.error("Erro ao buscar tweets:", error); } const storedEmail = localStorage.getItem("userEmail");const storedName = localStorage.getItem("userName");const storedId = localStorage.getItem("userId");if (storedEmail) setUserEmail(storedEmail);if (storedName) setUserName(storedName);if (storedId) { const parsedUserId = parseInt(storedId, 10); if (!isNaN(parsedUserId)) setUserId(parsedUserId); } else { console.warn("Timeline: userId não encontrado no localStorage ao montar."); } const storedFollowStatus = localStorage.getItem(LOCAL_FOLLOW_KEY); if (storedFollowStatus) { try { setFollowStatus(JSON.parse(storedFollowStatus)); } catch (e) { console.error("Falha ao parsear follow status do localStorage", e); localStorage.removeItem(LOCAL_FOLLOW_KEY); } } setNovoNomeEstado(storedName || ""); setNovoEmailEstado(storedEmail || ""); }; fetchData(); }, []);
    useEffect(() => { if (tweets.length > 0 && userId !== null) { const usersMap = new Map<number, UserInfo>(); tweets.forEach(tweet => { if (tweet.owner && tweet.owner.id !== userId && !usersMap.has(tweet.owner.id)) { usersMap.set(tweet.owner.id, { id: tweet.owner.id, name: tweet.owner.name || "Usuário Anônimo" }); } }); setTimelineUsersList(Array.from(usersMap.values())); } else { setTimelineUsersList([]); } }, [tweets, userId]);


    // --- Função de Logout ---
    const handleLogout = () => {
        toast('Desconectando...');
        localStorage.clear();
        navigate("/login");
    };

    // --- Outras Funções Handler (sem alterações) ---
    const handleFollowToggle = (targetUserId: number, isCurrentlyFollowing: boolean) => { const newFollowState = !isCurrentlyFollowing; const updatedFollowStatusMap = { ...followStatus, [targetUserId]: newFollowState }; setFollowStatus(updatedFollowStatusMap); try { localStorage.setItem(LOCAL_FOLLOW_KEY, JSON.stringify(updatedFollowStatusMap)); } catch (e) { console.error("Erro ao salvar follow status no localStorage", e); toast.error("Erro ao salvar preferência de seguir."); } const targetUser = timelineUsersList.find(u => u.id === targetUserId); const targetName = targetUser?.name || `Usuário ${targetUserId}`; if (newFollowState) { toast.success(`Seguindo ${targetName}!`); } else { toast.success(`Deixou de seguir ${targetName}!`); } };
    const handleNovoTweet = async () => { if (novoTweet.trim() === "" || novoTweet.length > 280) return;const token = localStorage.getItem("token");if (!token || userId === null) { toast.error("Login necessário para postar."); return; }try {const res = await fetch(`${apiUrl}/tweets/`, { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ content: novoTweet }), });if (!res.ok) { const errorData = await res.json().catch(() => ({})); throw new Error(errorData.detail || "Erro ao criar tweet"); }const tweetCriado = await res.json(); const tweetFormatado = { ...tweetCriado, owner: tweetCriado.owner || { id: userId, name: userName, email: userEmail, created_at: new Date().toISOString() } };setTweets([tweetFormatado, ...tweets]); setNovoTweet(""); toast.success("Tweet postado!"); } catch (error) { console.error("Erro ao criar tweet:", error); toast.error(`Erro ao criar tweet: ${error instanceof Error ? error.message : String(error)}`); } };
    const handleCurtir = (tweetId: number) => { console.log("Tentativa de curtir (local):", tweetId);setTweets((prev) => prev.map((t) => t.id === tweetId ? { ...t, curtidas: curtidos[tweetId] ? (t.curtidas ?? 1) - 1 : (t.curtidas ?? 0) + 1 } : t ));setCurtidos((prev) => ({ ...prev, [tweetId]: !prev[tweetId] })); };
    const abrirModalEdicaoPerfil = () => { setNovoNomeEstado(userName); setNovoEmailEstado(userEmail); setMostrarModalPerfil(true); };
    const handleSalvarPerfil = async () => { const token = localStorage.getItem("token"); if (!token) { toast.error("Autenticação necessária."); return; } if (!novoNome.trim() || !novoEmail.trim()) { toast.error("Nome e Email não podem ser vazios."); return; } try { const response = await fetch(`${apiUrl}/api/users/me`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ name: novoNome, email: novoEmail }) }); if (!response.ok) { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || `Falha ao atualizar perfil (status ${response.status})`); } const updatedUserData = await response.json(); setUserName(updatedUserData.name); setUserEmail(updatedUserData.email); localStorage.setItem("userName", updatedUserData.name); localStorage.setItem("userEmail", updatedUserData.email); if (userId !== null) { setTweets(prevTweets => prevTweets.map(tweet => { if (tweet.owner && tweet.owner.id === userId) { return { ...tweet, owner: { ...(tweet.owner as TweetOwner), name: updatedUserData.name } }; } return tweet; }) ); } setMostrarModalPerfil(false); toast.success("Perfil atualizado com sucesso!"); } catch (error) { console.error("Erro ao salvar perfil:", error); toast.error(`Erro ao salvar perfil: ${error instanceof Error ? error.message : String(error)}`); } };
    const handleExcluirTweet = async (tweetId: number) => { console.log(`Tentando EXCLUIR tweet ${tweetId}. ID do usuário no estado: ${userId}`); const tweetOwnerId = tweets.find(t => t.id === tweetId)?.owner?.id; console.log(`ID do dono do tweet ${tweetId} (frontend): ${tweetOwnerId}`); setMenuAberto(null); if (!window.confirm("Tem certeza que deseja excluir este tweet?")) return; const token = localStorage.getItem("token"); if (!token) { toast.error("Autenticação necessária para excluir."); return; } try { const response = await fetch(`${apiUrl}/tweets/${tweetId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } }); if (response.ok || response.status === 204) { setTweets(prevTweets => prevTweets.filter(t => t.id !== tweetId)); toast.success("Tweet excluído com sucesso!"); } else { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || `Falha ao excluir tweet`); } } catch (error) { console.error("Erro ao excluir tweet:", error); toast.error(`Erro ao excluir tweet: ${error instanceof Error ? error.message : String(error)}`); } };
    const handleAbrirEditarTweet = (tweetParaEditar: Tweet) => { console.log(`Tentando ABRIR EDIÇÃO do tweet ${tweetParaEditar.id}. ID do usuário no estado: ${userId}. Dono do tweet (frontend): ${tweetParaEditar.owner?.id}`); if (tweetParaEditar && tweetParaEditar.owner?.id === userId) { setEditingTweet(tweetParaEditar); setEditedContent(tweetParaEditar.content); setShowEditModal(true); setMenuAberto(null); } else { toast.error("Você não pode editar este tweet."); setMenuAberto(null); } };
    const handleSalvarEdicaoTweet = async () => { if (!editingTweet || editedContent.trim() === "") return; console.log(`Tentando SALVAR edição do tweet ${editingTweet.id}. ID do usuário no estado: ${userId}. Dono do tweet (frontend): ${editingTweet.owner?.id}`); const token = localStorage.getItem("token"); if (!token) { toast.error("Autenticação necessária para editar."); return; } if(editingTweet.owner?.id !== userId) { toast.error("Você não tem permissão para editar este tweet."); setShowEditModal(false); setEditingTweet(null); return; } try { const response = await fetch(`${apiUrl}/tweets/${editingTweet.id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ content: editedContent }) }); if (response.ok) { const tweetAtualizado = await response.json(); setTweets(prevTweets => prevTweets.map(t => t.id === editingTweet.id ? { ...t, content: tweetAtualizado.content || editedContent } : t )); setShowEditModal(false); setEditingTweet(null); toast.success("Tweet atualizado com sucesso!"); } else { const errorData = await response.json().catch(() => ({})); throw new Error(errorData.detail || `Falha ao atualizar tweet`); } } catch (error) { console.error("Erro ao atualizar tweet:", error); toast.error(`Erro ao atualizar tweet: ${error instanceof Error ? error.message : String(error)}`); } };
    const handleToggleComments = (tweetId: number) => { setOpenCommentSectionId(prevId => (prevId === tweetId ? null : tweetId)); setNewCommentText(""); };
    const handleNewCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => { setNewCommentText(event.target.value); };
    const handlePostComment = (tweetId: number) => { if (!newCommentText.trim()) { toast.error("O comentário não pode ser vazio."); return; } if (!userName) { toast.error("Não foi possível identificar o autor do comentário."); return; } const newComment: LocalComment = { id: `local-${Date.now()}-${Math.random()}`, text: newCommentText.trim(), author: userName, timestamp: Date.now() }; const updatedCommentsMap = { ...localComments }; const existingComments = updatedCommentsMap[tweetId] || []; updatedCommentsMap[tweetId] = [...existingComments, newComment]; setLocalComments(updatedCommentsMap); try { localStorage.setItem(LOCAL_COMMENTS_KEY, JSON.stringify(updatedCommentsMap)); } catch (e) { console.error("Erro ao salvar comentários no localStorage", e); toast.error("Não foi possível salvar o comentário localmente."); } setNewCommentText(""); toast.success("Comentário adicionado!"); setOpenCommentSectionId(null); };


    // --- JSX ---
    return (
        <div className="min-h-screen flex w-full h-screen overflow-hidden relative">

             <button onClick={() => setIsMobileSidebarOpen(true)} className="md:hidden fixed top-3 left-3 z-50 p-2 bg-white rounded-full shadow-md text-blue-500 hover:bg-gray-100" aria-label="Abrir menu">
                 <Menu className="w-6 h-6" />
             </button>

            {/* Sidebar Desktop - Passando handleLogout novamente */}
            <Sidebar
                userName={userName}
                userEmail={userEmail}
                seguindo={seguindo}
                setSeguindo={setSeguindoEstado}
                setMostrarModal={abrirModalEdicaoPerfil}
                handleLogout={handleLogout} // <<< PROP ADICIONADA DE VOLTA
            />

             <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} userName={userName} userEmail={userEmail} seguindo={seguindo} setSeguindo={setSeguindoEstado} onEditProfile={abrirModalEdicaoPerfil} onLogout={handleLogout} />

            <main className="flex-grow overflow-y-auto bg-gray-100 border-l border-r border-gray-200">
                 <div className="p-6 pt-16 md:pt-6">
                    {/* ... Conteúdo da Main ... */}
                     <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200"> <textarea className="w-full h-24 border border-gray-300 rounded-md p-3 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" placeholder="O que está acontecendo?" value={novoTweet} onChange={(e) => setNovoTweet(e.target.value)} maxLength={280} /> <div className="flex justify-between items-center mt-3"> <span className={`text-sm ${novoTweet.length > 280 ? 'text-red-500' : 'text-gray-500'}`}> {novoTweet.length}/280 </span> <button onClick={handleNovoTweet} className={`font-bold py-2 px-5 rounded-full text-white transition-colors ${ novoTweet.trim() === "" || novoTweet.length > 280 ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600" }`} disabled={novoTweet.trim() === "" || novoTweet.length > 280}> Postar </button> </div> </div> <div className="space-y-4"> {tweets.length === 0 && ( <p className="text-center text-gray-500 py-4">Nenhum tweet para mostrar.</p> )} {tweets.map((tweet) => { const commentsForThisTweet = localComments[tweet.id] || []; return ( <div key={tweet.id} className="bg-white rounded-lg shadow p-4 border border-gray-200"> <div className="flex justify-between items-start"> <div> <h2 className="font-bold text-gray-900">{tweet.owner?.name || "Usuário Anônimo"}</h2> <p className="text-sm text-gray-500">@{tweet.owner?.email?.split('@')[0] || "username"} · {new Date(tweet.created_at).toLocaleDateString()}</p> </div> <div className="relative"> <button onClick={() => setMenuAberto(prev => prev === tweet.id ? null : tweet.id)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full"> <MoreHorizontal className="w-5 h-5" /> </button> {menuAberto === tweet.id && ( <div className="absolute right-0 mt-1 w-48 bg-white rounded-md shadow-lg border z-10 py-1"> <ul> {userId === tweet.owner?.id && ( <li> <button onClick={() => handleAbrirEditarTweet(tweet)} className="flex items-center space-x-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"> <Edit className="w-4 h-4"/> <span>Editar</span> </button> </li> )} {userId === tweet.owner?.id && ( <li> <button onClick={() => handleExcluirTweet(tweet.id)} className="flex items-center space-x-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"> <Trash2 className="w-4 h-4"/> <span>Excluir</span> </button> </li> )} {userId !== tweet.owner?.id && ( <li><button className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Denunciar</button></li> )} </ul> </div> )} </div> </div> <p className="mt-2 text-gray-800 whitespace-pre-wrap">{tweet.content}</p> <div className="mt-4 flex items-center space-x-6 text-gray-500"> <button onClick={() => handleToggleComments(tweet.id)} className="flex items-center space-x-1 group hover:text-blue-500"> <div className="p-2 rounded-full group-hover:bg-blue-100"> <MessageCircle className="w-5 h-5" /> </div> <span>{commentsForThisTweet.length}</span> </button> <button onClick={() => handleCurtir(tweet.id)} className={`flex items-center space-x-1 group ${ curtidos[tweet.id] ? "text-red-500" : "hover:text-red-500" }`}> <div className="p-2 rounded-full group-hover:bg-red-100"> <Heart className={`w-5 h-5 ${curtidos[tweet.id] ? 'fill-current' : ''}`} /> </div> <span>{tweet.curtidas ?? 0}</span> </button> </div> {openCommentSectionId === tweet.id && ( <div className="mt-4 pt-4 border-t border-gray-200"> <div className="flex items-start space-x-3 mb-4"> <textarea value={newCommentText} onChange={handleNewCommentChange} rows={2} placeholder="Escreva seu comentário..." className="flex-grow border border-gray-300 rounded-lg p-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none" /> <button onClick={() => handlePostComment(tweet.id)} disabled={!newCommentText.trim()} className={`p-2 rounded-full text-white transition-colors ${!newCommentText.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-500 hover:bg-blue-600'}`} title="Enviar comentário" > <Send className="w-4 h-4"/> </button> </div> <div className="space-y-3"> {commentsForThisTweet.length === 0 && ( <p className="text-xs text-gray-500 text-center">Nenhum comentário ainda.</p> )} {commentsForThisTweet.sort((a, b) => b.timestamp - a.timestamp).map(comment => ( <div key={comment.id} className="flex space-x-2 text-xs"> <div className="bg-gray-100 p-2 rounded-lg flex-grow"> <span className="font-semibold text-gray-800">{comment.author}</span> <p className="text-gray-600">{comment.text}</p> </div> </div> ))} </div> </div> )} </div> ) })} </div>
                </div>
            </main>

            {/* Sidebar Direita (Sugestões) */}
            <SuggestionsSidebar users={timelineUsersList} followStatus={followStatus} onFollowToggle={handleFollowToggle} currentUserId={userId} />

            {/* Botão Logout Flutuante Mobile (Mantido) */}
            <button
                onClick={handleLogout}
                className="md:hidden fixed bottom-4 right-4 z-50 bg-red-500 hover:bg-red-700 text-white rounded-full p-3 shadow-lg flex items-center justify-center"
                aria-label="Sair"
                title="Sair"
            >
                <LogOut className="w-5 h-5" />
            </button>

            {/* Modais */}
            {mostrarModalPerfil && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"> <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"> <h2 className="text-xl font-semibold mb-5 text-gray-800">Editar Perfil</h2> <div> <div className="mb-4"> <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-name">Nome</label> <input id="edit-name" type="text" value={novoNome} onChange={(e) => setNovoNomeEstado(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div className="mb-6"> <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="edit-email">Email</label> <input id="edit-email" type="email" value={novoEmail} onChange={(e) => setNovoEmailEstado(e.target.value)} className="w-full border border-gray-300 p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" /> </div> <div className="flex justify-end space-x-3 mt-2"> <button type="button" onClick={() => setMostrarModalPerfil(false)} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"> Cancelar </button> <button type="button" onClick={handleSalvarPerfil} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors"> Salvar </button> </div> </div> </div> </div> )}
            {showEditModal && editingTweet && ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"> <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-lg"> <h2 className="text-xl font-semibold mb-5 text-gray-800">Editar Tweet</h2> <div> <textarea value={editedContent} onChange={(e) => setEditedContent(e.target.value)} rows={5} maxLength={280} className="w-full border border-gray-300 p-3 mb-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y" /> <div className="text-right text-sm text-gray-500 mb-4"> {editedContent.length}/280 </div> <div className="flex justify-end space-x-3 mt-2"> <button type="button" onClick={() => { setShowEditModal(false); setEditingTweet(null); }} className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition-colors"> Cancelar </button> <button type="button" onClick={handleSalvarEdicaoTweet} className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-md transition-colors" disabled={editedContent.trim() === "" || editedContent === editingTweet.content} > Salvar Alterações </button> </div> </div> </div> </div> )}

        </div>
    );
};

export default Timeline;