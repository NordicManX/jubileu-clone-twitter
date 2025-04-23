// src/pages/Timeline.tsx
import { useEffect, useState } from "react";
import { MoreHorizontal, Share2, Edit, Trash2, Heart } from "lucide-react";
import Sidebar from "../components/Sidebar";

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
    const handleClickForaDoMenu = (event: MouseEvent) => {
      const menuAbertoElement = document.getElementById(`menu-${menuAberto}`);
      if (menuAberto && menuAbertoElement && !menuAbertoElement.contains(event.target as Node)) {
        setMenuAberto(null);
      }
    };

    document.addEventListener("mousedown", handleClickForaDoMenu);
    return () => document.removeEventListener("mousedown", handleClickForaDoMenu);
  }, [menuAberto]);

  const handleNovoTweet = async () => {
    if (novoTweet.trim() === "" || novoTweet.length > 280) return;

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

  const handleCurtir = (tweetId: number) => {
    setTweets((prev) =>
      prev.map((t) =>
        t.id === tweetId
          ? { ...t, curtidas: curtidos[tweetId] ? (t.curtidas || 0) - 1 : (t.curtidas || 0) + 1 }
          : t
      )
    );
    setCurtidos((prev) => ({ ...prev, [tweetId]: !prev[tweetId] }));
  };

  const handleEditar = (tweet: Tweet) => {
    setEditandoId(tweet.id);
    setTweetEditado(tweet.content);
    setMenuAberto(null);
  };

  const handleSalvarEdicao = async (tweetId: number) => {
    const token = localStorage.getItem("token");
    if (!token) return alert("Precisa estar logado para editar.");

    try {
      const res = await fetch(`https://jubileu-clone-twitter.onrender.com/tweets/${tweetId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: tweetEditado }),
      });

      if (!res.ok) throw new Error("Erro ao editar tweet");

      setTweets((prev) =>
        prev.map((t) => (t.id === tweetId ? { ...t, content: tweetEditado } : t))
      );
      setEditandoId(null);
      setTweetEditado("");
    } catch (err) {
      console.error("Erro ao editar:", err);
    }
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setTweetEditado("");
  };

  const handleExcluir = async (tweetId: number) => {
    if (!window.confirm("Tem certeza que deseja excluir este tweet?")) return;

    const token = localStorage.getItem("token");
    if (!token) return alert("Precisa estar logado para excluir.");

    try {
      const res = await fetch(`https://jubileu-clone-twitter.onrender.com/tweets/${tweetId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Erro ao excluir tweet");

      setTweets((prev) => prev.filter((t) => t.id !== tweetId));
    } catch (err) {
      console.error("Erro ao excluir tweet:", err);
    }
  };

  const salvarPerfil = () => {
    if (novoNome) {
      localStorage.setItem("userName", novoNome);
      setUserName(novoNome);
    }
    if (novoEmail) {
      localStorage.setItem("userEmail", novoEmail);
      setUserEmail(novoEmail);
    }
    setMostrarModal(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
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
        <div className="bg-white rounded-2xl shadow-xl border border-[#a0bfe8] h-full w-full flex flex-col">
          <div className="bg-gradient-to-r from-[#a0bfe8] to-[#4a7bc1] p-6 rounded-t-2xl text-center" />
          <div className="p-6 border-b border-[#a0bfe8] bg-[#f9fbff]">
            <textarea
              className="w-full h-28 resize-none border border-[#a0bfe8] rounded-xl p-4 text-[#4a7bc1] bg-white placeholder-[#a0bfe8] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4a7bc1]"
              placeholder="O que você está pensando?"
              value={novoTweet}
              onChange={(e) => setNovoTweet(e.target.value)}
            />
            <div className="text-right mt-2">
              <button
                onClick={handleNovoTweet}
                className={`${
                  novoTweet.trim() === "" || userName === "" || userEmail === ""
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#4a7bc1] hover:bg-[#2d6cb1]"
                } text-white font-medium px-6 py-2 rounded-full transition-all`}
                disabled={novoTweet.trim() === "" || userName === "" || userEmail === ""}
              >
                Enviar
              </button>
            </div>
          </div>

          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className="border border-[#a0bfe8] rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all relative"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#4a7bc1]">{tweet.owner?.name}</h2>
                  <div className="relative" id={`menu-${tweet.id}`}>
                    <MoreHorizontal
                      className="w-5 h-5 cursor-pointer"
                      onClick={() =>
                        setMenuAberto((prev) => (prev === tweet.id ? null : tweet.id))
                      }
                    />
                    {menuAberto === tweet.id &&
                      tweet.owner_id === Number(localStorage.getItem("userId")) && (
                        <div className="absolute right-0 mt-2 bg-white border rounded shadow-md z-10 w-36">
                          <button
                            onClick={() => handleEditar(tweet)}
                            className="w-full text-left px-4 py-2 hover:bg-[#4a7bc1] text-[#4a7bc1]"
                          >
                            <Edit className="inline-block mr-2" /> Editar
                          </button>
                          <button
                            onClick={() => handleExcluir(tweet.id)}
                            className="w-full text-left px-4 py-2 hover:bg-[#d9534f] text-[#d9534f]"
                          >
                            <Trash2 className="inline-block mr-2" /> Excluir
                          </button>
                        </div>
                      )}
                  </div>
                </div>
                <p className="text-[#333]">{tweet.content}</p>
                <div className="mt-3 flex items-center space-x-4">
                  <button
                    onClick={() => handleCurtir(tweet.id)}
                    className={`${
                      curtidos[tweet.id] ? "text-[#d9534f]" : "text-[#4a7bc1]"
                    } flex items-center space-x-2 hover:text-[#d9534f] transition-all`}
                  >
                    <Heart className="w-5 h-5" />
                    <span>{tweet.curtidas || 0}</span>
                  </button>
                  <button className="flex items-center space-x-2 hover:text-[#4a7bc1]">
                    <Share2 className="w-5 h-5" />
                    <span>Compartilhar</span>
                  </button>
                </div>
                {editandoId === tweet.id && (
                  <div className="mt-4 flex items-center space-x-4">
                    <textarea
                      value={tweetEditado}
                      onChange={(e) => setTweetEditado(e.target.value)}
                      className="w-full border border-[#a0bfe8] p-4 rounded-xl"
                    />
                    <button
                      onClick={() => handleSalvarEdicao(tweet.id)}
                      className="bg-[#4a7bc1] text-white px-4 py-2 rounded-xl"
                    >
                      Salvar
                    </button>
                    <button
                      onClick={handleCancelarEdicao}
                      className="bg-gray-300 text-[#4a7bc1] px-4 py-2 rounded-xl"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>

      {mostrarModal && (
        <div className="absolute inset-0 bg-[#00000040] flex justify-center items-center z-50">
          <div className="bg-white p-8 rounded-xl w-1/3">
            <h2 className="text-xl font-semibold mb-6 text-[#4a7bc1]">Editar Perfil</h2>
            <input
              type="text"
              placeholder="Novo nome"
              className="w-full p-3 mb-4 border border-[#a0bfe8] rounded-xl"
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
            />
            <input
              type="email"
              placeholder="Novo email"
              className="w-full p-3 mb-6 border border-[#a0bfe8] rounded-xl"
              value={novoEmail}
              onChange={(e) => setNovoEmail(e.target.value)}
            />
            <div className="flex justify-between">
              <button
                onClick={salvarPerfil}
                className="bg-[#4a7bc1] text-white px-4 py-2 rounded-xl"
              >
                Salvar
              </button>
              <button
                onClick={() => setMostrarModal(false)}
                className="bg-gray-300 text-[#4a7bc1] px-4 py-2 rounded-xl"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Timeline;
