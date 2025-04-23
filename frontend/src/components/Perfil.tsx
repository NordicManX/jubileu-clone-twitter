import React, { useState } from "react";
import Sidebar from "./Sidebar";

const Perfil = () => {
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");

  const handleLogout = () => {
    localStorage.clear();
  };

  return (
    <div className="flex">
      <Sidebar
        userName="João"
        userEmail="joao@email.com"
        seguindo={false}
        setSeguindo={() => {}}
        setMostrarModal={setMostrarModal}
        setNovoNome={setNovoNome}
        setNovoEmail={setNovoEmail}
        handleLogout={handleLogout}
      />

      {/* Modal de edição */}
      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-semibold mb-4">Editar Perfil</h2>
            <form>
              <div className="mb-4">
                <label className="block text-sm text-gray-700" htmlFor="nome">
                  Nome
                </label>
                <input
                  type="text"
                  id="nome"
                  value={novoNome}
                  onChange={(e) => setNovoNome(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm text-gray-700" htmlFor="email">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  value={novoEmail}
                  onChange={(e) => setNovoEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-md"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-md"
              >
                Salvar
              </button>
              <button
                type="button"
                onClick={() => {
                  console.log("Cancelando...");
                  setMostrarModal(false);
                }}
                className="ml-4 text-gray-500"
              >
                Cancelar
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Perfil;
