import * as fs from 'fs';
import * as path from 'path';

export interface Finding {
  ruleId: string;
  title: string;
  description: string;
  severity: string;
  category: string;
  file: string;
  line: number;
  snippet: string;
  recommendation: string;
  confidence: string;
}

const RULES = [
  {
    id: "SEC-001",
    title: "Potential Hardcoded AWS Key",
    description: "Found a string that looks like an AWS access key.",
    severity: "CRITICAL",
    category: "Security",
    pattern: /AKIA[0-9A-Z]{16}/i,
    recommendation: "Use environment variables or a secret management service to store credentials."
  },
  {
    id: "SEC-002",
    title: "Generic Secret/Password",
    description: "A variable seemingly contains a hardcoded password or token.",
    severity: "HIGH",
    category: "Security",
    pattern: /(password|secret|token|api_key|apikey)\s*[:=]\s*['"][a-zA-Z0-9_\-\.]{8,}['"]/i,
    recommendation: "Do not hardcode secrets in source code."
  },
  {
    id: "SEC-003",
    title: "Unsafe Eval Usage",
    description: "The eval() function can execute arbitrary code and is a major security risk.",
    severity: "CRITICAL",
    category: "Security",
    pattern: /eval\s*\(/,
    recommendation: "Avoid using eval(). Use safer alternatives like JSON.parse()."
  },
  {
    id: "QUAL-001",
    title: "Console.log Left in Code",
    description: "Console logs should typically be removed before deploying to production.",
    severity: "INFO",
    category: "Code Smell",
    pattern: /console\.log\s*\(/,
    recommendation: "Remove console.log or use a dedicated logging library."
  },
  {
    id: "QUAL-002",
    title: "TODO Comment",
    description: "Unresolved TODO found in the codebase.",
    severity: "INFO",
    category: "Maintainability",
    pattern: /\/\/\s*TODO[:\s]/,
    recommendation: "Resolve the TODO or track it in an issue tracker."
  }
];

export class ScannerEngine {
  private supportedExts = new Set(['.js', '.jsx', '.ts', '.tsx', '.py', '.java', '.go', '.rb', '.php']);

  scanDirectory(rootDir: string): Finding[] {
    const findings: Finding[] = [];
    
    const walkSync = (dir: string) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const filepath = path.join(dir, file);
        const stat = fs.statSync(filepath);
        if (stat.isDirectory()) {
          walkSync(filepath);
        } else {
          const ext = path.extname(file).toLowerCase();
          if (this.supportedExts.has(ext)) {
            this.scanFile(filepath, rootDir, findings);
          }
        }
      }
    };
    
    walkSync(rootDir);
    return findings;
  }

  private scanFile(filepath: string, rootDir: string, findings: Finding[]) {
    try {
      const content = fs.readFileSync(filepath, 'utf-8');
      const lines = content.split('\n');
      const relPath = path.relative(rootDir, filepath).replace(/\\/g, '/');

      lines.forEach((line, index) => {
        for (const rule of RULES) {
          const match = line.match(rule.pattern);
          if (match) {
            let snippet = line.trim();
            if (snippet.length > 150) snippet = snippet.substring(0, 147) + '...';
            
            if (rule.category === 'Security') {
              snippet = snippet.replace(match[0], '[REDACTED_SECRET]');
            }

            findings.push({
              ruleId: rule.id,
              title: rule.title,
              description: rule.description,
              severity: rule.severity,
              category: rule.category,
              file: relPath,
              line: index + 1,
              snippet,
              recommendation: rule.recommendation,
              confidence: "HIGH"
            });
          }
        }
      });
    } catch (e) {
      // Ignore binary files or read errors
    }
  }

  calculateScores(findings: Finding[]) {
    let score = 100.0;
    let securityScore = 100.0;
    let maintainabilityScore = 100.0;
    let reliabilityScore = 100.0;
    let performanceScore = 100.0;

    const weights: Record<string, number> = {
      "CRITICAL": 10.0,
      "HIGH": 5.0,
      "MEDIUM": 2.0,
      "LOW": 0.5,
      "INFO": 0.1
    };

    findings.forEach(f => {
      const weight = weights[f.severity] || 1.0;
      score = Math.max(0, score - (weight * 0.5));

      if (f.category === 'Security') securityScore = Math.max(0, securityScore - weight);
      else if (['Code Smell', 'Maintainability'].includes(f.category)) maintainabilityScore = Math.max(0, maintainabilityScore - weight);
      else if (f.category === 'Bug') reliabilityScore = Math.max(0, reliabilityScore - weight);
      else if (f.category === 'Performance') performanceScore = Math.max(0, performanceScore - weight);
    });

    return {
      score: Number(score.toFixed(1)),
      securityScore: Number(securityScore.toFixed(1)),
      maintainabilityScore: Number(maintainabilityScore.toFixed(1)),
      reliabilityScore: Number(reliabilityScore.toFixed(1)),
      performanceScore: Number(performanceScore.toFixed(1))
    };
  }
}
