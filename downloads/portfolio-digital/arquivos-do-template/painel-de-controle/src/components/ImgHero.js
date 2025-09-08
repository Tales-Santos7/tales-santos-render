import React, { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const ImgHero = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [status, setStatus] = useState("");
  const [heroImage, setHeroImage] = useState("");

  useEffect(() => {
    const fetchHeroImage = async () => {
      try {
        const res = await axios.get(`${apiUrl}/content/hero`);
        if (res.data.images && res.data.images.length > 0) {
          setHeroImage(res.data.images[0]);
        }
      } catch (err) {
        console.error("Erro ao buscar imagem da hero:", err);
      }
    };

    fetchHeroImage();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setSelectedImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedImage) {
      alert("Selecione uma imagem.");
      return;
    }

    const formData = new FormData();
    formData.append("images", selectedImage); // nome coerente com `upload.array("images", ...)`

    try {
      const res = await axios.put(`${apiUrl}/content/hero`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      console.log("✅ Upload bem-sucedido:", res.data);
      if (res.data.images && res.data.images.length > 0) {
        setHeroImage(res.data.images[0]);
        setStatus("Imagem enviada com sucesso!");
        setSelectedImage(null);
        setPreview("");
      }
    } catch (err) {
      console.error("🚨 AxiosError:", err);
      if (err.response) {
        console.error(
          "Resposta do servidor:",
          err.response.status,
          err.response.data
        );
        setStatus(
          `Erro ${err.response.status}: ${
            err.response.data.message || "Erro no upload"
          }`
        );
      } else {
        console.error("Erro sem resposta:", err.message);
        setStatus(`Erro: ${err.message}`);
      }
    }
  };

  return (
    <div className="card-form">
      <h2>Imagem da Hero (Sua foto)</h2>

      {heroImage && (
        <div style={{ marginBottom: "10px" }}>
          <p>Imagem atual:</p>
          <img
            src={heroImage}
            alt="Hero atual"
            style={{ maxWidth: "50%", borderRadius: "6px", marginTop: "5px" }}
          />
        </div>
      )}

      <form onSubmit={handleUpload}>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {preview && (
          <div style={{ marginTop: "10px" }}>
            <p>Preview:</p>
            <img
              src={preview}
              alt="Preview"
              style={{ maxWidth: "50%", borderRadius: "6px" }}
            />
          </div>
        )}
        <button className="btn-blue margin" type="submit">
          Enviar Imagem
        </button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
};

export default ImgHero;
