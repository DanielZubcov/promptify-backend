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

    const { prompt, modelName, settings } = req.body;

    const temperature = settings?.temperature !== undefined ? settings.temperature : 0.7;
    const maxTokens = settings?.maxTokens !== undefined ? settings.maxTokens : 1024;
    const persona = settings?.persona || null;
    const tone = settings?.tone || null;


    if (!prompt) {
        return res.status(400).json({ message: 'Nenhum prompt foi fornecido' });
    }

    try {
        const refinementModel = "gpt-5-nano";

        const jsonParameters = JSON.stringify({
            temperature: temperature,
            max_tokens: maxTokens,
        }, null, 2);

        let textContent = promptRewriterSystem;

        let styleContent = '';
        if (persona) {
            styleContent += `\n\n# STYLE (Estilo da resposta)\nAdicionalmente, adote a persona de: ${persona}.`;
        }

        if (tone && tone !== 'neutro') {
            styleContent += `\n\n# STYLE (Estilo da resposta)\nAdicionalmente, adote um tom de voz ${tone}.`;
        }

        if (styleContent) {
            textContent += `\n\n# STYLE (Estilo da resposta)${styleContent}`;
        }

        let contextContent = `\n- O modelo alvo do usuário é o ${modelName || 'desconhecido'}.`;
        if (contextContent) {
            textContent += `\n\n# CONTEXT (Contexto adicional)${contextContent}`;
        }

        const finalPrompt = `${jsonParameters}\n\n${textContent}`;

        const apiParams: any = {
            model: refinementModel,
            messages: [
                {
                    role: "system",
                    content: finalPrompt,
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