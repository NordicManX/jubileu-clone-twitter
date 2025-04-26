// src/components/SuggestionsSidebar.tsx
import React from 'react';

// Interfaces
interface UserInfo { id: number; name: string; }
interface FollowStatusMap { [userId: number]: boolean; }
interface SuggestionsSidebarProps {
    users: UserInfo[]; // Recebe a lista JÁ FILTRADA (sem o usuário logado)
    followStatus: FollowStatusMap;
    onFollowToggle: (targetUserId: number, isCurrentlyFollowing: boolean) => void;
    currentUserId: number | null; // Ainda pode ser útil para outras lógicas, mas não para filtrar a lista aqui
}

const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({
    users,
    followStatus,
    onFollowToggle,
    currentUserId // Não é mais usado para filtrar aqui, mas mantido se necessário para outras coisas
}) => {

    // Removida a filtragem e o slice daqui, pois a lista 'users' já vem filtrada do Timeline

    return (
        <aside className="w-72 flex-shrink-0 bg-white p-4 overflow-y-auto hidden lg:block border-l border-gray-200">
            <h2 className="text-lg font-bold mb-4 text-gray-800 sticky top-0 bg-white pb-2">Outros Usuários</h2> {/* Título Ajustado */}

            {/* Mensagem se a lista estiver vazia */}
            {users.length === 0 && (
                <p className="text-sm text-gray-500">Nenhum outro usuário para mostrar.</p>
            )}

            <div className="space-y-4">
                {/* Mapeia diretamente a lista 'users' que já vem sem o usuário logado */}
                {users.map((user) => {
                    const isFollowing = followStatus[user.id] || false;
                    // Removida a verificação 'isCurrentUser' daqui

                    return (
                        <div key={user.id} className="flex items-center justify-between space-x-2">
                            {/* Info do usuário */}
                            <div className='flex-grow min-w-0'>
                                <p className="font-semibold text-sm text-gray-900 truncate">{user.name}</p>
                            </div>

                            {/* Botão Seguir/Seguindo - Renderiza para todos na lista */}
                            <button
                                onClick={() => onFollowToggle(user.id, isFollowing)}
                                className={`flex-shrink-0 px-3 py-1 text-xs font-semibold rounded-full transition-colors ${
                                    isFollowing
                                        ? 'bg-gray-200 text-gray-800 hover:bg-red-100 hover:text-red-700' // Seguir -> Deixar de seguir (vermelho no hover)
                                        : 'bg-blue-500 text-white hover:bg-blue-600' // Seguir
                                }`}
                            >
                                {isFollowing ? 'Seguindo' : 'Seguir'}
                            </button>
                             {/* Removido o span "(Você)" */}
                        </div>
                    );
                })}
            </div>
        </aside>
    );
};

export default SuggestionsSidebar;