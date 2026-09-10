'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchRepositories } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Github, Star, GitFork, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RepositoriesPage() {
  const [repos, setRepos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRepositories().then(data => {
      setRepos(data);
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-8 bg-white/5 w-1/4 rounded"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"><div className="h-48 bg-white/5 rounded"></div><div className="h-48 bg-white/5 rounded"></div></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Repositories</h1>
          <p className="text-gray-400 mt-1">Manage and analyze your connected GitHub repositories.</p>
        </div>
        <Link 
          href="/dashboard/analyze"
          className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors h-10 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white"
        >
          Analyze New Repository
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {repos.map((repo) => {
          const latestAnalysis = repo.analyses?.[0];
          
          return (
            <Link href={`/dashboard/repositories/${repo.id}`} key={repo.id}>
              <Card className="bg-[#111111] border-white/10 text-white hover:border-blue-500/50 transition-colors cursor-pointer h-full flex flex-col">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Github className="w-6 h-6 text-gray-400" />
                      <div>
                        <CardTitle className="text-lg text-blue-400 truncate">{repo.name}</CardTitle>
                        <p className="text-xs text-gray-500">{repo.owner}</p>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  <p className="text-sm text-gray-400 line-clamp-2 mb-4 flex-1">
                    {repo.description || 'No description available.'}
                  </p>
                  
                  <div className="flex items-center justify-between border-t border-white/10 pt-4 mt-auto">
                    <div className="flex space-x-4 text-xs text-gray-500">
                      <span className="flex items-center"><Star className="w-3 h-3 mr-1" /> {repo.stars}</span>
                      <span className="flex items-center"><GitFork className="w-3 h-3 mr-1" /> {repo.forks}</span>
                      {repo.language && <span className="flex items-center"><span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>{repo.language}</span>}
                    </div>
                    
                    {latestAnalysis ? (
                      <div className="flex items-center text-xs font-medium">
                        <Activity className="w-3 h-3 mr-1 text-green-400" />
                        <span className={latestAnalysis.score >= 80 ? 'text-green-400' : 'text-yellow-400'}>
                          {latestAnalysis.score}/100
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-600">Not analyzed</span>
                    )}
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
