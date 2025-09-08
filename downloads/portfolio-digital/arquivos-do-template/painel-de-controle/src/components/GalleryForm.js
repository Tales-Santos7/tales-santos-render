import React, { useState, useEffect } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

const GalleryForm = () => {
  const [images, setImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [updateImageIndex, setUpdateImageIndex] = useState(null);
  const [updateFile, setUpdateFile] = useState(null);

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await axios.get(`${apiUrl}/content/gallery`);
        const fullImageUrls = response.data.images.map((path) =>
          path.startsWith("http") ? path : `${apiUrl}${path}`
        );
        setImages(fullImageUrls);
      } catch (error) {
        console.error("Erro ao carregar galeria:", error);
      }
    };

    fetchGallery();
  }, []);

  const handleImageChange = (e) => {
    setNewImages([...e.target.files]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (newImages.length === 0) {
      alert("Selecione pelo menos uma imagem.");
      return;
    }

    const formData = new FormData();
    newImages.forEach((image) => formData.append("images", image));

    try {
      const response = await axios.put(`${apiUrl}/content/gallery`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setImages(response.data.images);
      setNewImages([]);
      alert("Imagens adicionadas à galeria com sucesso!");
    } catch (error) {
      console.error("Erro ao adicionar imagens:", error);
      alert("Erro ao adicionar imagens à galeria.");
    }
  };

  const handleRemove = async (imageUrl) => {
    const confirmDelete = window.confirm(
      "Tem certeza que deseja remover esta imagem?"
    );
    if (!confirmDelete) return;

    try {
      const response = await axios.delete(
        `${apiUrl}/content/gallery?imageUrl=${encodeURIComponent(imageUrl)}`
      );
      setImages(response.data.images);
      alert("Imagem removida com sucesso!");
    } catch (error) {
      console.error("Erro ao remover imagem:", error);
      alert("Erro ao remover imagem.");
    }
  };

  const handleUpdateClick = (index) => {
    setUpdateImageIndex(index);
  };

  const handleUpdateFileChange = (e) => {
    setUpdateFile(e.target.files[0]);
  };

  const handleUpdateSubmit = async (e, imageUrl) => {
    e.preventDefault();
    if (!updateFile) {
      alert("Selecione uma nova imagem.");
      return;
    }

    const formData = new FormData();
    formData.append("image", updateFile);
    formData.append("oldImageUrl", imageUrl);

    try {
      const response = await axios.put(
        `${apiUrl}/content/gallery/update`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      const fullImageUrls = response.data.images.map((path) =>
        path.startsWith("http") ? path : `${apiUrl}${path}`
      );
      setImages(fullImageUrls);
      setUpdateImageIndex(null);
      setUpdateFile(null);
      alert("Imagem atualizada com sucesso! (Atualize a página)");
    } catch (error) {
      console.error("Erro ao atualizar imagem:", error);
      alert("Erro ao atualizar imagem.");
    }
  };

  const handleCancelUpdate = () => {
    setUpdateImageIndex(null);
    setUpdateFile(null);
  };

  return (
    <div className="card-form">
      <h2>Gerenciar Galeria</h2>

      <form onSubmit={handleUpload}>
        <input type="file" multiple onChange={handleImageChange} />
        <button className="btn-blue margin-botton" type="submit">
          Adicionar Imagens
        </button>
      </form>

      <div className="gallery" id="galeria-container">
        {images.map((url, index) => (
          <div key={index} className="gallery-item">
            <img src={url} alt={`Galeria ${index}`} />
            <button
              className="btn-red margin-btn-galery"
              onClick={() => handleRemove(url)}
            >
              Remover
            </button>
            <button
              className="btn-green"
              onClick={() => handleUpdateClick(index)}
            >
              Atualizar
            </button>

            {updateImageIndex === index && (
              <form
                onSubmit={(e) => handleUpdateSubmit(e, url)}
                style={{ marginTop: "10px" }}
              >
                <input type="file" onChange={handleUpdateFileChange} />
                <button className="btn-blue margin" type="submit">
                  Enviar Nova
                </button>
                <button
                  type="button"
                  className="btn-gray margin-btn-galery margin-botton"
                  onClick={handleCancelUpdate}
                >
                  Cancelar
                </button>
              </form>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default GalleryForm;
