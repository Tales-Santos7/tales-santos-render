const express = require('express');
const axios = require('axios');
const cors = require('cors'); 
require('dotenv').config();
const app = express();
const path = require('path');
const tokensSalvos = {};
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(cors()); 

app.post('/criar-fatura', async (req, res) => {
  console.log('Corpo da requisição recebido:', req.body);
  const { productId, externalId, amount, customer, productName, productFile } = req.body;

  if (!customer.email) {
    return res.status(400).json({ error: 'O campo email é obrigatório.' });
  }

  if (!customer.taxId) {
    return res.status(400).json({ error: 'O campo taxId é obrigatório.' });
  }

  // Regista o token e o arquivo correspondente
  tokensSalvos[externalId] = {
    nome: productName,
    arquivo: productFile
  };

  try {
    const response = await axios.post(process.env.ABACATEPAY_API, {
      products: [
        {
          id: productId,
          externalId: externalId,
          quantity: 1,
          name: 'Produto Exemplo',
          price: amount
        }
      ],
      amount: amount,
      status: 'PENDING',
      devMode: true,
      methods: ['PIX'],
      frequency: 'ONE_TIME',
      allowCoupons: false,
      returnUrl: process.env.RETURN_URL,
      completionUrl: `${process.env.COMPLETION_URL}?token=${externalId}`,
      metadata: {
        fee: 100
      },
      customer: {
        name: customer.name,
        cellphone: customer.cellphone,
        email: customer.email,
        taxId: customer.taxId
      }
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.ABACATEPAY_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ url: response.data.data.url });
  } catch (error) {
    console.error('Erro ao criar fatura:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Erro ao criar fatura' });
  }
});

app.get('/validar-token', (req, res) => {
  const token = req.query.token;
  const produto = tokensSalvos[token];

  if (produto) {
    res.json(produto);
  } else {
    res.status(404).json({ error: 'Token inválido' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta http://localhost:${PORT}`);
});


