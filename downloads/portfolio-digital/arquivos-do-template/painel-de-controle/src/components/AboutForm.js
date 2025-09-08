import React, { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const AboutForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await axios.get(`${apiUrl}/content/about`);
        setTitle(response.data.title);
        setDescription(response.data.description);
      } catch (error) {
        console.error("Erro ao carregar conteúdo sobre mim:", error);
      }
    };
    fetchAbout();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/content/about`, {
        title,
        description,
      });
      alert('Seção "Sobre Mim" atualizada com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar seção "Sobre Mim":', error);
      alert("Erro ao atualizar conteúdo");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card-form">
      <h2>Editar Seção Sobre Mim</h2>
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
        <label>Descrição:</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        ></textarea>
      </div>
      <button className="btn-green" type="submit">
        Salvar Alterações
      </button>
    </form>
  );
};

export default AboutForm;
