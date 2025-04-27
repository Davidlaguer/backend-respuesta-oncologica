// index.js (Servidor backend Node.js)

const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post('/generar-informe', async (req, res) => {
  const { informePrevio, informeActual, fechaPrevio, fechaActual } = req.body;

  if (!informePrevio || !informeActual || !fechaPrevio || !fechaActual) {
    return res.status(400).json({ error: 'Faltan datos necesarios.' });
  }

  try {
    const completion = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Eres un asistente especializado en oncología radiológica. Debes analizar los informes previos y actuales usando criterios RECIST 1.1 y generar un informe de respuesta estructurado de forma profesional.' },
        { role: 'user', content: `Fecha Estudio Previo: ${fechaPrevio}\nFecha Estudio Actual: ${fechaActual}\n\nINFORME PREVIO:\n${informePrevio}\n\nINFORME ACTUAL:\n${informeActual}` }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const respuesta = completion.data.choices[0].message.content;
    res.json({ informe: respuesta });

  } catch (error) {
    console.error('Error al contactar OpenAI:', error.response?.data || error.message);
    res.status(500).json({ error: 'Error al generar el informe desde OpenAI.' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor funcionando en puerto ${PORT}`);
});
