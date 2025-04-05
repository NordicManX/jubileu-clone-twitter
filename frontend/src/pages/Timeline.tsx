import { useEffect, useState } from "react";

interface Tweet {
  id: number;
  autor: string;
  conteudo: string;
  data: string;
}

const Timeline = () => {
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [userEmail, setUserEmail] = useState("");
  const [novoTweet, setNovoTweet] = useState("");

  useEffect(() => {
    const tweetsMockados: Tweet[] = [
      {
        id: 1,
        autor: "Enzo Gouveia",
        conteudo: "Primeiro tweet no Jubileu! 🎉",
        data: "2025-03-31 10:32",
      },
      {
        id: 2,
        autor: "Maria Silva",
        conteudo: "Esse clone do Twitter tá ficando top demais! 🚀",
        data: "2025-03-31 11:15",
      },
      {
        id: 3,
        autor: "João Pedro",
        conteudo: "Bom dia, devs! 💻☕",
        data: "2025-03-31 12:01",
      },
    ];

    setTweets(tweetsMockados);

    const storedEmail = localStorage.getItem("userEmail");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const handleNovoTweet = () => {
    if (novoTweet.trim() === "") return;

    const novo: Tweet = {
      id: tweets.length + 1,
      autor: userEmail || "Usuário Desconhecido",
      conteudo: novoTweet,
      data: new Date().toLocaleString(),
    };

    setTweets([novo, ...tweets]);
    setNovoTweet("");
  };

  return (
    <div className="min-h-screen h-screen flex w-screen bg-[#f0f4fa] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-80 bg-white border-r border-azul-cremoso-DEFAULT p-6 shadow-md hidden md:block">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-[#4a7bc1] mb-2">Perfil</h2>
          <div className="bg-blue-100 rounded-full w-20 h-20 mx-auto mb-4" />
          <p className="text-gray-700">Email:</p>
          <p className="font-medium text-azul-texto break-words">{userEmail || "Desconhecido"}</p>
        </div>
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
              className="w-full h-28 resize-none border border-azul-cremoso-DEFAULT rounded-xl p-4 text-azul-texto bg-white placeholder-[#a0bfe8] shadow-sm focus:outline-none focus:ring-2 focus:ring-azul-cremoso-dark"
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
                  <h2 className="font-semibold text-azul-texto">{tweet.autor}</h2>
                  <span className="text-sm text-[#7aaae8]">{tweet.data}</span>
                </div>
                <p className="text-gray-800">{tweet.conteudo}</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Timeline;
