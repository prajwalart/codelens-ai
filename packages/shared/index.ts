import { z } from 'zod';

// Shared Analysis Result Type (returned by the python analyzer)
export const AnalysisResultSchema = z.object({
  repositoryId: z.string(),
  commitHash: z.string(),
  branch: z.string(),
  score: z.number().nullable(),
  securityScore: z.number().nullable(),
  maintainabilityScore: z.number().nullable(),
  reliabilityScore: z.number().nullable(),
  issues: z.array(z.object({
    title: z.string(),
    description: z.string(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW', 'INFO']),
    category: z.enum(['Security', 'Bug', 'Performance', 'Maintainability', 'Code Smell', 'Reliability', 'Best Practice']),
    file: z.string(),
    line: z.number().nullable(),
    snippet: z.string().nullable(),
    recommendation: z.string().nullable(),
    confidence: z.enum(['HIGH', 'MEDIUM', 'LOW']).nullable(),
  }))
});

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>;

export const PRReviewResultSchema = z.object({
  pullRequestId: z.string(),
  score: z.number().nullable(),
  summary: z.string().nullable(),
  comments: z.array(z.object({
    file: z.string(),
    line: z.number(),
    body: z.string(),
  }))
});

export type PRReviewResult = z.infer<typeof PRReviewResultSchema>;
