// src/pages/CreateTweet.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import EmojiPicker from "emoji-picker-react";

const CreateTweet = () => {
  const [content, setContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [charLimit] = useState(280);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) navigate("/login"); // Rota protegida
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8000/api/tweets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      if (response.ok) {
        alert("Tweet postado com sucesso!");
        setContent("");
        navigate("/feed");
      } else {
        const data = await response.json();
        alert("Erro ao postar: " + data.detail);
      }
    } catch (error: any) {
      alert("Erro de conexão: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmojiClick = (emojiData: any) => {
    setContent((prev) => prev + emojiData.emoji);
  };

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-[#f3f4f6] p-4">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl border border-azul-cremoso-DEFAULT">
        <div className="bg-gradient-to-r from-azul-cremoso-DEFAULT to-azul-cremoso-dark p-6 text-center">
          <h2 className="text-2xl font-bold text-[#4a7bc1]">O que está acontecendo?</h2>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= charLimit) setContent(e.target.value);
            }}
            placeholder="Escreva seu tweet aqui..."
            rows={4}
            className="w-full px-5 py-3 rounded-lg border border-azul-cremoso-DEFAULT focus:ring-2 focus:ring-azul-cremoso-dark focus:border-transparent transition-all resize-none"
            required
          />

          <div className="flex justify-between items-center text-sm text-gray-500">
            <span>{content.length}/{charLimit} caracteres</span>
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="text-azul-cremoso-dark hover:underline"
            >
              {showEmojiPicker ? "Fechar emojis" : "🙂 Emoji"}
            </button>
          </div>

          {showEmojiPicker && (
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl p-2">
              <EmojiPicker onEmojiClick={handleEmojiClick} />
            </div>
          )}

          {/* Prévia com Markdown */}
          {content && (
            <div className="bg-gray-100 border border-gray-300 p-4 rounded-xl">
              <p className="text-sm text-gray-600 mb-1">Prévia do Tweet:</p>
              <ReactMarkdown className="prose">{content}</ReactMarkdown>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || content.length === 0}
            className={`w-full py-3 px-4 rounded-lg font-semibold text-white shadow-md transition-all ${
              isLoading
                ? "bg-azul-cremoso-DEFAULT cursor-not-allowed"
                : "bg-azul-cremoso-dark hover:bg-azul-texto hover:shadow-lg"
            }`}
          >
            {isLoading ? "Postando..." : "Tweetar"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTweet;
