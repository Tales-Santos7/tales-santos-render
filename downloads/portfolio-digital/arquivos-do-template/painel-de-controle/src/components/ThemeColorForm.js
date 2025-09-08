import React, { useEffect, useState } from "react";
import axios from "axios";
const apiUrl = process.env.REACT_APP_API_URL;

function ThemeColorForm() {
  const [color, setColor] = useState("#ff007f");
  const [status, setStatus] = useState("");

  useEffect(() => {
    axios
      .get(`${apiUrl}/content/theme`)
      .then((res) => {
        if (res.data && res.data.color) {
          setColor(res.data.color);
          document.documentElement.style.setProperty(
            "--primary-color",
            res.data.color
          );
        } else {
          // Define uma cor padrão caso esteja vazia
          document.documentElement.style.setProperty(
            "--primary-color",
            "#ff007f"
          );
        }
      })
      .catch((err) => {
        console.error("Erro ao buscar cor:", err);
        document.documentElement.style.setProperty(
          "--primary-color",
          "#ff007f"
        );
      });
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmUpdate = window.confirm(
      "Tem certeza que deseja atualizar a cor do tema?"
    );
    if (confirmUpdate) {
      axios
        .put(`${apiUrl}/content/theme`, {
          color,
        })
        .then(() => alert("Cor atualizada com sucesso!"))
        .catch(() => setStatus("Erro ao atualizar a cor."));
    }
  };

  return (
    <div className="theme-color-form" style={{ marginBottom: "30px" }}>
      <h2>Personalizar Cor do Tema</h2>
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          maxWidth: "300px",
        }}
      >
        <label style={{ fontWeight: "bold" }}>Escolhe uma nova cor:</label>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <input
            className="color-input"
            type="color"
            value={color || "#ff007f"}
            onChange={(e) => setColor(e.target.value)}
            style={{
              width: "50px",
              height: "40px",
              border: "none",
              cursor: "pointer",
            }}
          />
          <span style={{ fontFamily: "monospace" }}>{color}</span>
        </div>

        <div
          style={{
            width: "100%",
            height: "40px",
            backgroundColor: color,
            border: "1px solid #ccc",
            borderRadius: "6px",
            marginTop: "10px",
          }}
          title={`Cor atual: ${color}`}
        />

        <button
          type="submit"
          style={{ marginTop: "10px", padding: "8px", cursor: "pointer" }}
        >
          Guardar Cor
        </button>
      </form>

      {status && <p style={{ marginTop: "10px" }}>{status}</p>}
    </div>
  );
}

export default ThemeColorForm;
