// ARQUIVO COMPLETO E ATUALIZADO: backend/api/refine.ts

import OpenAI from 'openai';
import promptRewriterSystem from './promptRewriterSystem';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  // ===============================================================
  // INÍCIO DO NOVO BLOCO DE CÓDIGO PARA LIDAR COM CORS
  // ===============================================================
  // Define os cabeçalhos de permissão. O '*' significa "qualquer origem".
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Se a requisição for do tipo OPTIONS (o "preflight"),
  // apenas retornamos uma resposta de sucesso sem conteúdo.
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  // ===============================================================
  // FIM DO NOVO BLOCO DE CÓDIGO
  // ===============================================================

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  const { prompt } = req.body;

  if (!prompt) {
    return res.status(400).json({ message: 'Nenhum prompt foi fornecido' });
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content: promptRewriterSystem
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7
    });
    
    const refinedPrompt = completion.choices[0].message.content;
    
    // Enviamos a resposta de sucesso
    res.status(200).json({ refinedPrompt });

  } catch (error) {
    console.error("Erro ao chamar a API da OpenAI:", error);
    // Enviamos a resposta de erro
    res.status(500).json({ message: "Erro ao refinar o prompt com a OpenAI" });
  }
}