import { useEffect, useState } from "react";

interface Tweet {
  id: number;
  autor: string;
  conteudo: string;
  data: string;
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

  useEffect(() => {
    const tweetsMockados: Tweet[] = [
      {
        id: 1,
        autor: "Enzo Gouveia",
        conteudo: "Primeiro tweet no Jubileu! 🎉",
        data: "2025-03-31 10:32",
        curtidas: 1,
      },
      {
        id: 2,
        autor: "Maria Silva",
        conteudo: "Esse clone do Twitter tá ficando top demais! 🚀",
        data: "2025-03-31 11:15",
        curtidas: 0,
      },
      {
        id: 3,
        autor: "João Pedro",
        conteudo: "Bom dia, devs! 💻☕",
        data: "2025-03-31 12:01",
        curtidas: 3,
      },
    ];

    const storedTweets = localStorage.getItem("tweets");
    if (storedTweets) {
      setTweets(JSON.parse(storedTweets));
    } else {
      setTweets(tweetsMockados);
    }

    const storedEmail = localStorage.getItem("userEmail");
    const storedName = localStorage.getItem("userName");

    if (storedEmail) setUserEmail(storedEmail);
    if (storedName) setUserName(storedName);
  }, []);

  useEffect(() => {
    localStorage.setItem("tweets", JSON.stringify(tweets));
  }, [tweets]);

  const handleNovoTweet = () => {
    if (novoTweet.trim() === "") return;

    const novo: Tweet = {
      id: tweets.length + 1,
      autor: userName || "Desconhecido",
      conteudo: novoTweet,
      data: new Date().toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
      curtidas: 0,
    };

    setTweets([novo, ...tweets]);
    setNovoTweet("");
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
    setTweetEditado(tweet.conteudo);
  };

  const handleSalvarEdicao = (tweetId: number) => {
    setTweets((prev) =>
      prev.map((tweet) =>
        tweet.id === tweetId ? { ...tweet, conteudo: tweetEditado } : tweet
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
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen h-screen flex w-screen bg-[#4a7bc1] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-azul-cremoso-DEFAULT p-6 shadow-md hidden md:flex flex-col justify-between">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4a7bc1] mb-2">Perfil</h2>
          <div className="bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4" />
          <p className="text-gray-700">Nome:</p>
          <p className="font-medium text-azul-texto break-words">{userName || "Desconhecido"}</p>
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
                  <h2 className="font-semibold text-[#4a7bc1]">{tweet.autor}</h2>
                  <span className="text-sm text-[#7aaae8]">{tweet.data}</span>
                </div>

                {editandoId === tweet.id ? (
                  <textarea
                    className="w-full border border-gray-300 p-2 rounded mb-2"
                    value={tweetEditado}
                    onChange={(e) => setTweetEditado(e.target.value)}
                  />
                ) : (
                  <p className="text-[#4a7bc1] mb-4">{tweet.conteudo}</p>
                )}

                <div className="flex gap-4 text-sm">
                  {tweet.autor === userName && (
                    editandoId === tweet.id ? (
                      <>
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
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleEditar(tweet)}
                          className="text-blue-600 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleExcluir(tweet.id)}
                          className="text-red-500 hover:underline"
                        >
                          Excluir
                        </button>
                      </>
                    )
                  )}

                  <button className="text-[#4a7bc1] hover:underline">Compartilhar</button>
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
    </div>
  );
};

export default Timeline;
