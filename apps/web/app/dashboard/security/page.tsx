'use client';

import { useEffect, useState } from 'react';
import { fetchIssues } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldAlert, Shield, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  const [issues, setIssues] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState<any>(null);

  useEffect(() => {
    fetchIssues().then(data => {
      // Filter only security category
      const securityIssues = data.filter((issue: any) => issue.category === 'Security');
      setIssues(securityIssues);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-white/5 w-1/4 rounded"></div>
      <div className="h-64 bg-white/5 rounded"></div>
    </div>;
  }

  const criticalCount = issues.filter(i => i.severity === 'CRITICAL').length;
  const highCount = issues.filter(i => i.severity === 'HIGH').length;

  return (
    <div className="space-y-6 relative">
      {/* Issue Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <Card className="w-full max-w-2xl bg-[#111111] border-white/20 text-white shadow-2xl relative">
            <button 
              onClick={() => setSelectedIssue(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white"
            >
              âœ•
            </button>
            <CardHeader>
              <div className="flex items-center space-x-3 mb-2">
                <Badge variant={selectedIssue.severity.toLowerCase() as any}>{selectedIssue.severity}</Badge>
                <span className="text-sm text-gray-400">Security Vulnerability</span>
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
                  <h4 className="text-sm font-medium text-gray-400 mb-1">Vulnerable Code</h4>
                  <pre className="p-4 bg-black rounded-lg border border-red-500/20 overflow-x-auto text-sm text-gray-300">
                    <code>{selectedIssue.snippet}</code>
                  </pre>
                </div>
              )}
              {selectedIssue.recommendation && (
                <div className="p-4 bg-green-900/10 border border-green-500/20 rounded-lg">
                  <h4 className="text-sm font-medium text-green-400 mb-1">Remediation</h4>
                  <p className="text-gray-200">{selectedIssue.recommendation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
            <ShieldAlert className="w-8 h-8 mr-3 text-red-500" /> Security Overview
          </h1>
          <p className="text-gray-400 mt-1">Monitor and resolve security vulnerabilities across your codebase.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-[#111111] border-red-500/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-red-400">Critical Vulnerabilities</CardTitle>
            <ShieldAlert className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{criticalCount}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111111] border-orange-500/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-orange-400">High Vulnerabilities</CardTitle>
            <Shield className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{highCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-green-500/20 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-green-400">Security Score</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">B-</div>
            <p className="text-xs text-gray-500 mt-1">Needs improvement</p>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-[#111111] border-white/10 text-white">
        <CardHeader>
          <CardTitle>Vulnerability Report</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-4">Severity</th>
                  <th className="px-6 py-4">Vulnerability</th>
                  <th className="px-6 py-4">Repository</th>
                  <th className="px-6 py-4">File</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue) => (
                  <tr 
                    key={issue.id} 
                    onClick={() => setSelectedIssue(issue)}
                    className="border-b border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <Badge variant={issue.severity.toLowerCase() as any}>{issue.severity}</Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-200">{issue.title}</div>
                      <div className="text-gray-500 text-xs mt-1 line-clamp-1">{issue.description}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      <Link 
                        href={`/dashboard/repositories/${issue.analysisJob.repository.id}`} 
                        className="text-blue-400 hover:underline relative z-10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {issue.analysisJob.repository.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 font-mono text-xs text-blue-400">{issue.file}:{issue.line}</td>
                  </tr>
                ))}
                {issues.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-green-500 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5 mr-2" /> No security vulnerabilities detected.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
