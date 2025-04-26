// src/components/SuggestionsSidebar.tsx
import React from 'react';

// Interfaces para os dados que esperamos receber
interface UserInfo {
    id: number;
    name: string;
    // Poderíamos adicionar @username ou avatar aqui depois
}

interface FollowStatusMap {
    [userId: number]: boolean; // Mapeia ID do usuário para true (seguindo) ou false
}

interface SuggestionsSidebarProps {
    users: UserInfo[]; // Lista de usuários a sugerir
    followStatus: FollowStatusMap; // Mapa do status de seguir
    onFollowToggle: (targetUserId: number, isCurrentlyFollowing: boolean) => void; // Função para seguir/deixar de seguir
    currentUserId: number | null; // ID do usuário logado (para não sugerir a si mesmo)
}

const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({
    users,
    followStatus,
    onFollowToggle,
    currentUserId
}) => {

    // Filtra a lista para não mostrar o próprio usuário logado
    const suggestedUsers = users.filter(user => user.id !== currentUserId);

    // Limita a quantidade de sugestões (opcional)
    const limitedSuggestions = suggestedUsers.slice(0, 5); // Ex: mostra apenas os 5 primeiros

    return (
        // Define a largura, fundo, padding, etc.
        // hidden lg:block faz aparecer apenas em telas grandes
        <aside className="w-72 flex-shrink-0 bg-white p-4 overflow-y-auto hidden lg:block border-l border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800 sticky top-0 bg-white pb-2">Sugestões para você</h2> {/* Título fixo */}
            {limitedSuggestions.length === 0 && !users.length && ( // Mostra se não houver usuários na timeline
                <p className="text-sm text-gray-500">Carregando sugestões...</p>
            )}
             {limitedSuggestions.length === 0 && users.length > 0 && ( // Mostra se só tiver o próprio usuário
                <p className="text-sm text-gray-500">Nenhuma sugestão por enquanto.</p>
            )}
            <div className="space-y-4">
                {limitedSuggestions.map((user) => {
                    // Verifica o status de 'seguindo' para este usuário
                    const isFollowing = followStatus[user.id] || false;
                    return (
                        <div key={user.id} className="flex items-center justify-between space-x-2">
                            {/* Info do usuário (pode adicionar avatar depois) */}
                            <div className='flex-grow min-w-0'> {/* Permite que o nome quebre linha se necessário */}
                                <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                                {/* <p className="text-xs text-gray-500 truncate">@{user.username || 'username'}</p> */}
                            </div>
                            {/* Botão Seguir/Deixar de Seguir */}
                            <button
                                onClick={() => onFollowToggle(user.id, isFollowing)}
                                className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                    isFollowing
                                        ? 'bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700' // Estilo "Seguindo" (clicar para deixar de seguir)
                                        : 'bg-blue-500 text-white hover:bg-blue-600' // Estilo "Seguir"
                                }`}
                            >
                                {isFollowing ? 'Seguindo' : 'Seguir'}
                            </button>
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default SuggestionsSidebar;