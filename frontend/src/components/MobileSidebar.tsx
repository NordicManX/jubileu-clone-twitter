// src/components/MobileSidebar.tsx
import React from 'react';
import { X, LogOut, Edit, UserPlus, UserMinus } from 'lucide-react'; // Importar ícones

// Props que o MobileSidebar espera receber
interface MobileSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    userName: string;
    userEmail: string;
    seguindo: boolean; // Estado 'seguindo' global (se aplicável)
    setSeguindo: (value: boolean) => void; // Função para alterar estado 'seguindo'
    onEditProfile: () => void; // Função para abrir o modal de editar perfil
    onLogout: () => void; // Função para fazer logout
}

const MobileSidebar: React.FC<MobileSidebarProps> = ({
    isOpen,
    onClose,
    userName,
    userEmail,
    seguindo,
    setSeguindo,
    onEditProfile,
    onLogout
}) => {
    return (
        <>
            {/* Backdrop Overlay (escurece o fundo quando aberto) */}
            <div
                className={`md:hidden fixed inset-0 bg-black bg-opacity-50 z-30 transition-opacity duration-300 ${
                    isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none' // Controla visibilidade e clique
                }`}
                onClick={onClose} // Fecha ao clicar fora
            />

            {/* Conteúdo da Sidebar Mobile */}
            <aside
                className={`md:hidden fixed inset-y-0 left-0 w-72 bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col p-4 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full' // Controla o deslizamento
                }`}
            >
                {/* Cabeçalho com botão de fechar */}
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[#4a7bc1]">Menu</h2>
                    <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-800">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Conteúdo Principal da Sidebar */}
                <div className="flex-grow overflow-y-auto text-center">
                    {/* Seção Perfil */}
                    <div className="mb-6">
                         <div className="bg-blue-100 rounded-full w-16 h-16 mx-auto mb-3" />
                         <p className="font-medium text-lg text-[#4a7bc1] break-words">
                            {userName || userEmail?.split("@")[0] || "Usuário"}
                         </p>
                         <p className="text-sm text-gray-500 break-words mb-3">{userEmail || 'email@exemplo.com'}</p>
                         <button
                             onClick={() => { onEditProfile(); onClose(); }} // Fecha sidebar ao abrir modal
                             className="w-full mb-3 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center justify-center space-x-2"
                         >
                             <Edit className='w-4 h-4'/>
                             <span>Editar Perfil</span>
                         </button>
                         {/* Adicione o botão seguir/deixar de seguir se fizer sentido aqui */}
                         {/* Exemplo:
                         <button
                             onClick={() => { setSeguindo(!seguindo); localStorage.setItem('isFollowingPage', (!seguindo).toString()); }}
                             className={`w-full px-4 py-2 rounded-md font-medium transition-colors text-sm flex items-center justify-center space-x-2 ${ seguindo ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-gray-100 text-gray-800 hover:bg-gray-200' }`}
                         >
                             {seguindo ? <UserMinus className='w-4 h-4'/> : <UserPlus className='w-4 h-4'/>}
                             <span>{seguindo ? "Deixar de seguir (página)" : "Seguir (página)"}</span>
                         </button>
                         */}
                    </div>

                    {/* Outros links de navegação poderiam vir aqui */}
                    {/* Ex: <Link to="/configuracoes" onClick={onClose} className="...">Configurações</Link> */}

                </div>

                {/* Botão Sair (no final) */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                    <button
                        onClick={() => { onLogout(); onClose(); }} // Fecha sidebar ao sair
                        className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-md transition-colors flex items-center justify-center space-x-2"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sair</span>
                    </button>
                </div>
            </aside>
        </>
    );
};

export default MobileSidebar;