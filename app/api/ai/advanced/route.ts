import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { NextResponse } from "next/server";
import process from "process";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { 
            conversationId, 
            messages, 
            userName, 
            tone,
            action = 'suggest' // 'suggest', 'summarize', 'analyze'
        } = await req.json();

        if (!messages || messages.length === 0) {
            return NextResponse.json({ result: null, error: "No messages provided" });
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.error("GOOGLE_API_KEY is not configured");
            return NextResponse.json({ result: null, error: "API key not configured" });
        }

        // Initialize model with advanced settings
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-exp",
            apiKey: process.env.GOOGLE_API_KEY,
            maxOutputTokens: 500,
            temperature: 0.7,
            topP: 0.9,
            topK: 40,
        });

        // Build context from recent messages
        const contextMessages = messages.slice(-10).map((msg: any) => {
            const sender = msg.sender?.name || 'User';
            const text = msg.body || '';
            const time = new Date(msg.createdAt).toLocaleTimeString();
            return `[${time}] ${sender}: ${text}`;
        }).join('\n');

        let result: string;

        switch (action) {
            case 'summarize':
                result = await summarizeConversation(model, contextMessages, userName);
                break;
            
            case 'analyze':
                result = await analyzeConversation(model, contextMessages);
                break;
            
            case 'suggest':
            default:
                result = await generateSuggestions(model, contextMessages, userName, tone);
                break;
        }

        return NextResponse.json(
            { result, action },
            {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            }
        );

    } catch (error) {
        console.error("Advanced AI Error:", error);
        return NextResponse.json(
            { result: null, error: "AI processing failed" },
            { status: 200 }
        );
    }
}

async function generateSuggestions(
    model: ChatGoogleGenerativeAI,
    context: string,
    userName: string,
    tone: string
): Promise<string> {
    const promptTemplate = PromptTemplate.fromTemplate(
        `You are an AI assistant helping {userName} write contextually perfect replies.

Recent Conversation:
{context}

Task: Generate 3 smart reply suggestions matching the {tone} tone.

Rules:
1. Analyze conversation sentiment and topics
2. Match {tone} perfectly (Friendly/Professional/Funny/Sarcastic)
3. Make each suggestion unique and natural
4. Include relevant emojis for Friendly tone
5. Keep 15-45 words per suggestion

Output only: suggestion1 | suggestion2 | suggestion3`
    );

    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser()
    ]);

    const response = await chain.invoke({
        context,
        userName: userName || 'you',
        tone: tone || 'Friendly'
    });

    return response.trim();
}

async function summarizeConversation(
    model: ChatGoogleGenerativeAI,
    context: string,
    userName: string
): Promise<string> {
    const promptTemplate = PromptTemplate.fromTemplate(
        `Analyze this conversation and create a concise summary for {userName}.

Conversation:
{context}

Provide:
1. Main topics discussed (2-3 bullet points)
2. Key decisions or action items
3. Overall sentiment/tone
4. Any unresolved questions

Keep it under 100 words, formatted for easy reading.`
    );

    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser()
    ]);

    const response = await chain.invoke({
        context,
        userName: userName || 'you'
    });

    return response.trim();
}

async function analyzeConversation(
    model: ChatGoogleGenerativeAI,
    context: string
): Promise<string> {
    const promptTemplate = PromptTemplate.fromTemplate(
        `Perform deep analysis of this conversation.

Conversation:
{context}

Analyze:
- Overall sentiment (positive/negative/neutral with %)
- Key topics and themes
- Communication style
- Engagement level
- Any concerns or issues
- Suggested next steps

Provide actionable insights in bullet points.`
    );

    const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser()
    ]);

    const response = await chain.invoke({
        context
    });

    return response.trim();
}
