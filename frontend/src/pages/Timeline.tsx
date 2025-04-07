import { useEffect, useState } from "react";

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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:8000/tweets/");
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

    const token = localStorage.getItem("token");

    if (!token) {
      alert("Você precisa estar logado para postar.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/tweets/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: novoTweet }),
      });

      if (!res.ok) {
        throw new Error("Erro ao criar tweet");
      }

      const tweetCriado = await res.json();
      setTweets([tweetCriado, ...tweets]);
      setNovoTweet("");
    } catch (error) {
      console.error("Erro ao criar tweet:", error);
    }
  };

  const handleCurtir = (tweetId: number) => {
    setTweets((prevTweets) =>
      prevTweets.map((tweet) => {
        if (tweet.id === tweetId) {
          const jaCurtiu = curtidos[tweetId];
          return {
            ...tweet,
            curtidas: jaCurtiu
              ? (tweet.curtidas || 0) - 1
              : (tweet.curtidas || 0) + 1,
          };
        }
        return tweet;
      })
    );

    setCurtidos((prev) => ({
      ...prev,
      [tweetId]: !prev[tweetId],
    }));
  };

  const handleEditar = (tweet: Tweet) => {
    setEditandoId(tweet.id);
    setTweetEditado(tweet.content);
  };

  const handleSalvarEdicao = (tweetId: number) => {
    setTweets((prev) =>
      prev.map((tweet) =>
        tweet.id === tweetId ? { ...tweet, content: tweetEditado } : tweet
      )
    );
    setEditandoId(null);
    setTweetEditado("");
  };

  const handleCancelarEdicao = () => {
    setEditandoId(null);
    setTweetEditado("");
  };

  const handleExcluir = (tweetId: number) => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este tweet?");
    if (confirmar) {
      setTweets((prev) => prev.filter((tweet) => tweet.id !== tweetId));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userName");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  const handleSeguirPagina = () => {
    if (!seguindo) {
      setSeguindo(true);
      localStorage.setItem("isFollowingPage", "true");
    }
  };

  return (
    <div className="min-h-screen h-screen flex w-screen bg-[#4a7bc1] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-azul-cremoso-DEFAULT p-6 shadow-md hidden md:flex flex-col justify-between">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4a7bc1] mb-2">Perfil</h2>
          <div className="bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4" />
          <p className="text-gray-700">Nome:</p>
          <p className="font-medium text-[#4a7bc1] break-words">
            {userName || userEmail?.split("@")[0] || "Desconhecido"}
          </p>

          {/* Botão de seguir */}
          <div className="mt-6">
            <button
              onClick={handleSeguirPagina}
              disabled={seguindo}
              className={`px-4 py-2 rounded-full font-medium transition-all ${
                seguindo
                  ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                  : "bg-[#4a7bc1] text-white hover:bg-[#3a65a1]"
              }`}
            >
              {seguindo ? "Seguindo ✅" : "Seguir"}
            </button>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-4 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-full transition-all"
        >
          Sair
        </button>
      </aside>

      {/* Timeline */}
      <main className="flex-1 h-full overflow-y-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-azul-cremoso-DEFAULT h-full w-full flex flex-col">
          <div className="bg-gradient-to-r from-azul-cremoso-DEFAULT to-azul-cremoso-dark p-6 rounded-t-2xl text-center">
            <h1 className="text-3xl font-bold text-[#4a7bc1]">Timeline</h1>
            <p className="text-[#7aaae8]/90 mt-1">Veja o que a galera anda postando</p>
          </div>

          {/* Box de criação de tweet */}
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

          {/* Lista de tweets */}
          <div className="p-6 space-y-6 flex-1 overflow-y-auto">
            {tweets.map((tweet) => (
              <div
                key={tweet.id}
                className="border border-azul-cremoso-DEFAULT rounded-xl p-4 bg-white shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-[#4a7bc1]">{tweet.owner?.name || "Desconhecido"}</h2>
                  <span className="text-sm text-[#7aaae8]">{new Date(tweet.created_at).toLocaleString()}</span>
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

                <div className="flex gap-4 text-sm">
                  {tweet.owner?.name === userName && (
                    editandoId === tweet.id ? (
                      <>
                        <button onClick={() => handleSalvarEdicao(tweet.id)} className="text-green-600 hover:underline">
                          Salvar
                        </button>
                        <button onClick={handleCancelarEdicao} className="text-gray-500 hover:underline">
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleEditar(tweet)} className="text-blue-600 hover:underline">
                          Editar
                        </button>
                        <button onClick={() => handleExcluir(tweet.id)} className="text-red-500 hover:underline">
                          Excluir
                        </button>
                      </>
                    )
                  )}

                  <button className="text-[#4a7bc1] hover:underline">Compartilhar</button>
                  <button
                    onClick={() => handleCurtir(tweet.id)}
                    className={`flex items-center gap-1 font-medium ${
                      curtidos[tweet.id] ? "text-red-500" : "text-[#4a7bc1] hover:text-red-500"
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
    </div>
  );
};

export default Timeline;
