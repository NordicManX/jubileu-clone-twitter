const Sidebar = ({
  userName,
  userEmail,
  seguindo,
  setSeguindo,
  setMostrarModal,
  setNovoNome,
  setNovoEmail,
  handleLogout,
}: SidebarProps) => {
  return (
    <aside className="w-80 bg-white border-r border-azul-cremoso-DEFAULT p-6 shadow-md hidden md:flex flex-col justify-between">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4a7bc1] mb-2">Perfil</h2>
        <div className="bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4" />
        <p className="text-gray-700">Nome:</p>
        <p className="font-medium text-[#4a7bc1] break-words">
          {userName || userEmail?.split("@")[0] || "Desconhecido"}
        </p>

        <button
          onClick={() => {
            console.log("Abrindo o modal..."); // Verificando se o clique é registrado
            setNovoNome(userName);
            setNovoEmail(userEmail);
            setMostrarModal(true); // Abre o modal
          }}
          className="mt-2 px-2 py-1 text-sm bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-all"
        >
          Editar perfil
        </button>

        <button
          onClick={() => {
            const novoEstado = !seguindo;
            setSeguindo(novoEstado);
            localStorage.setItem("isFollowingPage", novoEstado.toString());
          }}
          className={`mt-6 px-4 py-1 rounded-full font-medium transition-all ${
            seguindo
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-[#4a7bc1] text-white hover:bg-[#3a65a1]"
          }`}
        >
          {seguindo ? "Deixar de seguir" : "Seguir"}
        </button>
      </div>

      <button
        onClick={handleLogout}
        className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-all"
      >
        Sair
      </button>
    </aside>
  );
};

export default Sidebar;
