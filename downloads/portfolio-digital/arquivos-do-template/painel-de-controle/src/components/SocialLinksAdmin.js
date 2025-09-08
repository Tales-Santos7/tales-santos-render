import React, { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

function SocialLinksAdmin() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = () => {
    axios
      .get(`${apiUrl}/social-links`)
      .then((response) => setSocialLinks(response.data))
      .catch((error) => {
        setStatusMessage("Erro ao buscar redes sociais.");
        console.error("Erro ao buscar redes sociais:", error);
      });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        const confirmUpdate = window.confirm(
          "Tem certeza de que deseja atualizar este link?"
        );
        if (confirmUpdate) {
          await axios.put(`${apiUrl}/social-links/${editingId}`, { url });
          setStatusMessage("Link atualizado com sucesso!");
        }
      } else {
        await axios.post("${apiUrl}/social-links", { name, url });
        setStatusMessage("Link criado com sucesso!");
      }

      setName("");
      setUrl("");
      setEditingId(null);
      fetchLinks();
    } catch (error) {
      setStatusMessage("Erro ao salvar link.");
      console.error("Erro ao salvar link:", error);
    }
  };

  const handleEdit = (link) => {
    setEditingId(link._id);
    setName(link.name);
    setUrl(link.url);
  };

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm(
      "Tem certeza de que deseja excluir este link?"
    );
    if (confirmDelete) {
      try {
        await axios.delete(`${apiUrl}/social-links/${id}`);
        setStatusMessage("Link excluído com sucesso!");
        fetchLinks();
      } catch (error) {
        setStatusMessage("Erro ao excluir link.");
        console.error("Erro ao excluir link:", error);
      }
    }
  };

  return (
    <div className="card-form">
      <h2>Gerenciar Redes Sociais</h2>

      {statusMessage && <div className="status-message">{statusMessage}</div>}

      <form className="form-redes" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Nome (ex: instagram, threads)"
          value={name}
          onChange={(e) => setName(e.target.value.toLowerCase())}
          required
          disabled={editingId}
        />

        <input
          type="text"
          placeholder="URL"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          required
        />
        <button className="margin-botton" type="submit">
          {editingId ? "Atualizar" : "Adicionar"}
        </button>
        {editingId && (
          <button
            type="button"
            className="btn-red margin"
            onClick={() => setEditingId(null)}
          >
            Cancelar
          </button>
        )}
      </form>

      <ul>
        {socialLinks.map((link) => (
          <li className="form-redes" key={link._id}>
            <strong>{link.name}</strong> –{" "}
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.url}
            </a>
            <div style={{ marginTop: "10px" }}>
              <button
                className="btn-blue margin"
                onClick={() => handleEdit(link)}
              >
                Editar
              </button>
              <button
                className="btn-red margin"
                onClick={() => handleDelete(link._id)}
              >
                Excluir
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SocialLinksAdmin;
