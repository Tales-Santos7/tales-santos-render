import React, { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

export default function FaviconForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    axios
      .get(`${apiUrl}/content/favicon`)
      .then((res) => {
        if (res.data.images?.length > 0) {
          setImageUrl(res.data.images[0]);
        }
      })
      .catch((err) => console.error("Erro ao carregar favicon:", err));
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) {
      setStatus("Selecione uma imagem.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    try {
      const res = await axios.put(`${apiUrl}/content/favicon`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newImage = res.data.images[0];
      setImageUrl(newImage);

      const favicon = window.parent.document.querySelector("link[rel='icon']");
      if (favicon) {
        favicon.href = newImage + "?t=" + Date.now();
      }

      setSelectedFile(null);
      setStatus("Favicon atualizado com sucesso!");
    } catch (err) {
      console.error("Erro ao atualizar favicon:", err);
      setStatus("Erro ao atualizar favicon.");
    }
  };

  return (
    <div className="card-form">
      <h2>Favicon</h2>

      {imageUrl && (
        <div style={{ marginBottom: "1rem" }}>
          <p><strong>Atual:</strong></p>
          <img src={imageUrl} alt="favicon" style={{ maxHeight: "32px" }} />
        </div>
      )}

      <form onSubmit={handleUpload}>
        <input type="file" accept="image/*" onChange={(e) => setSelectedFile(e.target.files[0])} />
        <button className="btn-blue margin-botton" type="submit">Enviar</button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}