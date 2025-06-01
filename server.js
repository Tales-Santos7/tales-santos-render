const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();
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
            title: productName,
            quantity: 1,
            unit_price: Number(amount) / 100,
          },
        ],
        payer: {
          email: req.body.email,
          name: req.body.nome,
          surname: "Cliente",
          identification: {
            type: "CPF",
            number: req.body.taxId,
          },
        },
        back_urls: {
          success: `https://talessantos-mu.vercel.app/sucesso.html?token=${token}`,
          failure: `https://talessantos-mu.vercel.app/falha.html`,
          pending: `https://talessantos-mu.vercel.app/aguardando.html?token=${token}`,
        },
        auto_return: "approved",
        notification_url:
          "https://tales-santos-backend-ofl3.onrender.com/webhook-mercadopago",
        external_reference: token,
      },
    });

    console.log(
      "Resposta completa da criação da preferência:",
      preferenceResponse
    );

    const paymentLink = preferenceResponse.init_point;

    if (!paymentLink) {
      throw new Error("Não foi possível gerar o link de pagamento");
    }

    console.log("Init point:", preferenceResponse.init_point);
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

app.listen(PORT, () => {
  console.log(
    `Servidor rodando na porta https://tales-santos-backend-ofl3.onrender.com/`
  );
});
