import axios from 'axios';
import { Finding } from './engine';

export class AIReviewer {
  private apiKey: string | undefined;
  private model: string;
  private provider: string;

  constructor() {
    this.provider = process.env.AI_PROVIDER || 'mock';
    this.apiKey = process.env.AI_API_KEY;
    this.model = process.env.AI_MODEL || 'gpt-4o';
  }

  async reviewFinding(finding: Finding): Promise<string> {
    if (this.provider !== 'openai') {
      return "AI explanation unavailable (AI provider is set to mock mode).";
    }

    if (!this.apiKey) {
      return "AI explanation unavailable (API key not configured).";
    }

    const prompt = `
You are an expert static analysis AI.
A static analyzer found an issue.
Rule: ${finding.title} (${finding.severity} - ${finding.category})
File: ${finding.file} at line ${finding.line}
Snippet:
\`\`\`
${finding.snippet}
\`\`\`

Provide a concise, 2-3 sentence explanation of why this is a problem and a specific suggestion to fix it. Do not use markdown headers, just plain text or light code formatting.
`;

    try {
      const resp = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: this.model,
          messages: [{ role: "user", content: prompt }],
          temperature: 0.2,
          max_tokens: 150
        },
        {
          headers: {
            "Authorization": `Bearer ${this.apiKey}`,
            "Content-Type": "application/json"
          },
          timeout: 30000
        }
      );

      return resp.data.choices[0].message.content.trim();
    } catch (error: any) {
      return `AI analysis failed: ${error.message}`;
    }
  }
}
