// ARQUIVO COMPLETO E ATUALIZADO: backend/api/refine.ts

import OpenAI from 'openai';
import promptRewriterSystem from './promptRewriterSystem';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // Bloco de CORS...
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  const { prompt, modelName } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Nenhum prompt foi fornecido' });
  }

  try {
    // --- MUDANÇA 1: Decidir o modelo de refinamento com base no status do usuário (futuramente) ---
    // Por enquanto, vamos usar o gpt-5-nano para todos.
    const refinementModel = "gpt-5-nano";

    // --- MUDANÇA 2: Usar o modelName detectado para enriquecer o prompt de sistema ---
    // Adicionamos a informação do modelo detectado ao contexto.
    const systemContent = `${promptRewriterSystem}\n\n# CONTEXT (Contexto adicional)\nO modelo alvo do usuário é o ${modelName || 'desconhecido'}.`;

    const apiParams: any = {
      model: refinementModel, // Usamos o modelo de refinamento correto
      messages: [
        {
          role: "system",
          content: systemContent, // Usamos o prompt de sistema enriquecido
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

    // Adicionar a temperatura de forma condicional, se necessário
    if (refinementModel !== 'gpt-5-nano') {
      apiParams.temperature = 0.7;
    }

    const completion = await openai.chat.completions.create(apiParams);
    
    const refinedPrompt = completion.choices[0].message.content;
    
    res.status(200).json({ refinedPrompt });

  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error);
    res.status(500).json({ message: "Erro ao refinar o prompt com a OpenAI" });
  }
}