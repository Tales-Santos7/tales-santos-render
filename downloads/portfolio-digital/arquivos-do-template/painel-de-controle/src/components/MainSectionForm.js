import React, { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const MainSectionForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Carregar dados existentes
    const fetchMainSection = async () => {
      try {
        const response = await axios.get(`${apiUrl}/content/mainSection`);
        if (response.data) {
          setTitle(response.data.title);
          setDescription(response.data.description);
        }
      } catch (error) {
        console.error("Erro ao carregar a seção principal:", error);
      }
    };

    fetchMainSection();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.put(`${apiUrl}/content/mainSection`, {
        title,
        description,
      });
      alert("Seção atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar a seção:", error);
      alert("Erro ao salvar a seção");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Editar Seção Principal</h2>
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
          <label>Descrição:</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>
        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Salvar Alterações"}
        </button>
      </form>
    </div>
  );
};

export default MainSectionForm;
