const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const app = express();
const tokensSalvos = {};
const fs = require("fs");
const path = require("path");
const TOKEN_FILE = path.join(__dirname, "tokens.json");
const emailjs = require("emailjs-com");
const { MercadoPagoConfig, Preference } = require("mercadopago");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN,
});

function lerTokens() {
  try {
    const data = fs.readFileSync(TOKEN_FILE, "utf8");
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

function salvarTokens(tokens) {
  fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2), "utf8");
}

app.post("/criar-fatura", async (req, res) => {
  try {
    const { productName, amount } = req.body;
    // Gera um token simples para usar na URL de sucesso
    const token = Math.random().toString(36).substring(2);
    const tokens = lerTokens();
    tokens[token] = {
      nome: req.body.nome,
      email: req.body.email,
      telefone: req.body.telefone,
      taxId: req.body.taxId,
      productName,
      arquivo: req.body.arquivo,
    };
    salvarTokens(tokens);

    const preference = new Preference(mercadopago);

    const preferenceResponse = await preference.create({
      body: {
        items: [
          {
            notification_url:
              "https://tales-santos-backend.onrender.com/webhook-mercadopago",
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
        metadata: {
          token: token,
        },
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

app.post("/webhook-mercadopago", async (req, res) => {
  const pagamento = req.body;

  if (pagamento.type === "payment") {
    const paymentId = pagamento.data.id;

    try {
      const response = await axios.get(
        `https://api.mercadopago.com/v1/payments/${paymentId}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.MERCADOPAGO_TOKEN}`,
          },
        }
      );

      const status = response.data.status;

      if (status === "approved") {
        const token = response.data.metadata?.token; // <-- Ponto importante
        const tokens = lerTokens();
        const dados = tokens[token];

        if (!dados) {
          console.warn("Token não encontrado:", token);
        } else {
          // Envia o email automático com link de download
          await emailjs.send(
            process.env.EMAILJS_SERVICE_ID,
            process.env.EMAILJS_TEMPLATE_ID,
            {
              from_name: "Tales Santos",
              to_email: dados.email,
              reply_to: dados.email,
              produto_nome: dados.nome,
              link_download: dados.arquivo,
            },
            { publicKey: process.env.EMAILJS_PUBLIC_KEY }
          );

          console.log("Email enviado com sucesso para", dados.email);
        }
      }
    } catch (err) {
      console.error("Erro ao processar webhook:", err.message);
    }
  }

  res.sendStatus(200);
});

app.get("/verificar-pagamento", async (req, res) => {
  const paymentId = req.query.paymentId;
  try {
    const response = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.MERCADOPAGO_TOKEN}`,
        },
      }
    );

    res.json({ status: response.data.status });
  } catch (error) {
    res.status(500).json({ error: "Erro ao verificar pagamento" });
  }
});

app.get("/validar-token", (req, res) => {
  const token = req.query.token; // <-- esta linha estava faltando!
  const tokens = lerTokens();
  const produto = tokens[token];

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
  console.log(
    `Servidor rodando na porta https://tales-santos-backend.onrender.com/`
  );
});
