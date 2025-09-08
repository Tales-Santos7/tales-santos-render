import React, { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

export default function FooterLogoForm() {
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [status, setStatus] = useState("");

  useEffect(() => {
    axios
      .get(`${apiUrl}/content/footer-logo`)
      .then((res) => {
        if (res.data.images && res.data.images.length > 0) {
          setImageUrl(res.data.images[0]);
        }
      })
      .catch((err) => console.error("Erro ao buscar logo:", err));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    console.log("Arquivo selecionado:", file); // deve mostrar o nome do ficheiro
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!selectedFile) {
      setStatus("Selecione uma imagem antes de enviar.");
      return;
    }

    const formData = new FormData();
    formData.append("image", selectedFile);

    console.log("Arquivo a enviar:", selectedFile); // aqui deve mostrar novamente

    try {
      const res = await axios.put(`${apiUrl}/content/footer-logo`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImageUrl(res.data.images[0]);
      setSelectedFile(null);
      setStatus("Logo do rodapé atualizada com sucesso!");
    } catch (error) {
      console.error("Erro ao atualizar logo do rodapé:", error);
      setStatus("Erro ao atualizar logo.");
    }
  };

  return (
    <div className="card-form">
      <h2>Logo do Rodapé</h2>

      {imageUrl && (
        <div style={{ marginBottom: "1rem" }}>
          <p>
            <strong>Imagem atual:</strong>
          </p>
          <img src={imageUrl} alt="Logo atual" style={{ maxHeight: "50px" }} />
        </div>
      )}

      <form onSubmit={handleUpload}>
        <input type="file" accept="image/*" onChange={handleFileChange} />
        <button className="btn-blue margin-botton" type="submit">
          Enviar Imagem
        </button>
      </form>

      {status && <p>{status}</p>}
    </div>
  );
}
