import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Shield, Zap, Search, Activity, Github, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl tracking-tight">CodeLens AI</span>
            </div>
            <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-300">
              <a href="#features" className="hover:text-white transition-colors">Features</a>
              <a href="#how-it-works" className="hover:text-white transition-colors">How it Works</a>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/sign-in"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors hover:bg-white/10 h-10 px-4 py-2 text-white"
              >
                Sign In
              </Link>
              <Link 
                href="/dashboard"
                className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors bg-blue-600 hover:bg-blue-700 text-white h-10 px-4 py-2"
              >
                View Demo
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="relative overflow-hidden">
        {/* Abstract Background Gradient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-24 relative z-10 text-center">
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-8">
            AI-Powered Code Intelligence <br className="hidden md:block"/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">
              for Modern Developers
            </span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg md:text-xl text-gray-400 mb-10">
            Automatically review Pull Requests, detect bugs, secure your repositories, and get actionable AI-driven recommendations in seconds.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6">
            <Link 
              href="/dashboard/analyze"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors bg-white text-black hover:bg-gray-200 h-14 px-8 text-lg w-full sm:w-auto"
            >
              <Github className="mr-2 w-5 h-5" />
              Analyze a Repository
            </Link>
            <Link 
              href="/dashboard"
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors border border-white/20 bg-transparent hover:bg-white/10 text-white h-14 px-8 text-lg w-full sm:w-auto"
            >
              View Demo <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>

        {/* Dashboard Preview Mockup */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pb-32">
          <div className="rounded-xl border border-white/10 bg-gray-900/50 backdrop-blur-sm p-4 shadow-2xl">
            <div className="rounded-lg overflow-hidden border border-white/5 bg-black aspect-video relative flex items-center justify-center">
               {/* Mockup Content placeholder */}
               <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/80" />
               <Activity className="w-24 h-24 text-blue-500/50" />
               <p className="absolute bottom-10 font-mono text-blue-400/80">Analysis complete: 87/100 Quality Score</p>
            </div>
          </div>
        </div>

        {/* How It Works / Features Section */}
        <div id="how-it-works" className="bg-white/5 py-32 border-y border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight mb-4">Complete Codebase Visibility</h2>
              <p className="text-gray-400 max-w-2xl mx-auto">Everything you need to ship secure, maintainable code faster.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-black/50 border border-white/10 p-8 rounded-2xl hover:border-blue-500/50 transition-colors">
                <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Shield className="text-blue-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Security Analysis</h3>
                <p className="text-gray-400">Detect hardcoded secrets, SQL injection patterns, and unsafe dependencies automatically.</p>
              </div>

              <div className="bg-black/50 border border-white/10 p-8 rounded-2xl hover:border-purple-500/50 transition-colors">
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Activity className="text-purple-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">AI Code Review</h3>
                <p className="text-gray-400">Get context-aware explanations and architectural recommendations powered by AI.</p>
              </div>

              <div className="bg-black/50 border border-white/10 p-8 rounded-2xl hover:border-green-500/50 transition-colors">
                <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center mb-6">
                  <Zap className="text-green-400 w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Pull Request Bot</h3>
                <p className="text-gray-400">Automated reviews directly on your GitHub PRs before you merge.</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-24 bg-black relative overflow-hidden">
        {/* Subtle background glow for footer */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[300px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="mb-16 space-y-4">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white">
              Discover the power of code.
            </h2>
            <p className="text-lg md:text-xl text-gray-400 font-light tracking-wide">
              Build what matters. <span className="text-white font-medium">Change the world.</span>
            </p>
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-col items-center justify-center">
            <p className="text-sm text-gray-500 flex flex-col sm:flex-row items-center justify-center sm:space-x-1">
              <span>Â© 2026 CodeLens AI. Built by</span>
              <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500 tracking-wide mt-1 sm:mt-0 hover:opacity-80 transition-opacity cursor-default">
                Prajwal R.
              </span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
