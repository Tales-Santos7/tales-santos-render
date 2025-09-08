import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaArrowLeft } from "react-icons/fa";
const apiUrl = process.env.REACT_APP_API_URL;

export default function PostDetails() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`${apiUrl}/blog/${id}`);
        setPost(res.data);
      } catch (error) {
        console.error("Erro ao carregar o post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p className="text-lg">A carregar...</p>
      </div>
    );
  }

  if (!post) {
    return <p className="text-center mt-10">Post não encontrado.</p>;
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-white shadow-lg rounded-lg p-6">
        <button
          onClick={() => navigate("/")}
          className="mb-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <FaArrowLeft /> Voltar
        </button>

        <h1 className="text-2xl font-bold mb-4">{post.title}</h1>

        {post.imageUrl && (
          <img
            src={post.imageUrl}
            alt={post.title}
            className="w-full rounded mb-4"
          />
        )}

        <p className="mb-4">{post.content}</p>

        <p className="text-sm text-gray-500">
          Publicado em:{" "}
          {new Date(post.createdAt).toLocaleDateString("pt-BR", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
    </div>
  );
}
