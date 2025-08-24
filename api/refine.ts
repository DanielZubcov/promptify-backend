// ARQUIVO COMPLETO E ATUALIZADO: backend/api/refine.ts

import OpenAI from 'openai';
// A partir de agora, o promptRewriterSystem será mais um template.
import promptRewriterSystem from './promptRewriterSystem';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  // --- MUDANÇA 1: Receber também o objeto de configurações ---
  const { prompt, modelName, settings } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Nenhum prompt foi fornecido' });
  }

  try {
    const refinementModel = "gpt-5-nano";

    // --- MUDANÇA 2: CONSTRUIR O PROMPT DO SISTEMA DE FORMA DINÂMICA ---
    let systemContent = promptRewriterSystem;

    // Se o usuário especificou uma persona, adicionamos à seção de estilo
    if (settings && settings.persona) {
        systemContent += `\n\n# STYLE (Estilo da resposta)\nAdicionalmente, adote a persona de: ${settings.persona}.`;
    }

    // Se o usuário especificou um tom, adicionamos à seção de estilo
    if (settings && settings.tone && settings.tone !== 'neutro') {
        systemContent += `\n\n# STYLE (Estilo da resposta)\nAdicionalmente, adote um tom de voz ${settings.tone}.`;
    }

    // Adicionamos o contexto do modelo que o usuário está usando
    systemContent += `\n\n# MODEL (Contexto adicional)\nO modelo alvo do usuário é o ${modelName || 'desconhecido'}.`;

    const apiParams: any = {
      model: refinementModel,
      messages: [
        {
          role: "system",
          content: systemContent,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    };

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