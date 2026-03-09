import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import pool from '@/lib/db';
import { checkRateLimit } from '@/lib/rateLimit';

type IntentAnalysis = { topic: string; keywords: string };
type DocRow = { content: string; community_name: string };
type FileRow = { title: string; file_url: string };
type ManagerInfo = { name: string; email: string; phone: string };

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const OFFICE_PHONE = "(919) 564-9134";
const OFFICE_EMAIL = "info@communityfocusnc.com";

async function retryWithBackoff<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
    try {
        return await fn();
    } catch (error: unknown) {
        const err = error as { status?: number; message?: string };
        if (retries > 0 && (err.status === 429 || err.message?.includes('429') || err.status === 503)) {
            console.warn(`⚠️ Rate limit hit. Retrying in ${delay}ms... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, delay));
            return retryWithBackoff(fn, retries - 1, delay * 2);
        }
        throw error;
    }
}

export async function POST(request: Request) {
    try {
        // --- RATE LIMITING ---
        const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
            ?? request.headers.get('x-real-ip')
            ?? 'anonymous';
        const rateLimited = await checkRateLimit(ip);
        if (rateLimited) return rateLimited;

        const { message, history, communityName, communitySlug } = await request.json();

        if (!message || (!communityName && !communitySlug)) {
            return NextResponse.json({ error: 'Required fields missing' }, { status: 400 });
        }

        // --- 1. INTENT ANALYSIS ---
        const analyzerModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            generationConfig: { responseMimeType: "application/json" }
        });
        let analysis: IntentAnalysis = { topic: "General", keywords: message };

        try {
            const prompt = `User asking about "${communityName}". Extract keywords. Output JSON: { "topic": "summary", "keywords": "search terms" }`;
            const res = await retryWithBackoff(() => analyzerModel.generateContent([
                { text: prompt },
                { text: `History: ${JSON.stringify(history?.slice(-2) || [])}` },
                { text: message }
            ]));
            const parsed = JSON.parse(res.response.text()) as IntentAnalysis | IntentAnalysis[];
            analysis = Array.isArray(parsed) ? parsed[0] : parsed;
        } catch (e) {
            console.error("Analysis failed, using fallback", e);
            analysis = { topic: "General", keywords: message };
        }

        const keywords = (analysis.keywords || message).replace(/[^\w\s]/g, '').trim();

        // --- 2. EMBEDDING ---
        const embedModel = genAI.getGenerativeModel({ model: "gemini-embedding-001" });

        // --- 3. PARALLEL DATA FETCH ---
        // Use slug for reliable lookup; fall back to name matching
        const communityLookup = communitySlug
            ? { col: 'c.slug', val: communitySlug }
            : { col: 'c.name', val: communityName };

        let manager: ManagerInfo = { name: 'The Office', email: OFFICE_EMAIL, phone: OFFICE_PHONE };
        let communityId: number | null = null;
        let resolvedCommunityName = communityName;
        let foundFiles: FileRow[] = [];
        let contextRows: DocRow[] = [];

        try {
            const [embedRes, communityRes, globalIdRes] = await Promise.all([
                retryWithBackoff(() => embedModel.embedContent(keywords)),
                pool.query(
                    `SELECT c.id, c.name, m.name as manager_name, m.email as manager_email, m.phone as manager_phone
                     FROM communities c
                     LEFT JOIN managers m ON c.manager_id = m.id
                     WHERE ${communityLookup.col} = $1`,
                    [communityLookup.val]
                ),
                pool.query(`SELECT id FROM communities WHERE slug = 'global'`)
            ]);

            const embedding = embedRes.embedding.values;
            const globalId = globalIdRes.rows[0]?.id;

            if (communityRes.rows.length > 0) {
                const row = communityRes.rows[0];
                communityId = row.id;
                resolvedCommunityName = row.name;
                if (row.manager_name) {
                    manager = {
                        name: row.manager_name,
                        email: row.manager_email || OFFICE_EMAIL,
                        phone: row.manager_phone || OFFICE_PHONE,
                    };
                }
            }

            // Fetch files in parallel now that we have communityId
            const filesRes = await pool.query(
                `SELECT title, file_url FROM community_downloads
                 WHERE community_id = $1 AND is_hidden = false
                 AND (title ILIKE $2 OR category ILIKE $2)
                 LIMIT 5`,
                [communityId, `%${keywords}%`]
            );
            foundFiles = filesRes.rows;

            // --- 4. HYBRID SEARCH (community + global) ---
            let vectorDocs: DocRow[] = [];
            try {
                const vectorQuery = await pool.query(
                    `SELECT cd.content, c.name as community_name
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE (cd.community_id = $1 OR cd.community_id = $3)
                     ORDER BY (cd.embedding <=> $2::vector) ASC
                     LIMIT 6`,
                    [communityId, JSON.stringify(embedding), globalId]
                );
                vectorDocs = vectorQuery.rows;
            } catch (e) { console.warn("Vector search failed", e); }

            let keywordDocs: DocRow[] = [];
            try {
                const keywordQuery = await pool.query(
                    `SELECT cd.content, c.name as community_name
                     FROM community_docs cd
                     JOIN communities c ON cd.community_id = c.id
                     WHERE (cd.community_id = $1 OR cd.community_id = $3)
                     AND cd.content ILIKE $2
                     LIMIT 4`,
                    [communityId, `%${keywords.split(' ')[0]}%`, globalId]
                );
                keywordDocs = keywordQuery.rows;
            } catch (e) { console.warn("Keyword search failed", e); }

            // Merge & deduplicate
            const allDocs = [...vectorDocs, ...keywordDocs];
            const seen = new Set<string>();
            contextRows = allDocs.filter(doc => {
                if (seen.has(doc.content)) return false;
                seen.add(doc.content);
                return true;
            }).slice(0, 10);

        } catch (e) {
            console.error("Critical Data Fetch Error", e);
            return NextResponse.json({ reply: "I'm having trouble connecting to the database right now. Please try again in a moment." });
        }

        // --- 5. BUILD SYSTEM PROMPT ---
        const hasContext = contextRows.length > 0;
        const contextText = contextRows
            .map((r) => `[SOURCE: ${r.community_name}] ${r.content}`)
            .join("\n\n");
        const fileLinks = foundFiles
            .map((f) => `- [${f.title}](${f.file_url})`)
            .join("\n");

        const noAnswerFallback = hasContext
            ? `"I don't have that specific rule on file. For a definitive answer, please contact your manager, **${manager.name}**, at **${manager.email}** or **${manager.phone}**."`
            : `"I don't have that information in my database right now. Please reach out to **${manager.name}** directly at **${manager.email}** or **${manager.phone}** — they'll get you a quick answer."`;

        const systemPrompt = `You are **Waldo**, the friendly AI assistant for Community Focus of NC, helping a resident of **${resolvedCommunityName}**.

**COMMUNITY MANAGER:**
- ${manager.name} | ${manager.email} | ${manager.phone}

**RELEVANT DOCUMENTS:**
${foundFiles.length > 0 ? fileLinks : "No documents matched this topic."}

**KNOWLEDGE BASE:**
${contextText || "No matching content found in the knowledge base."}

**YOUR RULES:**
1. **Answer first, explain second.** State the rule or fact immediately in the first sentence. Do not start with "Great question" or filler phrases.
2. **Plain language only.** Replace all legal jargon: "erected" → "built", "vehicular ingress" → "driving in", "prohibited" → "not allowed", "appurtenant" → "attached to".
3. **Local rule beats global.** If [SOURCE: ${resolvedCommunityName}] contradicts [SOURCE: Global Knowledge], the local rule wins. Say so explicitly.
4. **Documents — STRICT RULE:** You may ONLY reference or link a document if it appears verbatim in the RELEVANT DOCUMENTS list above. NEVER mention, suggest, or imply the existence of any map, form, guide, or file that is not explicitly listed there. If no relevant document is listed, do not mention documents at all.
5. **Form submissions:** Always direct submissions to the [Cinc Systems Portal](https://cfnc.cincwebaxis.com/).
6. **When you don't know:** Say exactly: ${noAnswerFallback}
7. **Format:** Bold key terms and deadlines. Use bullet points for multi-step rules. Keep answers concise — 3-5 sentences for simple questions.`;

        // --- 6. MULTI-TURN CHAT WITH HISTORY ---
        const chatModel = genAI.getGenerativeModel({
            model: "gemini-2.0-flash",
            systemInstruction: systemPrompt,
        });

        // Convert frontend history to Gemini's expected format (last 8 turns = 4 exchanges).
        // Gemini requires history to start with a 'user' turn — drop any leading bot messages.
        const rawHistory = (history || []).slice(-8) as { role: string; text: string }[];
        const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
        const formattedHistory = (firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : [])
            .map((msg) => ({
                role: msg.role === 'user' ? 'user' : 'model',
                parts: [{ text: msg.text }],
            }));

        const chat = chatModel.startChat({ history: formattedHistory });
        const result = await retryWithBackoff(() => chat.sendMessage(message));
        const replyText = result.response.text();

        // Signal the UI to show a manager card when Waldo is escalating
        const isEscalating = !hasContext
            || (replyText.toLowerCase().includes('contact') && replyText.includes(manager.name))
            || replyText.toLowerCase().includes("don't have that");

        return NextResponse.json({
            reply: replyText,
            managerInfo: isEscalating ? manager : null,
        });

    } catch (error) {
        console.error("Fatal Chat Error:", error);
        const msg = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: msg }, { status: 500 });
    }
}
