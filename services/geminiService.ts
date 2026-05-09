import { GoogleGenAI, Type } from '@google/genai';
import { Category, Prompt, Tone } from '../types';

const handleGeminiError = (error: unknown, context: string): Error => {
    console.error(`Error calling Gemini API for ${context}:`, error);
    const errorMessage = String(error).toLowerCase();

    if (errorMessage.includes('api key')) {
        return new Error('API Key is invalid or missing. Please ensure it is configured correctly.');
    }
    if (errorMessage.includes('quota') || errorMessage.includes('rate limit')) {
        return new Error('You have exceeded your request limit. Please wait a moment and try again.');
    }
    if (errorMessage.includes('invalid request') || errorMessage.includes('400')) {
        return new Error('The request was invalid. Please try rephrasing your input.');
    }
    if (errorMessage.includes('fetch') || errorMessage.includes('network')) {
        return new Error('A network error occurred. Please check your internet connection and try again.');
    }

    return new Error(`An unexpected error occurred while ${context}. Please try again.`);
};

const promptResponseSchema = {
    type: Type.OBJECT,
    properties: {
        title: {
            type: Type.STRING,
            description: 'A short, descriptive title for the generated prompt (max 8 words).'
        },
        prompt: {
            type: Type.STRING,
            description: 'The full, optimised prompt text — ready to be copied and pasted into any AI model.'
        },
        tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: 'An array of 3–5 relevant tags for categorising this prompt.'
        }
    },
    required: ['title', 'prompt', 'tags']
};

export const validateUserInput = async (
    userInput: string
): Promise<{ isValid: boolean; reason: string }> => {
    const systemInstruction = `You are an input validation assistant for an AI prompt generator.
Determine if the following user request is a coherent, understandable goal — or if it is nonsense, spam, or gibberish.

Accept: genuine requests, even if brief or imperfect English.
Reject: random characters, keyboard mashing, repeated letters, or completely unrelated words.

The user's input is: "${userInput}"

Return a single valid JSON object.`;

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            is_valid: {
                type: Type.BOOLEAN,
                description: 'True if the input is a coherent request.'
            },
            reason: {
                type: Type.STRING,
                description: 'Brief, friendly explanation. If valid, just say "Coherent request."'
            }
        },
        required: ['is_valid', 'reason']
    };

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userInput,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema,
            },
        });

        const parsed = JSON.parse(response.text.trim());
        return { isValid: parsed.is_valid, reason: parsed.reason };
    } catch (error) {
        throw handleGeminiError(error, 'validating your input');
    }
};

export const generateOptimizedPrompt = async (
    userInput: string,
    tone: Tone,
    category: Category,
    context?: string
): Promise<{ title: string; prompt: string; tags: string[] }> => {

    const contextSection = context
        ? `\nAdditional context the prompt must incorporate: "${context}"`
        : '';

    const systemInstruction = `You are an expert AI prompt engineer. Your job is to transform a rough user goal into a high-quality, ready-to-use prompt that produces excellent results in any LLM (GPT-4, Claude, Gemini).

## What makes a great prompt:
1. **Role/Persona** — Open with "You are a [specific expert]..." to anchor the model's behaviour
2. **Clear objective** — State precisely what output is needed, not just the topic
3. **Constraints** — Specify format, length, tone, audience, and what to avoid
4. **Context** — Give the model the background it needs to succeed
5. **Output format** — Tell it exactly how to structure the response

## Tone guidance:
- Professional: formal, no contractions, data-driven where relevant
- Casual: conversational, first-person friendly, relatable examples
- Academic: structured argument, cite evidence, acknowledge counterpoints
- Creative: imaginative, evocative language, encourage originality
- Technical: precise, step-by-step, include edge cases and error handling

## Category-specific rules:
- Coding: specify language, ask for comments, include error handling, mention input/output
- Marketing: specify target audience, platform, desired emotion, call-to-action
- Education: specify learning level, use analogies, include examples
- Creative Writing: include setting, character depth, narrative arc or mood guidance
- Business: focus on measurable outcomes, executive-friendly language

## User's request:
Goal: "${userInput}"
Tone: ${tone}
Category: ${category}${contextSection}

Generate a prompt that a power user would be proud to share publicly. It must be specific enough that pasting it verbatim into any LLM immediately produces excellent output. Do NOT write a prompt about writing a prompt — write the actual prompt itself.`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: userInput,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: promptResponseSchema,
            },
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleGeminiError(error, 'generating your prompt');
    }
};

export const refinePrompt = async (
    originalPrompt: string,
    refinementInstruction: string
): Promise<{ title: string; prompt: string; tags: string[] }> => {

    const systemInstruction = `You are an expert AI prompt engineer helping a user improve an existing prompt.

The user has a prompt they want to refine. Keep everything that works well and apply only the requested change.

Original prompt:
"""
${originalPrompt}
"""

Refinement requested: "${refinementInstruction}"

Apply the refinement precisely. Do not change the core intent or topic — only adjust what was asked. Return the complete improved prompt, not a diff.`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: refinementInstruction,
            config: {
                systemInstruction,
                responseMimeType: 'application/json',
                responseSchema: promptResponseSchema,
            },
        });

        return JSON.parse(response.text.trim());
    } catch (error) {
        throw handleGeminiError(error, 'refining your prompt');
    }
};

export const generateExampleOutput = async (prompt: Prompt): Promise<string> => {
    const systemInstruction = `You are demonstrating what this AI prompt produces when executed.
Generate a realistic, high-quality example response exactly as if you ARE the AI model receiving this prompt.
Make it look like genuinely useful, production-quality output — not a summary or placeholder.
Format it appropriately for the prompt's intent: use code blocks for code, paragraphs for essays, bullet points for lists, etc.

Prompt to demonstrate:
"${prompt.prompt}"`;

    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt.prompt,
            config: { systemInstruction },
        });

        return response.text;
    } catch (error) {
        throw handleGeminiError(error, 'generating an example output');
    }
};

export const generateExampleImage = async (promptText: string): Promise<string> => {
    try {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });
        const response = await ai.models.generateImages({
            model: 'imagen-4.0-generate-001',
            prompt: promptText,
            config: {
                numberOfImages: 1,
                outputMimeType: 'image/png',
            },
        });

        if (response.generatedImages?.length > 0) {
            const base64ImageBytes = response.generatedImages[0].image.imageBytes;
            return `data:image/png;base64,${base64ImageBytes}`;
        }
        throw new Error('No image was generated by the API.');
    } catch (error) {
        throw handleGeminiError(error, 'generating an example image');
    }
};
