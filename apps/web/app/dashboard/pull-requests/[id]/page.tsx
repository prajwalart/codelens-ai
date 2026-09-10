'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { fetchPullRequestDetails } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, ArrowLeft, Bot, Github, CheckCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function PullRequestDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [pr, setPr] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPullRequestDetails(id).then(data => {
      setPr(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-white/5 w-1/4 rounded"></div>
      <div className="h-64 bg-white/5 rounded"></div>
    </div>;
  }

  if (!pr) return <div className="text-white">PR not found</div>;

  const latestReview = pr.reviews?.[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/dashboard/pull-requests" className="text-gray-400 hover:text-white">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center">
            {pr.title} <span className="text-gray-500 font-normal ml-3">#{pr.number}</span>
          </h1>
          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-400">
            <Badge variant="outline" className="text-green-400 border-green-400/30 bg-green-400/10">
              {pr.state}
            </Badge>
            <span>by {pr.author}</span>
            <span>in {pr.repository.fullName}</span>
            <a href={pr.url} target="_blank" rel="noreferrer" className="flex items-center text-blue-400 hover:underline">
              <Github className="w-4 h-4 mr-1" /> View on GitHub
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Review Column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader className="flex flex-row items-center border-b border-white/10 pb-4">
              <Bot className="w-6 h-6 text-purple-400 mr-3" />
              <CardTitle className="text-xl">AI Code Review</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {latestReview?.summary ? (
                <div className="prose prose-invert max-w-none prose-headings:text-gray-200 prose-a:text-blue-400">
                  <ReactMarkdown>{latestReview.summary}</ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-500">No AI review summary available yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-6">
          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader>
              <CardTitle className="text-lg">Review Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-400">Status</span>
                {latestReview?.status === 'COMPLETED' ? (
                  <span className="flex items-center text-green-400 font-medium">
                    <CheckCircle className="w-4 h-4 mr-1" /> Completed
                  </span>
                ) : (
                  <span className="text-yellow-500 font-medium">Pending</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/10">
                <span className="text-gray-400">Quality Score</span>
                <span className="text-2xl font-bold text-green-400">{latestReview?.score || '-'}/100</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
