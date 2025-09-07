const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
const path = require("path");
const app = express();
const tokensSalvos = {};
const { MercadoPagoConfig, Preference, Payment } = require("mercadopago");
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_TOKEN,
});

app.post("/criar-fatura", async (req, res) => {
  try {
    const { nome, email, telefone, taxId, productName, amount, arquivo } =
      req.body;

    // ====== Validações ======
    if (!nome || !email || !telefone || !taxId || !productName || !amount) {
      return res
        .status(400)
        .json({ error: "Todos os campos são obrigatórios." });
    }

    if (nome.length > 100) {
      return res
        .status(400)
        .json({ error: "O nome não pode ter mais de 100 caracteres." });
    }

    if (email.length > 150) {
      return res
        .status(400)
        .json({ error: "O e-mail não pode ter mais de 150 caracteres." });
    }

    if (telefone.length > 15) {
      return res
        .status(400)
        .json({ error: "O telefone não pode ter mais de 15 dígitos." });
    }

    if (taxId.length !== 11) {
      return res
        .status(400)
        .json({ error: "O NIF deve ter exatamente 9 dígitos." });
    }

    if (isNaN(amount) || amount <= 0) {
      return res
        .status(400)
        .json({ error: "O valor deve ser um número positivo." });
    }

    // ====== Geração do token só depois de validar ======
    const token = Math.random().toString(36).substring(2);
    tokensSalvos[token] = {
      cliente_nome: nome,
      email,
      telefone,
      taxId,
      productName,
      arquivo: `https://tales-santos-backend-chb9.onrender.com/downloads/${path.basename(arquivo)}`,
    };

    // ====== Criação da preferência no MercadoPago ======
    const preference = new Preference(mercadopago);
    const preferenceResponse = await preference.create({
      body: {
        items: [
          { title: productName, quantity: 1, unit_price: Number(amount) / 100 },
        ],
        payer: {
          email,
          name: nome,
          surname: "Cliente",
          identification: { type: "CPF", number: taxId },
        },
        back_urls: {
          success: `https://talessantos-mu.vercel.app/sucesso.html?token=${token}`,
          failure: `https://talessantos-mu.vercel.app/falha.html`,
          pending: `https://talessantos-mu.vercel.app/aguardando.html?token=${token}`,
        },
        auto_return: "approved",
        notification_url:
          "https://tales-santos-backend-chb9.onrender.com/webhook-mercadopago",
        external_reference: token,
      },
    });

    const paymentLink = preferenceResponse.init_point;
    if (!paymentLink) {
      throw new Error("Não foi possível gerar o link de pagamento");
    }

    res.status(200).json({
      url: paymentLink,
      id: preferenceResponse.id,
      product: productName,
    });
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
          const token = response.data.external_reference;
          if (tokensSalvos[token]) {
            tokensSalvos[token].pago = true;
          }
        }
      })
      .catch((err) =>
        console.error("Erro ao verificar pagamento:", err.message)
      );
  }

  res.sendStatus(200); // Sempre responde para o MP não tentar de novo
  console.log("Recebido webhook:", req.body);
});

app.get("/verificar-pagamento", async (req, res) => {
  const token = req.query.token;

  if (!token) {
    return res.status(400).json({ error: "Token não fornecido" });
  }

  try {
    const payment = new Payment(mercadopago);
    const paymentsResponse = await payment.search({
      qs: {
        external_reference: token,
      },
    });

    const payments = paymentsResponse.results;

    if (!payments.length) {
      return res.status(404).json({ error: "Pagamento não encontrado" });
    }

    const pagamentoAprovado = payments.find((p) => p.status === "approved");

    if (!pagamentoAprovado) {
      return res.status(403).json({ error: "Pagamento ainda não aprovado" });
    }

    res.json({
      status: "approved",
      email: pagamentoAprovado.payer.email,
      id: pagamentoAprovado.id,
      amount: pagamentoAprovado.transaction_amount,
    });
  } catch (error) {
    console.error("Erro ao verificar pagamento:", error);
    res.status(500).json({ error: "Erro ao verificar pagamento" });
  }
});

app.get("/validar-token", (req, res) => {
  const token = req.query.token;
  const produto = tokensSalvos[token];

  if (produto && produto.pago) {
    res.json(produto);
  } else {
    res
      .status(403)
      .json({ error: "Token inválido ou pagamento não confirmado" });
  }
});

app.use(
  cors({
    origin: "https://talessantos-mu.vercel.app/", // Substitua pelo domínio correto do seu frontend
  })
);

app.use("/downloads", express.static(path.join(__dirname, "downloads")));

// Redireciona todas as rotas desconhecidas para o index.html (SPA)
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(
    `Servidor rodando na porta https://tales-santos-backend-chb9.onrender.com/`
  );
});
