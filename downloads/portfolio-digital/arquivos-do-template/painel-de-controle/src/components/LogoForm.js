import React, { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const LogoForm = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    const fetchLogo = async () => {
      try {
        const res = await axios.get(`${apiUrl}/content/logo`);
        if (res.data) {
          setTitle(res.data.title || "");
          setDescription(res.data.description || "");
        }
      } catch (err) {
        console.error("Erro ao buscar logo:", err);
      }
    };

    fetchLogo();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${apiUrl}/content/logo`, {
        title,
        description,
      });
      setStatus("Texto da logo atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar texto da logo:", err);
      setStatus("Erro ao atualizar logo.");
    }
  };

  return (
    <div className="card-form">
      <h2>Texto da Logo</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Título:</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: USER"
          />
        </div>
        <div>
          <label>Subtítulo:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ex: Lifestyle - Beauty - Study"
          />
        </div>
        <button className="btn-blue margin" type="submit">
          Salvar
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  );
};

export default LogoForm;
