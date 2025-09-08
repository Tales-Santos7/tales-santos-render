import React, { useState } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const PostForm = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null); // Guardar o arquivo de imagem

  const handleImageChange = (e) => {
    setImage(e.target.files[0]); // Captura o arquivo selecionado
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Configurar FormData para envio de dados e arquivo
    const formData = new FormData();
    formData.append("title", title);
    formData.append("content", content);
    if (image) {
      formData.append("image", image);
    }

    try {
      await axios.post(`${apiUrl}/blog`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("Post criado com sucesso!");
      setTitle("");
      setContent("");
      setImage(null);
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert("Erro ao criar post");
    }
  };

  return (
    <div className="container">
      <h2>Criar Novo Post</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>
        <div>
          <label>Conteúdo:</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          ></textarea>
        </div>
        <div>
          <label>Imagem:</label>
          <input type="file" onChange={handleImageChange} />
        </div>
        <button type="submit">Criar Post</button>
      </form>
    </div>
  );
};

export default PostForm;
