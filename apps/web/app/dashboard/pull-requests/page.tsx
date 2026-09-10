'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchPullRequests } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { GitPullRequest, Search, CheckCircle, Clock } from 'lucide-react';

export default function PullRequestsPage() {
  const [prs, setPrs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPullRequests().then(data => {
      setPrs(data);
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Pull Requests</h1>
          <p className="text-gray-400 mt-1">Review AI-generated insights for your pull requests.</p>
        </div>
      </div>

      <Card className="bg-[#111111] border-white/10 text-white">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Active Pull Requests</CardTitle>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search PRs..."
                className="pl-9 pr-4 py-2 bg-black border border-white/10 rounded-md text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-400 uppercase bg-black/50 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3">PR Details</th>
                  <th className="px-6 py-3">Repository</th>
                  <th className="px-6 py-3">Review Status</th>
                  <th className="px-6 py-3">Score</th>
                  <th className="px-6 py-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {prs.map((pr) => {
                  const latestReview = pr.reviews?.[0];
                  return (
                    <tr key={pr.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <GitPullRequest className="w-5 h-5 text-green-500" />
                          <div>
                            <div className="font-medium text-blue-400 hover:underline">
                              <Link href={`/dashboard/pull-requests/${pr.id}`}>
                                {pr.title}
                              </Link>
                            </div>
                            <div className="text-gray-500 text-xs">#{pr.number} opened by {pr.author}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{pr.repository.fullName}</td>
                      <td className="px-6 py-4">
                        {latestReview?.status === 'COMPLETED' ? (
                          <span className="flex items-center text-green-400">
                            <CheckCircle className="w-4 h-4 mr-1" /> Reviewed
                          </span>
                        ) : (
                          <span className="flex items-center text-yellow-500">
                            <Clock className="w-4 h-4 mr-1" /> Pending
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {latestReview?.score ? (
                          <span className={latestReview.score >= 80 ? 'text-green-400 font-bold' : 'text-yellow-500 font-bold'}>
                            {latestReview.score}/100
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link href={`/dashboard/pull-requests/${pr.id}`} className="text-blue-500 hover:text-blue-400 font-medium">
                          View Details
                        </Link>
                      </td>
                    </tr>
                  )
                })}
                {prs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      No pull requests found.
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
