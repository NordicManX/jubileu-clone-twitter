import { useEffect, useState } from "react";
import { MoreHorizontal, Share2, Edit, Trash2 } from "lucide-react";
import Sidebar from "../components/Sidebar"; // ajuste o caminho conforme necessário

interface Tweet {
  id: number;
  content: string;
  created_at: string;
  owner_id: number;
  owner: {
    id: number;
    name: string;
    email: string;
    created_at: string;
  };
  curtidas?: number;
}

const Timeline = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [novoTweet, setNovoTweet] = useState("");
  const [curtidos, setCurtidos] = useState<{ [tweetId: number]: boolean }>({});
  const [editandoId, setEditandoId] = useState<number | null>(null);
  const [tweetEditado, setTweetEditado] = useState("");
  const [seguindo, setSeguindo] = useState<boolean>(false);
  const [menuAberto, setMenuAberto] = useState<number | null>(null);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novoEmail, setNovoEmail] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("https://jubileu-clone-twitter.onrender.com/tweets/");
        const data = await res.json();
        setTweets(data);
      } catch (error) {
        console.error("Erro ao buscar tweets:", error);
      }

      const storedEmail = localStorage.getItem("userEmail");
      const storedName = localStorage.getItem("userName");
      const isFollowing = localStorage.getItem("isFollowingPage");

      if (storedEmail) setUserEmail(storedEmail);
      if (storedName) setUserName(storedName);
      if (isFollowing === "true") setSeguindo(true);
    };

    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem("tweets", JSON.stringify(tweets));
  }, [tweets]);

  const handleNovoTweet = async () => {
    if (novoTweet.trim() === "") return;
    if (novoTweet.length > 280) {
      alert("Seu tweet ultrapassa o limite de 280 caracteres.");
      return;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para postar.");
      return;
    }

    try {
      const res = await fetch("https://jubileu-clone-twitter.onrender.com/tweets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: novoTweet }),
      });

      if (!res.ok) throw new Error("Erro ao criar tweet");

      const tweetCriado = await res.json();
      setTweets([tweetCriado, ...tweets]);
      setNovoTweet("");
    } catch (error) {
      console.error("Erro ao criar tweet:", error);
    }
  };

  useEffect(() => {
    const handleClickForaDoMenu = (event: MouseEvent) => {
      const menuAbertoElement = document.getElementById(`menu-${menuAberto}`);
      if (menuAberto && menuAbertoElement && !menuAbertoElement.contains(event.target as Node)) {
        setMenuAberto(null);
      }
    };

    document.addEventListener("mousedown", handleClickForaDoMenu);
    return () => document.removeEventListener("mousedown", handleClickForaDoMenu);
  }, [menuAberto]);

  const handleCurtir = (tweetId: number) => {
    setTweets((prevTweets) =>
      prevTweets.map((tweet) =>
        tweet.id === tweetId
          ? {
              ...tweet,
              curtidas: curtidos[tweetId]
                ? (tweet.curtidas || 0) - 1
                : (tweet.curtidas || 0) + 1,
            }
          : tweet
      )
    );

    setCurtidos((prev) => ({
      ...prev,
      [tweetId]: !prev[tweetId],
    }));
  };

  const handleEditar = (tweet: Tweet) => {
    setEditandoId(tweet.id);
    setTweetEditado(tweet.content);
    setMenuAberto(null);
  };

  const handleSalvarEdicao = async (tweetId: number) => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para editar.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/tweets/${tweetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: tweetEditado }),
      });

      if (!res.ok) throw new Error("Erro ao salvar tweet editado");

      setTweets((prev) =>
        prev.map((tweet) =>
          tweet.id === tweetId ? { ...tweet, content: tweetEditado } : tweet
        )
      );
      setEditandoId(null);
      setTweetEditado("");
    } catch (error) {
      console.error("Erro ao salvar edição:", error);
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setTweetEditado("");
  };

  const handleExcluir = async (tweetId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este tweet?")) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para excluir.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8000/tweets/${tweetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao excluir tweet");

      setTweets((prev) => prev.filter((tweet) => tweet.id !== tweetId));
    } catch (error) {
      console.error("Erro ao excluir tweet:", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const salvarPerfil = () => {
    setUserName(novoNome);
    setUserEmail(novoEmail);
    localStorage.setItem("userName", novoNome);
    localStorage.setItem("userEmail", novoEmail);
    setMostrarModal(false);
  };

  return (
    <div className="min-h-screen h-screen flex w-screen bg-[#4a7bc1] overflow-hidden">
      <Sidebar
        userName={userName}
        userEmail={userEmail}
        seguindo={seguindo}
        setSeguindo={setSeguindo}
        setMostrarModal={setMostrarModal}
        setNovoNome={setNovoNome}
        setNovoEmail={setNovoEmail}
        handleLogout={handleLogout}
      />

      <main className="flex-1 h-full overflow-y-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-azul-cremoso-DEFAULT h-full w-full flex flex-col">
          <div className="bg-gradient-to-r from-azul-cremoso-DEFAULT to-azul-cremoso-dark p-6 rounded-t-2xl text-center" />
          <div className="p-6 border-b border-azul-cremoso-DEFAULT bg-[#f9fbff]">
            <textarea
              className="w-full h-28 resize-none border border-azul-cremoso-DEFAULT rounded-xl p-4 text-[#4a7bc1] bg-white placeholder-[#a0bfe8] shadow-sm focus:outline-none focus:ring-2 focus:ring-azul-cremoso-dark"
              placeholder="O que você está pensando?"
              value={novoTweet}
              onChange={(e) => setNovoTweet(e.target.value)}
            />
            <div className="text-right mt-2">
              <button
                onClick={handleNovoTweet}
                className="bg-azul-cremoso-DEFAULT hover:bg-azul-cremoso-dark text-white font-medium px-6 py-2 rounded-full transition-all"
              >
                Enviar
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className="border border-azul-cremoso-DEFAULT rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#4a7bc1]">
                    {tweet.owner?.name || "Desconhecido"}
                  </h2>
                  <div className="relative">
                    <MoreHorizontal
                      className="w-5 h-5 cursor-pointer"
                      onClick={() =>
                        setMenuAberto((prev) =>
                          prev === tweet.id ? null : tweet.id
                        )
                      }
                    />
                    {menuAberto === tweet.id &&
                      tweet.owner_id === Number(localStorage.getItem("userId")) && (
                        <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-10 w-32">
                          <button
                            onClick={() => handleEditar(tweet)}
                            className="flex items-center gap-2 px-4 py-2 w-full text-sm text-left text-blue-600 hover:bg-blue-50"
                          >
                            <Edit className="w-4 h-4" /> Editar
                          </button>
                          <button
                            onClick={() => handleExcluir(tweet.id)}
                            className="flex items-center gap-2 px-4 py-2 w-full text-sm text-left text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" /> Remover
                          </button>
                        </div>
                      )}
                  </div>
                </div>

                {editandoId === tweet.id ? (
                  <textarea
                    className="w-full border border-gray-300 p-2 rounded mb-2"
                    value={tweetEditado}
                    onChange={(e) => setTweetEditado(e.target.value)}
                  />
                ) : (
                  <p className="text-[#4a7bc1] mb-4">{tweet.content}</p>
                )}

                {editandoId === tweet.id && (
                  <div className="flex gap-2 mb-2">
                    <button
                      onClick={() => handleSalvarEdicao(tweet.id)}
                      className="text-green-600 hover:underline"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelarEdicao}
                      className="text-gray-500 hover:underline"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                <div className="flex items-center gap-4 text-sm">
                  <button className="text-[#4a7bc1] hover:text-[#3a65a1] flex items-center gap-1">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleCurtir(tweet.id)}
                    className={`flex items-center gap-1 font-medium ${
                      curtidos[tweet.id]
                        ? "text-red-500"
                        : "text-[#4a7bc1] hover:text-red-500"
                    }`}
                  >
                    {curtidos[tweet.id] ? "❤️" : "♡"}
                    <span>{tweet.curtidas || 0}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {mostrarModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-lg">
            <h2 className="text-xl font-semibold mb-4 text-[#4a7bc1]">Editar Perfil</h2>
            <label className="block mb-2 text-sm text-[#4a7bc1]">Novo Nome</label>
            <input
              type="text"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
            <label className="block mb-2 text-sm text-[#4a7bc1]">Novo Email</label>
            <input
              type="email"
              className="w-full mb-4 p-2 border border-gray-300 rounded"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setMostrarModal(false)}
                className="text-gray-600 hover:underline"
              >
                Cancelar
              </button>
              <button
                onClick={salvarPerfil}
                className="bg-azul-cremoso-DEFAULT hover:bg-azul-cremoso-dark text-white px-4 py-2 rounded"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
