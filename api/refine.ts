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
    if (!prompt) {
        return res.status(400).json({ message: 'Nenhum prompt foi fornecido' });
    }

    try {
        const refinementModel = "gpt-5-nano";
        const persona = settings?.persona || null;
        const tone = settings?.tone || null;

        let systemContent = promptRewriterSystem;

        let styleContent = '';
        if (persona) {
            styleContent += `\n- Adote a persona de: ${persona}. `;
        }
        if (tone && tone !== 'neutro') {
            styleContent += `\n- Adote um tom de fala: ${tone}. `;
        }
        if (styleContent) {
            systemContent += `\n# STYLE (Estilo da resposta)\n${styleContent}\n`;
        }

        let contextContent = `\n- O modelo alvo do usuário é o ${modelName || 'desconhecido'}.`;
        if (contextContent) {
            systemContent += `\n# CONTEXT (Contexto adicional)\n${contextContent}`;
        }

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

    const temperature = settings?.temperature !== undefined ? settings.temperature : 0.7;
    const maxTokens = settings?.maxTokens !== undefined ? settings.maxTokens : 1024;

    const jsonParameters = {
        temperature: temperature,
        max_tokens: maxTokens,
    };

    const finalPrompt = `${JSON.stringify(jsonParameters, null, 2)}\n\n${refinedPrompt}`;

    res.status(200).json({ refinedPrompt: finalPrompt });

    } catch (error) {
        console.error("Erro ao chamar a API da OpenAI:", error);
        res.status(500).json({ message: "Erro ao refinar o prompt com a OpenAI" });
    }
}