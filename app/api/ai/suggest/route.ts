import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { PromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { NextResponse } from "next/server";
import process from "process";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
    try {
        const { context, userName, tone } = await req.json();

        if (!context || context.trim() === "") {
            console.log("Empty context provided to AI suggestion API");
            return NextResponse.json({ suggestions: [] });
        }

        if (!process.env.GOOGLE_API_KEY) {
            console.error("GOOGLE_API_KEY is not configured");
            return NextResponse.json({ suggestions: [] });
        }

        // Initialize the model with better parameters
        const model = new ChatGoogleGenerativeAI({
            model: "gemini-2.0-flash-exp",
            apiKey: process.env.GOOGLE_API_KEY,
            maxOutputTokens: 300,
            temperature: 0.8,
            topP: 0.9,
            topK: 40,
        });

        // Enhanced prompt template with better instructions
        const promptTemplate = PromptTemplate.fromTemplate(
            `You are an intelligent AI assistant helping {userName} compose contextually appropriate chat replies.

Your task: Analyze the conversation and generate 3 distinct, natural reply suggestions.

Conversation Context:
---
{context}
---

Guidelines:
1. Match the {tone} tone: 
   - Friendly: Warm, casual, use emojis occasionally
   - Professional: Formal, clear, business-appropriate
   - Funny: Humorous, witty, playful
   - Sarcastic: Dry humor, ironic, subtle wit

2. Each suggestion should:
   - Be conversationally natural (15-40 words)
   - Directly respond to the last message
   - Show understanding of context
   - Be distinct from other suggestions
   - Sound like {userName} would say it

3. Vary the suggestions:
   - One direct/simple response
   - One elaborate/detailed response  
   - One creative/engaging response

Output Format: Return ONLY the 3 suggestions separated by " | " (pipe with spaces)
Example: "That sounds great! 😊 | Could you tell me more about that? | I'm intrigued, let's discuss this further!"

Generate suggestions now:`
        );

        // Create a parsing function for more robust output handling
        const parseOutput = (text: string): string[] => {
            // Clean the text
            let cleanText = text.trim();
            
            // Remove any markdown formatting
            cleanText = cleanText.replace(/```[\s\S]*?```/g, '');
            cleanText = cleanText.replace(/`/g, '');
            
            // Remove common prefixes
            cleanText = cleanText.replace(/^(Suggestions?:|Replies?:|Output:)\s*/i, '');
            
            let suggestions: string[] = [];
            
            // Try splitting by |
            if (cleanText.includes('|')) {
                suggestions = cleanText
                    .split('|')
                    .map(s => s.trim())
                    .filter(s => s.length > 5 && s.length < 150)
                    .slice(0, 3);
            }
            // Try splitting by newlines with numbers
            else if (/^\d+[\.\)]\s/.test(cleanText)) {
                suggestions = cleanText
                    .split(/\n+/)
                    .map(s => s.replace(/^\d+[\.\)]\s*/, '').trim())
                    .filter(s => s.length > 5 && s.length < 150)
                    .slice(0, 3);
            }
            // Try splitting by double newlines
            else if (cleanText.split(/\n\n/).length >= 2) {
                suggestions = cleanText
                    .split(/\n\n+/)
                    .map(s => s.trim())
                    .filter(s => s.length > 5 && s.length < 150)
                    .slice(0, 3);
            }
            // Single suggestion or fallback
            else if (cleanText.length > 5 && cleanText.length < 150) {
                suggestions = [cleanText];
            }
            
            // Ensure we have at least some suggestions
            if (suggestions.length === 0) {
                suggestions = ["Thanks for sharing!", "Tell me more about that.", "Interesting point!"];
            }
            
            return suggestions;
        };

        // Create the chain with output parser
        const chain = RunnableSequence.from([
            promptTemplate,
            model,
            new StringOutputParser(),
        ]);

        // Invoke the chain with context
        const result = await chain.invoke({
            context: context.substring(0, 2500), // Increased context window
            userName: userName || "the user",
            tone: tone || "Friendly"
        });

        console.log("AI Raw Response:", result);

        // Parse the suggestions
        const suggestions = parseOutput(result);
        
        console.log("Parsed suggestions:", suggestions);

        return NextResponse.json(
            { suggestions },
            {
                headers: {
                    'Cache-Control': 'no-store, max-age=0',
                },
            }
        );
    } catch (error) {
        console.error("AI Suggestion Error:", error);
        // Return fallback suggestions on error
        return NextResponse.json(
            { 
                suggestions: [
                    "Thanks for letting me know!",
                    "I appreciate you sharing that.",
                    "That's interesting, tell me more!"
                ] 
            },
            { status: 200 }
        );
    }
}
