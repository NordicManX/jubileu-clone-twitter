// src/components/Sidebar.tsx (ou seu caminho)
import React from "react";

// Interface de Props (mantendo a última versão correta)
interface SidebarProps {
    userName: string;
    userEmail: string;
    seguindo: boolean;
    setSeguindo: (value: boolean) => void;
    setMostrarModal: () => void; // Função para abrir o modal
    handleLogout: () => void;
}

const Sidebar = ({
    userName,
    userEmail,
    seguindo,
    setSeguindo,
    setMostrarModal,
    handleLogout,
}: SidebarProps) => {
    return (
        // REMOVIDO: justify-between
        // ADICIONADO: h-screen (para ter altura definida)
        <aside className="w-80 bg-white border-r border-gray-200 p-6 shadow-md hidden md:flex flex-col flex-shrink-0 h-screen"> {/* Ajustei a cor da borda para exemplo */}

            {/* Bloco de conteúdo superior (perfil, botões editar/seguir) */}
            {/* Este bloco vai ficar no topo normalmente */}
            <div className="text-center">
                <h2 className="text-2xl font-bold text-[#4a7bc1] mb-2">Perfil</h2>
                <div className="bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4" /> {/* Placeholder de Avatar */}
                <p className="text-gray-700 text-sm">Nome:</p> {/* Ajustei tamanho fonte */}
                <p className="font-medium text-lg text-[#4a7bc1] break-words mb-2"> {/* Ajustei tamanho fonte */}
                    {userName || userEmail?.split("@")[0] || "Desconhecido"}
                </p>

                <button
                    onClick={setMostrarModal}
                    className="mb-4 px-3 py-1 text-xs bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors" /* Ajustei padding/fonte */
                >
                    Editar perfil
                </button>

                {/* Botão Seguir (sem alterações na lógica) */}
                <button
                    onClick={() => {
                        const novoEstado = !seguindo;
                        setSeguindo(novoEstado);
                        localStorage.setItem("isFollowingPage", novoEstado.toString());
                    }}
                    className={`w-full px-4 py-2 rounded-full font-medium transition-colors text-sm ${ // w-full e text-sm
                        seguindo
                            ? "bg-red-100 text-red-700 border border-red-300 hover:bg-red-200" // Estilo "seguindo"
                            : "bg-[#4a7bc1] text-white hover:bg-[#3a65a1]" // Estilo "seguir"
                    }`}
                >
                    {seguindo ? "Deixar de seguir" : "Seguir"}
                </button>
            </div>

            {/* Botão Sair */}
            {/* ADICIONADO: mt-auto para empurrar para baixo */}
            <button
                onClick={handleLogout}
                className="mt-auto w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-colors" // Adicionei w-full se desejar
            >
                Sair
            </button>
        </aside>
    );
};

export default Sidebar;