// ARQUIVO COMPLETO: backend/api/refine.ts

import OpenAI from 'openai';

// 1. Inicializa o cliente da OpenAI
//    Ele automaticamente vai procurar a chave de API na variável de ambiente OPENAI_API_KEY
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 2. Define a função da API (handler da Vercel)
export default async function handler(req, res) {
  // Garante que a requisição seja do tipo POST
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Apenas o método POST é permitido' });
  }

  // Pega o prompt do corpo da requisição
  const { prompt } = req.body;

  // Valida se o prompt foi enviado
  if (!prompt) {
    return res.status(400).json({ message: 'Nenhum prompt foi fornecido' });
  }

  try {
    // 3. Monta a requisição para a API do GPT
    const completion = await openai.chat.completions.create({
      // Modelo: "gpt-4o" é o mais novo e eficiente. 
      // "gpt-3.5-turbo" é mais rápido e mais barato, uma ótima opção para começar.
      model: "gpt-4o", 
      messages: [
        {
          // A "instrução-mestra" que ensina o GPT a se comportar como um refinador
          role: "system",
          content: "Você é um engenheiro de prompts especialista. Sua tarefa é reescrever o prompt do usuário a seguir para ser mais claro, detalhado e eficiente para um grande modelo de linguagem. Forneça contexto, especifique o formato de saída desejado se aplicável e elimine ambiguidades. Retorne APENAS o prompt reescrito, sem nenhuma introdução, explicação ou texto adicional."
        },
        {
          // O prompt que o usuário enviou
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7, // Um pouco de criatividade, mas sem exageros
      max_tokens: 500,  // Limite para o tamanho do prompt refinado
    });

    // 4. Extrai o texto refinado da resposta da API
    const refinedPrompt = completion.choices[0].message.content;

    // 5. Envia o prompt refinado de volta para a extensão
    res.status(200).json({ refinedPrompt });

  } catch (error) {
    // Em caso de erro, loga no servidor e envia uma mensagem de erro clara
    console.error("Erro ao chamar a API da OpenAI:", error);
    res.status(500).json({ message: "Erro ao refinar o prompt com a OpenAI" });
  }
}