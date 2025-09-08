// Backend completo com upload para imgbb
const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const multer = require("multer");
const fs = require("fs");
const axios = require("axios");
const FormData = require("form-data");
const app = express();
const port = 3000;
require("dotenv").config();

app.use(express.json());

app.use(cors({
  origin: [
    "https://demo-portfolio-digital.vercel.app",
    "https://demo-painel-portfolio-digital.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true 
}));

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado ao MongoDB"))
  .catch((err) => console.error("Erro ao conectar ao MongoDB:", err));

const upload = multer({ dest: "temp/" });

// Esquema Content
const contentSchema = new mongoose.Schema({
  section: { type: String, required: true },
  color: String,
  images: [String],
  title: String,
  description: String,
});
const Content = mongoose.model("Content", contentSchema);

// ATUALIZAR A MARCA D'AGUA DO NAV
app.get("/content/logo", async (req, res) => {
  try {
    const logo = await Content.findOne({ section: "logo" });
    if (!logo) return res.status(404).json({ message: "Logo não encontrada" });
    res.json(logo);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter logo" });
  }
});

app.put("/content/logo", async (req, res) => {
  const { title, description, images } = req.body;
  try {
    const logo = await Content.findOneAndUpdate(
      { section: "logo" },
      { title, description, images: images || [] }, // aqui usa images do corpo ou vazio
      { new: true, upsert: true }
    );
    res.json(logo);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar a logo textual" });
  }
});

// FAVICON
app.get("/content/favicon", async (req, res) => {
  try {
    const favicon = await Content.findOne({ section: "favicon" });
    if (!favicon) return res.json({ images: [] });
    res.json(favicon);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter favicon" });
  }
});

app.put("/content/favicon", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "Imagem não enviada" });

    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.POSTIMAGES_API_KEY}`,
      formData,
      { headers: formData.getHeaders() }
    );

    const imageUrl = response.data.data.url;
    fs.unlinkSync(req.file.path);

    let favicon = await Content.findOne({ section: "favicon" });

    if (!favicon) {
      favicon = new Content({ section: "favicon", images: [imageUrl] });
    } else {
      favicon.images = [imageUrl];
    }

    await favicon.save();
    res.json(favicon);
  } catch (error) {
    console.error("Erro ao atualizar favicon:", error);
    res.status(500).json({ message: "Erro ao atualizar favicon" });
  }
});

// ATUALIZAR A MARCA D'AGUA DO RODAPÉ
app.get("/content/footer-logo", async (req, res) => {
  try {
    const content = await Content.findOne({ section: "footer-logo" });
    if (!content) return res.json({ images: [] });
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter logo do rodapé" });
  }
});

app.put("/content/footer-logo", upload.single("image"), async (req, res) => {
  console.log("✅ Rota footer-logo: req.file = ", req.file);
  try {
    if (!req.file)
      return res.status(400).json({ message: "Imagem não enviada" });
    console.log("✅ Rota recebida com req.file:", req.file);

    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.POSTIMAGES_API_KEY}`,
      formData,
      { headers: formData.getHeaders() }
    );
    console.log("📦 Resposta imgbb:", response.data.data.url);

    const imageUrl = response.data.data.url;
    console.log("📦 imgbb upload status:", response.data);
    fs.unlinkSync(req.file.path);

    let footerLogo = await Content.findOne({ section: "footer-logo" });

    if (!footerLogo) {
      footerLogo = new Content({ section: "footer-logo", images: [imageUrl] });
    } else {
      footerLogo.images = [imageUrl];
    }

    await footerLogo.save();
    res.json(footerLogo);
  } catch (error) {
    console.error("Erro ao atualizar logo do rodapé:", error);
    res.status(500).json({ message: "Erro ao atualizar logo do rodapé" });
  }
});

// NOME DO SITE
app.get("/content/site-name", async (req, res) => {
  try {
    const item = await Content.findOne({ section: "site-name" });
    if (!item)
      return res.status(404).json({ message: "Site name não definido" });
    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Erro ao obter nome do site" });
  }
});

// atualizar nome do site
app.put("/content/site-name", async (req, res) => {
  const { title } = req.body;
  try {
    const updated = await Content.findOneAndUpdate(
      { section: "site-name" },
      { title },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Erro ao atualizar nome do site" });
  }
});

// IMAGEM DA HERO
app.get("/content/hero", async (req, res) => {
  try {
    const hero = await Content.findOne({ section: "hero" });
    if (!hero) return res.status(404).json({ message: "Hero não encontrado" });
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar imagem da hero" });
  }
});

app.put("/content/hero", upload.array("images", 1), async (req, res) => {
  try {
    console.log("🔹 req.files:", req.files);
    if (!req.files || req.files.length === 0) {
      console.log("⚠️ Nenhuma imagem recebida no backend");
      return res.status(400).json({ message: "Nenhuma imagem recebida." });
    }

    console.log("📦 Enviando imagem para imgbb:", req.files[0].originalname);
    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.files[0].path));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.POSTIMAGES_API_KEY}`,
      formData,
      { headers: formData.getHeaders() }
    );

    console.log("✅ imgbb retornou:", response.data);
    const imageUrl = response.data.data.url;
    fs.unlinkSync(req.files[0].path);

    let hero =
      (await Content.findOne({ section: "hero" })) ||
      new Content({ section: "hero", images: [] });
    hero.images = [imageUrl];
    await hero.save();

    return res.json(hero);
  } catch (error) {
    console.error("🔴 Erro ao salvar imagem da hero:", error);

    if (error.response) {
      console.error(
        "📦 Resposta do imgbb:",
        error.response.status,
        error.response.data
      );
    }
    return res.status(500).json({ message: "Erro ao salvar imagem da hero" });
  }
});

// GALERIA
app.delete("/content/gallery", async (req, res) => {
  try {
    const { imageUrl } = req.query;
    if (!imageUrl)
      return res.status(400).json({ message: "URL da imagem não fornecida" });

    const gallery = await Content.findOne({ section: "gallery" });
    if (!gallery)
      return res.status(404).json({ message: "Galeria não encontrada" });

    gallery.images = gallery.images.filter((image) => image !== imageUrl);
    await gallery.save();

    res.json({ images: gallery.images });
  } catch (error) {
    console.error("Erro ao remover imagem:", error);
    res.status(500).json({ message: "Erro ao remover imagem" });
  }
});

//ATUALIZAR GALERIA
app.put("/content/gallery/update", upload.single("image"), async (req, res) => {
  try {
    const { oldImageUrl } = req.body;
    if (!oldImageUrl || !req.file) {
      return res
        .status(400)
        .json({ message: "Dados insuficientes para atualizar a imagem." });
    }

    const gallery = await Content.findOne({ section: "gallery" });
    if (!gallery)
      return res.status(404).json({ message: "Galeria não encontrada" });

    const index = gallery.images.indexOf(oldImageUrl);
    if (index === -1)
      return res
        .status(404)
        .json({ message: "Imagem não encontrada na galeria" });

    const formData = new FormData();
    formData.append("image", fs.createReadStream(req.file.path));

    const response = await axios.post(
      `https://api.imgbb.com/1/upload?key=${process.env.POSTIMAGES_API_KEY}`,
      formData,
      { headers: formData.getHeaders() }
    );

    const newImageUrl = response.data.data.url;
    fs.unlinkSync(req.file.path); // Remove o ficheiro temporário

    gallery.images[index] = newImageUrl;
    await gallery.save();

    res.json({ images: gallery.images });
  } catch (error) {
    console.error("Erro ao atualizar imagem:", error);
    res.status(500).json({ message: "Erro ao atualizar imagem" });
  }
});

app.put("/content/gallery", upload.array("images", 10), async (req, res) => {
  try {
    let gallery = await Content.findOne({ section: "gallery" });
    if (!gallery) {
      gallery = new Content({ section: "gallery", images: [] });
    }

    const uploadedUrls = [];

    for (const file of req.files) {
      const formData = new FormData();
      formData.append("image", fs.createReadStream(file.path));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.POSTIMAGES_API_KEY}`,
        formData,
        { headers: formData.getHeaders() }
      );

      const imageUrl = response.data.data.url;
      uploadedUrls.push(imageUrl);

      fs.unlinkSync(file.path); // apagar ficheiro local
    }

    gallery.images.push(...uploadedUrls);
    await gallery.save();

    res.json({ images: gallery.images });
  } catch (error) {
    console.error("Erro ao adicionar imagens à galeria:", error);
    res.status(500).json({ message: "Erro ao adicionar imagens à galeria" });
  }
});

// Atualizar a cor
app.put("/content/theme", async (req, res) => {
  const { color } = req.body;
  try {
    const updated = await Content.findOneAndUpdate(
      { section: "theme" },
      { color },
      { new: true, upsert: true }
    );
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar o tema" });
  }
});

app.get("/content/theme", async (req, res) => {
  try {
    const theme = await Content.findOne({ section: "theme" });
    if (!theme) {
      return res.status(404).json({ message: "Tema não encontrado" });
    }
    res.json(theme);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter o tema" });
  }
});

app.put("/content/:section", async (req, res) => {
  const { section } = req.params;
  const { title, description } = req.body;

  try {
    const updatedContent = await Content.findOneAndUpdate(
      { section },
      { title, description },
      { new: true, upsert: true }
    );
    res.json(updatedContent);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar conteúdo da seção" });
  }
});

app.get("/content/:section", async (req, res) => {
  const { section } = req.params;
  try {
    const content = await Content.findOne({ section });
    if (!content) {
      return res.status(404).json({ message: "Seção não encontrada" });
    }
    res.json(content);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter conteúdo da seção" });
  }
});

// BLOG
const postSchema = new mongoose.Schema({
  title: String,
  content: String,
  imageUrl: String,
  createdAt: { type: Date, default: Date.now },
});
const Post = mongoose.model("Post", postSchema);

app.get("/blog", async (req, res) => {
  try {
    const posts = await Post.find();
    res.json(posts);
  } catch (error) {
    res.status(500).json({ message: "Erro ao carregar posts" });
  }
});

app.post("/blog", upload.single("image"), async (req, res) => {
  try {
    let imageUrl = "";
    if (req.file) {
      const formData = new FormData();
      formData.append("image", fs.createReadStream(req.file.path));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.POSTIMAGES_API_KEY}`,
        formData,
        { headers: formData.getHeaders() }
      );

      imageUrl = response.data.data.url;
      fs.unlinkSync(req.file.path);
    }

    const post = new Post({
      title: req.body.title,
      content: req.body.content,
      imageUrl,
    });
    await post.save();
    res.status(201).json(post);
  } catch (error) {
    console.error("Erro ao criar post:", error);
    res.status(500).json({ message: "Erro ao criar post" });
  }
});

app.put("/blog/:id", upload.single("image"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post não encontrado" });

    let imageUrl = post.imageUrl;
    if (req.file) {
      const formData = new FormData();
      formData.append("image", fs.createReadStream(req.file.path));

      const response = await axios.post(
        `https://api.imgbb.com/1/upload?key=${process.env.POSTIMAGES_API_KEY}`,
        formData,
        { headers: formData.getHeaders() }
      );
      imageUrl = response.data.data.url;
      fs.unlinkSync(req.file.path);
    }

    post.title = req.body.title;
    post.content = req.body.content;
    post.imageUrl = imageUrl;
    await post.save();
    res.json(post);
  } catch (error) {
    console.error("Erro ao atualizar post:", error);
    res.status(500).json({ message: "Erro ao atualizar post" });
  }
});

app.delete("/blog/:id", async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post não encontrado" });
    res.json({ message: "Post excluído com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao excluir post" });
  }
});

app.get("/blog/:id", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post não encontrado" });
    res.json(post);
  } catch (error) {
    res.status(500).json({ message: "Erro ao buscar o post" });
  }
});

// Redes Sociais
const socialSchema = new mongoose.Schema({
  name: String,
  url: String,
});
const SocialLink = mongoose.model("SocialLink", socialSchema);

// Obter todas as redes sociais
app.get("/social-links", async (req, res) => {
  try {
    const links = await SocialLink.find();
    res.json(links);
  } catch (error) {
    res.status(500).json({ message: "Erro ao obter links das redes sociais" });
  }
});

// Adicionar nova rede social
app.post("/social-links", async (req, res) => {
  try {
    const { name, url } = req.body;

    const iconNames = [
      "instagram",
      "threads",
      "tiktok",
      "facebook",
      "linkedin",
      "github",
      "twitter",
    ];
    if (!iconNames.includes(name.toLowerCase())) {
      return res.status(400).json({ message: "Nome de ícone inválido" });
    }

    const newLink = new SocialLink({ name, url });
    await newLink.save();
    res.status(201).json(newLink);
  } catch (error) {
    res.status(500).json({ message: "Erro ao adicionar link de rede social" });
  }
});

// Atualizar link de rede social
app.put("/social-links/:id", async (req, res) => {
  try {
    const { url } = req.body;
    const link = await SocialLink.findByIdAndUpdate(
      req.params.id,
      { url },
      { new: true }
    );
    res.json(link);
  } catch (error) {
    res.status(500).json({ message: "Erro ao atualizar link da rede social" });
  }
});

// Remover rede social
app.delete("/social-links/:id", async (req, res) => {
  try {
    await SocialLink.findByIdAndDelete(req.params.id);
    res.json({ message: "Rede social removida com sucesso" });
  } catch (error) {
    res.status(500).json({ message: "Erro ao remover rede social" });
  }
});

// Serve os ficheiros estáticos da aplicação React
app.use(express.static(path.join(__dirname, "public"))); // ou "build" se estiveres a usar `npm run build`

// Redireciona todas as rotas desconhecidas para o index.html (SPA)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});