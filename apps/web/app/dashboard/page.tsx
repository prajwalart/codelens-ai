'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchStats } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FolderGit2, AlertTriangle, CheckCircle, Activity, ArrowRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function DashboardOverview() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats().then(data => {
      setStats(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-8">
      <div className="h-10 bg-white/5 rounded w-1/4"></div>
      <div className="grid grid-cols-4 gap-6"><div className="h-32 bg-white/5 rounded"></div><div className="h-32 bg-white/5 rounded"></div><div className="h-32 bg-white/5 rounded"></div><div className="h-32 bg-white/5 rounded"></div></div>
    </div>;
  }

  // Formatting data for charts
  const severityData = stats ? [
    { name: 'Critical', value: stats.severityDistribution.CRITICAL || 0, color: '#ef4444' },
    { name: 'High', value: stats.severityDistribution.HIGH || 0, color: '#f97316' },
    { name: 'Medium', value: stats.severityDistribution.MEDIUM || 0, color: '#eab308' },
    { name: 'Low', value: stats.severityDistribution.LOW || 0, color: '#3b82f6' },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h1>
          <p className="text-gray-400 mt-1">Here's what's happening across your connected repositories.</p>
        </div>
        <Link 
          href="/dashboard/analyze"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Analyze New Repository
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-[#111111] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Repositories Analyzed</CardTitle>
            <FolderGit2 className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalRepositories || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-[#111111] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Average Quality Score</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-400">{stats?.averageScore || 0}/100</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Pull Requests Reviewed</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats?.totalPullRequests || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Critical Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats?.severityDistribution.CRITICAL || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-[#111111] border-white/10 text-white">
          <CardHeader>
            <CardTitle className="text-lg">Issue Severity Distribution</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px] flex items-center justify-center">
            {severityData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#111', borderColor: '#333', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-500">No issue data available.</p>
            )}
          </CardContent>
        </Card>

        <Card className="bg-[#111111] border-white/10 text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Recent Repository Analyses</CardTitle>
            <Link href="/dashboard/repositories" className="text-sm text-blue-400 hover:text-blue-300 flex items-center">
              View All <ArrowRight className="ml-1 w-4 h-4" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats?.recentRepositories?.map((repo: any) => {
                const latestAnalysis = repo.analyses?.[0];
                return (
                  <Link href={`/dashboard/repositories/${repo.id}`} key={repo.id} className="block">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                      <div>
                        <h4 className="font-semibold text-blue-400">{repo.fullName}</h4>
                        <p className="text-sm text-gray-500">Updated {new Date(repo.updatedAt).toLocaleDateString()} • {repo.defaultBranch} branch</p>
                      </div>
                      {latestAnalysis ? (
                        <div className="text-right">
                          <div className={`text-lg font-bold ${latestAnalysis.score >= 80 ? 'text-green-400' : latestAnalysis.score >= 60 ? 'text-yellow-500' : 'text-red-500'}`}>
                            {latestAnalysis.score}/100
                          </div>
                          <p className="text-xs text-gray-400">Quality Score</p>
                        </div>
                      ) : (
                        <div className="text-right">
                          <div className="text-sm text-gray-500">No analysis</div>
                        </div>
                      )}
                    </div>
                  </Link>
                );
              })}
              {(!stats?.recentRepositories || stats.recentRepositories.length === 0) && (
                <p className="text-gray-500 py-4 text-center">No repositories connected yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
