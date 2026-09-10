'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Github, Loader2, CheckCircle2 } from 'lucide-react';
import { triggerAnalysis, checkJobStatus } from '@/lib/api';

export default function AnalyzePage() {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!url) {
      setError('Please enter a repository URL');
      return;
    }

    try {
      const parsedUrl = new URL(url);
      if (parsedUrl.hostname !== 'github.com') {
        setError('Please enter a valid GitHub repository URL');
        return;
      }
    } catch {
      setError('Please enter a valid URL');
      return;
    }

    setIsAnalyzing(true);
    setProgress(10);
    setCurrentStep('Queuing analysis job...');

    try {
      const { jobId, repositoryId } = await triggerAnalysis(url);
      pollJobStatus(jobId, repositoryId);
    } catch (err: any) {
      setError(err.message || 'Failed to start analysis');
      setIsAnalyzing(false);
    }
  };

  const pollJobStatus = (jobId: string, repositoryId: string) => {
    const interval = setInterval(async () => {
      try {
        const job = await checkJobStatus(jobId);
        
        if (job.status === 'QUEUED') {
          setProgress(10);
          setCurrentStep('Queued in analysis cluster...');
        } else if (job.status === 'FETCHING') {
          setProgress(25);
          setCurrentStep('Downloading repository from GitHub...');
        } else if (job.status === 'SCANNING') {
          setProgress(50);
          setCurrentStep('Running static code analysis...');
        } else if (job.status === 'AI_REVIEW') {
          setProgress(75);
          setCurrentStep('Generating AI explanations...');
        } else if (job.status === 'SCORING') {
          setProgress(90);
          setCurrentStep('Calculating metrics...');
        } else if (job.status === 'COMPLETED') {
          setProgress(100);
          setCurrentStep('Analysis complete!');
          clearInterval(interval);
          setTimeout(() => {
            router.push(`/dashboard/repositories/${repositoryId}`);
          }, 1000);
        } else if (job.status === 'FAILED') {
          clearInterval(interval);
          setError(job.error || 'Analysis failed during execution.');
          setIsAnalyzing(false);
        }
      } catch (err) {
        console.error('Error polling status:', err);
      }
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto py-12">
      <Card className="bg-[#111111] border-white/10 text-white shadow-2xl">
        <CardHeader className="text-center pb-8">
          <div className="mx-auto w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mb-4">
            <Github className="w-8 h-8 text-blue-500" />
          </div>
          <CardTitle className="text-3xl">Analyze a Repository</CardTitle>
          <CardDescription className="text-gray-400 text-lg mt-2">
            Enter a public GitHub repository URL to scan for bugs, security vulnerabilities, and code quality issues.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isAnalyzing ? (
            <form onSubmit={handleAnalyze} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="url" className="text-sm font-medium text-gray-300">Repository URL</label>
                <input
                  id="url"
                  type="url"
                  required
                  placeholder="https://github.com/facebook/react"
                  className={`w-full bg-black border ${error ? 'border-red-500 focus:ring-red-500' : 'border-white/20 focus:ring-blue-500'} rounded-md px-4 py-3 text-white placeholder:text-gray-600 focus:outline-none focus:ring-2 focus:border-transparent transition-all`}
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    setError('');
                  }}
                />
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
              <Button type="submit" className="w-full h-12 text-lg bg-blue-600 hover:bg-blue-700">
                Start Analysis
              </Button>
            </form>
          ) : (
            <div className="py-8 space-y-8">
              <div className="text-center">
                <h3 className="text-xl font-medium text-white mb-2">{currentStep}</h3>
                <p className="text-gray-400">{progress}% complete</p>
              </div>
              
              <div className="relative w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>

              <div className="space-y-3 pt-4">
                <StepItem label="Queue Job" isDone={progress >= 10} />
                <StepItem label="Static Analysis" isDone={progress >= 50} />
                <StepItem label="Complete" isDone={progress >= 100} />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StepItem({ label, isDone }: { label: string, isDone: boolean }) {
  return (
    <div className="flex items-center space-x-3 text-sm">
      {isDone ? (
        <CheckCircle2 className="w-5 h-5 text-green-500" />
      ) : (
        <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
      )}
      <span className={isDone ? "text-gray-300" : "text-white font-medium"}>{label}</span>
    </div>
  )
}
