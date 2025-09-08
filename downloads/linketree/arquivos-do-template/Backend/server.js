const express = require("express");
const fetch = (...args) =>
import("node-fetch").then(({ default: fetch }) => fetch(...args));
const FormData = require("form-data");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 5000;
const PAINEL = process.env.PAINEL || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Ligado ao MongoDB Atlas"))
  .catch((err) => console.error("Erro na ligação ao MongoDB:", err));

  //// ===================== ROTA PARA UPLOAD DE IMAGENS (Fotos de perfil, logos, etc.) =====================
app.post("/api/upload-image", async (req, res) => {
  try {
    const { imageBase64 } = req.body;

    const buffer = Buffer.from(imageBase64, "base64");

    const formData = new FormData();
    formData.append("image", buffer, {
      filename: "upload.png",
      contentType: "image/png", 
    });

    const response = await fetch(
      `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
      {
        method: "POST",
        body: formData,
        headers: formData.getHeaders(),
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      console.error("Resposta do ImgBB:", data);
      return res.status(500).json({ error: "Falha no upload para ImgBB." });
    }

    res.json({ url: data.data.url });
  } catch (err) {
    console.error("Erro ao enviar imagem:", err);
    res.status(500).json({ error: "Erro no upload da imagem." });
  }
});
// ===================== FIM DAS ROTA PARA UPLOAD DE IMAGENS (Fotos de perfil, logos, etc.) =====================

// Modelo de Link
const Link = mongoose.model(
  "Link",
  new mongoose.Schema({
    title: String,
    url: String,
    createdAt: { type: Date, default: Date.now },
  })
);
// Modelo de perfil do usuário
const UserProfile = mongoose.model(
  "UserProfile",
  new mongoose.Schema({
    name: String,
    imageUrl: String,
    bio: String,
    footer: String,
  })
);

// ===================== CRIAR OU ATUALIZAR PERFIL =====================
app.post("/api/perfil", async (req, res) => {
  const { name, imageUrl, bio, footer } = req.body;

  let perfil = await UserProfile.findOne();
  if (perfil) {
    perfil.name = name || perfil.name;
    perfil.imageUrl = imageUrl || perfil.imageUrl;
    perfil.bio = bio || perfil.bio;
    perfil.footer = footer || perfil.footer;
    await perfil.save();
  } else {
    perfil = new UserProfile({ name, imageUrl, bio, footer });
    await perfil.save();
  }

  res.json(perfil);
});

// Obter perfil
app.get("/api/perfil", async (req, res) => {
  const perfil = await UserProfile.findOne();
  res.json(perfil);
});
// ===================== FIM DE CRIAR OU ATUALIZAR PERFIL =====================

// ===================== CRIAR OU ATUALIZAR LINKS =====================
app.get("/api/links", async (req, res) => {
  const links = await Link.find();
  res.json(links);
});

app.post("/api/links", async (req, res) => {
  const { title, url } = req.body;
  const novoLink = new Link({ title, url });
  await novoLink.save();
  res.status(201).json(novoLink);
});

app.put("/api/links/:id", async (req, res) => {
  const { title, url } = req.body;
  const linkAtualizado = await Link.findByIdAndUpdate(
    req.params.id,
    { title, url },
    { new: true }
  );
  res.json(linkAtualizado);
});

app.delete("/api/links/:id", async (req, res) => {
  await Link.findByIdAndDelete(req.params.id);
  res.json({ message: "Link apagado com sucesso." });
});
// ===================== FIM DE CRIAR OU ATUALIZAR LINKS =====================

// Servir os ficheiros do frontend
// Caminho absoluto para /public
const publicPath = path.join(__dirname, "public");

// ROTAS EXPLÍCITAS PRIMEIRO
app.get("/painel.html", (req, res) => {
  res.sendFile(path.join(publicPath, "painel.html"));
});

// Depois, servir o resto da pasta public
app.use(express.static(publicPath));

// Rota principal (fallback para o site principal)
app.get("/", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

app.listen(PORT, () =>
  console.log(
    `🚀 Servidor a correr em http://localhost:${PORT} e o Painel em http://localhost:${PAINEL}/painel.html`
  )
);