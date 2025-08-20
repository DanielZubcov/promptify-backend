// ARQUIVO COMPLETO E ATUALIZADO: backend/api/refine.ts

import OpenAI from 'openai';

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
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "Você é um engenheiro de prompts especialista. Sua tarefa é reescrever o prompt do usuário a seguir para ser mais claro, detalhado e eficiente para um grande modelo de linguagem. Forneça contexto, especifique o formato de saída desejado se aplicável e elimine ambiguidades. Retorne APENAS o prompt reescrito, sem nenhuma introdução, explicação ou texto adicional."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500,
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