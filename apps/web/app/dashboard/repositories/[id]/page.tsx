'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchRepositoryDetails } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Github, Activity, Shield, AlertTriangle, Bug, Code2, Zap } from 'lucide-react';

export default function RepositoryDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [repo, setRepo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    fetchRepositoryDetails(id).then(data => {
      setRepo(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-10 bg-white/5 w-1/3 rounded"></div>
      <div className="grid grid-cols-4 gap-6"><div className="h-32 bg-white/5 rounded"></div><div className="h-32 bg-white/5 rounded"></div></div>
      <div className="h-96 bg-white/5 rounded"></div>
    </div>;
  }

  if (!repo) return <div className="text-white">Repository not found</div>;

  const latestAnalysis = repo.analyses?.[0];
  const issues = latestAnalysis?.issues || [];

  return (
    <div className="space-y-8 relative">
      {/* Issue Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-[#111111] border-white/20 text-white shadow-2xl relative">
            <button 
              onClick={() => setSelectedIssue(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              ✕
            </button>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <Badge variant={selectedIssue.severity.toLowerCase() as any}>{selectedIssue.severity}</Badge>
                <span className="text-sm text-gray-400">{selectedIssue.category}</span>
              </div>
              <CardTitle className="text-xl">{selectedIssue.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Description</h4>
                <p className="text-gray-200">{selectedIssue.description}</p>
              </div>
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-1">Location</h4>
                <code className="px-2 py-1 bg-black rounded border border-white/10 text-blue-400 text-sm">
                  {selectedIssue.file}:{selectedIssue.line}
                </code>
              </div>
              {selectedIssue.snippet && (
                <div>
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Code Snippet</h4>
                  <pre className="p-4 bg-black rounded-lg border border-white/10 overflow-x-auto text-sm text-gray-300">
                    <code>{selectedIssue.snippet}</code>
                  </pre>
                </div>
              )}
              {selectedIssue.recommendation && (
                <div className="p-4 bg-blue-900/20 border border-blue-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-400 mb-1">Recommendation</h4>
                  <p className="text-gray-200">{selectedIssue.recommendation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center space-x-4">
        <Link href="/dashboard/repositories" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <Github className="w-8 h-8 mr-3 text-gray-400" />
            {repo.fullName}
          </h1>
          <p className="text-gray-400 mt-1 flex items-center space-x-4">
            <span>{repo.description || 'No description provided.'}</span>
            <span className="text-gray-600">•</span>
            <span className="flex items-center"><StarIcon className="w-4 h-4 mr-1 text-yellow-500" /> {repo.stars}</span>
            <span className="flex items-center"><ForkIcon className="w-4 h-4 mr-1 text-gray-400" /> {repo.forks}</span>
          </p>
        </div>
      </div>

      {latestAnalysis ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <ScoreCard title="Overall Score" score={latestAnalysis.score} icon={<Activity className="text-blue-500" />} />
            <ScoreCard title="Security" score={latestAnalysis.securityScore} icon={<Shield className="text-red-500" />} />
            <ScoreCard title="Maintainability" score={latestAnalysis.maintainabilityScore} icon={<Code2 className="text-yellow-500" />} />
            <ScoreCard title="Reliability" score={latestAnalysis.reliabilityScore} icon={<Bug className="text-green-500" />} />
            <ScoreCard title="Performance" score={latestAnalysis.performanceScore ?? 100} icon={<Zap className="text-purple-500" />} />
          </div>

          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader className="border-b border-white/10">
              <CardTitle>Detected Issues</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-white/10">
                    <tr>
                      <th className="px-6 py-4 font-semibold">Severity</th>
                      <th className="px-6 py-4 font-semibold">Category</th>
                      <th className="px-6 py-4 font-semibold">File</th>
                      <th className="px-6 py-4 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issues.map((issue: any) => (
                      <tr 
                        key={issue.id} 
                        onClick={() => setSelectedIssue(issue)}
                        className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      >
                        <td className="px-6 py-4">
                          <Badge variant={issue.severity.toLowerCase() as any}>{issue.severity}</Badge>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{issue.category}</td>
                        <td className="px-6 py-4 font-mono text-xs text-blue-400">{issue.file}:{issue.line}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-200">{issue.title}</div>
                          <div className="text-gray-500 text-xs mt-1 line-clamp-1">{issue.description}</div>
                        </td>
                      </tr>
                    ))}
                    {issues.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No issues detected! 🎉
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <Card className="bg-[#111111] border-white/10 text-center py-16">
          <CardContent>
            <div className="mx-auto w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">No Analysis Data</h3>
            <p className="text-gray-400 mb-6">This repository hasn't been analyzed yet.</p>
            <Link href="/dashboard/analyze">
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors">
                Run First Analysis
              </button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ScoreCard({ title, score, icon }: { title: string, score: number, icon: React.ReactNode }) {
  const getColor = (s: number) => {
    if (s >= 90) return 'text-green-400';
    if (s >= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <Card className="bg-[#111111] border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-gray-400">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${getColor(score)}`}>{score || '-'}</div>
      </CardContent>
    </Card>
  );
}

function StarIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>;
}

function ForkIcon(props: any) {
  return <svg viewBox="0 0 24 24" fill="currentColor" {...props}><path d="M16 11V7a4 4 0 00-8 0v4a1 1 0 00-1 1v2a1 1 0 001 1h1v4h-2v2h6v-2h-2v-4h1a1 1 0 001-1v-2a1 1 0 00-1-1zm-6-4a2 2 0 114 0v4h-4V7z"/></svg>;
}
