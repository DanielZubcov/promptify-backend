// ARQUIVO COMPLETO E ATUALIZADO: backend/api/refine.ts

import OpenAI from 'openai';
import promptRewriterSystem from './promptRewriterSystem';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ===============================================================
  // INÍCIO DO BLOCO DE CÓDIGO PARA LIDAR COM CORS
  // ===============================================================
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  // ===============================================================
  // FIM DO BLOCO DE CÓDIGO
  // ===============================================================

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  // --- MUDANÇA 1: Receber o nome do modelo do frontend ---
  const { prompt, modelName } = req.body;
  const defaultModel = "gpt-5-nano";
  // O modelo a ser usado na chamada. Se o frontend não enviar, usamos o padrão.
  const modelToUse = modelName || defaultModel;

  if (!prompt) {
    return res.status(400).json({ message: 'Nenhum prompt foi fornecido' });
  }

  try {
    // --- MUDANÇA 2: Criar o objeto de parâmetros dinamicamente ---
    const apiParams: any = {
      model: modelToUse,
      messages: [
        {
          role: "system",
          content: promptRewriterSystem,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    // --- MUDANÇA 3: Adicionar a temperatura de forma condicional ---
    // Apenas adicione a temperatura se o modelo não for o "nano"
    if (modelToUse !== 'gpt-5-nano') {
      apiParams.temperature = 0.7; // Você pode usar qualquer valor aqui
    }

    const completion = await openai.chat.completions.create(apiParams);
    
    const refinedPrompt = completion.choices[0].message.content;
    
    res.status(200).json({ refinedPrompt });

  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error);
    res.status(500).json({ message: "Erro ao refinar o prompt com a OpenAI" });
  }
}