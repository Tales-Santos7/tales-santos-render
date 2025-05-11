const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const app = express();
const tokensSalvos = {};
const { MercadoPagoConfig, Preference } = require("mercadopago");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN,
});

app.post("/criar-fatura", async (req, res) => {
  try {
    const { productName, amount } = req.body;

    // Gera um token simples para usar na URL de sucesso
    const token = Math.random().toString(36).substring(2);
    tokensSalvos[token] = {
      nome: req.body.nome,
      email: req.body.email,
      telefone: req.body.telefone,
      taxId: req.body.taxId,
      productName,
      arquivo: req.body.arquivo,
    };

    const preference = new Preference(mercadopago);

    const preferenceResponse = await preference.create({
      body: {
        items: [
          {
            notification_url: "https://seusite.com/webhook-mercadopago",
            title: productName,
            quantity: 1,
            unit_price: Number(amount) / 100,
          },
        ],
        back_urls: {
          success: `https://talessantos-mu.vercel.app/sucesso.html?token=${token}`,
          failure: `https://talessantos-mu.vercel.app/falha.html`,
          pending: `https://talessantos-mu.vercel.app/pendente.html`,
        },
        auto_return: "approved",
      },
    });

    console.log(
      "Resposta completa da criação da preferência:",
      preferenceResponse
    );

    const paymentLink =
      preferenceResponse.init_point || preferenceResponse.sandbox_init_point;

    if (!paymentLink) {
      throw new Error("Não foi possível gerar o link de pagamento");
    }

    console.log("Init point:", preferenceResponse?.body?.init_point);
    console.log(
      "Raw preferenceResponse:",
      JSON.stringify(preferenceResponse, null, 2)
    );

    res.status(200).json({
      url: paymentLink,
      id: preferenceResponse.id,
      product: productName,
    });

    console.log("Retorno ao frontend:", { url: paymentLink });
  } catch (error) {
    console.error(
      "Erro ao criar fatura:",
      error.response?.data || error.message || error
    );
    res.status(500).json({ error: "Erro ao criar fatura" });
  }
});

app.post("/webhook-mercadopago", (req, res) => {
  const pagamento = req.body;

  if (pagamento.type === "payment") {
    const paymentId = pagamento.data.id;

    // Buscar o pagamento detalhado
    axios
      .get(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_TOKEN}`,
        },
      })
      .then((response) => {
        const status = response.data.status;

        if (status === "approved") {
          console.log("Pagamento aprovado:", response.data);
          // Aqui você pode liberar o download ou atualizar o token salvo como "pago"
        }
      })
      .catch((err) =>
        console.error("Erro ao verificar pagamento:", err.message)
      );
  }

  res.sendStatus(200); // Sempre responde para o MP não tentar de novo
});

app.get("/validar-token", (req, res) => {
  const token = req.query.token;
  const produto = tokensSalvos[token];

  if (produto) {
    res.json(produto);
  } else {
    res.status(404).json({ error: "Token inválido" });
  }
});

app.use(
  cors({
    origin: "https://tales-santos-backend.onrender.com/", // Substitua pelo domínio correto do seu frontend
  })
);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta https://tales-santos-backend.onrender.com/`);
});
