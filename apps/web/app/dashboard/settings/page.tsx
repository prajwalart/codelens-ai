'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { User, Bell, Palette, Github, ShieldAlert, Zap, AlertTriangle, Save, Check } from 'lucide-react';

export default function SettingsPage() {
  const { data: session } = useSession();
  const [saved, setSaved] = useState(false);
  
  // Local state for demo purposes
  const [notifySecurity, setNotifySecurity] = useState(true);
  const [notifyPr, setNotifyPr] = useState(true);
  const [notifyAnalysis, setNotifyAnalysis] = useState(false);
  const [enableAiReview, setEnableAiReview] = useState(true);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Settings</h1>
          <p className="text-gray-400 mt-1">Manage your account preferences and integrations.</p>
        </div>
        <Button 
          onClick={handleSave} 
          className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
        >
          {saved ? <><Check className="w-4 h-4 mr-2" /> Saved</> : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="space-y-1">
          <SettingsNavLink active icon={<User className="w-4 h-4 mr-2" />} label="Profile" />
          <SettingsNavLink icon={<Palette className="w-4 h-4 mr-2" />} label="Appearance" />
          <SettingsNavLink icon={<Bell className="w-4 h-4 mr-2" />} label="Notifications" />
          <SettingsNavLink icon={<Zap className="w-4 h-4 mr-2" />} label="Analysis Preferences" />
          <SettingsNavLink icon={<Github className="w-4 h-4 mr-2" />} label="Integrations" />
          <SettingsNavLink icon={<AlertTriangle className="w-4 h-4 mr-2 text-red-500" />} label="Danger Zone" danger />
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-3 space-y-8">
          
          {/* Profile Section */}
          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>This is how others will see you on the platform.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-blue-900/50 flex items-center justify-center border border-blue-500/50">
                  <span className="text-xl text-blue-200">DU</span>
                </div>
                <Button variant="outline" className="border-white/20 hover:bg-white/10">Change Avatar</Button>
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-300">Name</label>
                <input
                  type="text"
                  defaultValue="Demo User"
                  className="w-full bg-black border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="grid gap-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <input
                  type="email"
                  defaultValue="demo@codelens.ai"
                  disabled
                  className="w-full bg-black/50 border border-white/10 rounded-md px-3 py-2 text-gray-500 cursor-not-allowed"
                />
                <p className="text-xs text-gray-500">Email cannot be changed in demo mode.</p>
              </div>
            </CardContent>
          </Card>

          {/* Appearance Section */}
          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how CodeLens AI looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border border-white/10 rounded-lg bg-black/50">
                <div className="space-y-0.5">
                  <div className="font-medium text-white">Dark Theme</div>
                  <div className="text-sm text-gray-400">CodeLens AI uses a developer-focused dark theme by default.</div>
                </div>
                <Badge className="bg-blue-600 text-white hover:bg-blue-600">Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notifications Section */}
          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Configure how you receive alerts and updates.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleRow 
                title="Security Alerts" 
                description="Receive emails when critical vulnerabilities are detected."
                checked={notifySecurity}
                onChange={() => setNotifySecurity(!notifySecurity)}
              />
              <ToggleRow 
                title="Pull Request Reviews" 
                description="Get notified when AI completes a PR review."
                checked={notifyPr}
                onChange={() => setNotifyPr(!notifyPr)}
              />
              <ToggleRow 
                title="Analysis Completion" 
                description="Get notified when a manual repository analysis finishes."
                checked={notifyAnalysis}
                onChange={() => setNotifyAnalysis(!notifyAnalysis)}
              />
            </CardContent>
          </Card>

          {/* Analysis Preferences Section */}
          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader>
              <CardTitle>Analysis Preferences</CardTitle>
              <CardDescription>Manage how the CodeLens engine scans your code.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <ToggleRow 
                title="AI Code Review" 
                description="Enable large language models to provide architectural feedback on PRs."
                checked={enableAiReview}
                onChange={() => setEnableAiReview(!enableAiReview)}
              />
              <div className="grid gap-2 pt-2">
                <label className="text-sm font-medium text-gray-300">Default Analysis Depth</label>
                <select className="w-full bg-black border border-white/20 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="shallow">Shallow (Fastest, limits AST depth)</option>
                  <option value="standard" selected>Standard (Recommended)</option>
                  <option value="deep">Deep (Slower, full dependency graph resolution)</option>
                </select>
              </div>
            </CardContent>
          </Card>

          {/* GitHub Integration Section */}
          <Card className="bg-[#111111] border-white/10 text-white">
            <CardHeader>
              <CardTitle>GitHub Integration</CardTitle>
              <CardDescription>Manage your connected GitHub account and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 border border-white/10 rounded-lg bg-black/50">
                <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                  <div className="p-2 bg-white rounded-md">
                    <Github className="w-6 h-6 text-black" />
                  </div>
                  <div>
                    <div className="font-medium text-white flex items-center">
                      Connected to GitHub <Badge variant="outline" className="ml-2 bg-green-500/10 text-green-400 border-green-500/20">Active</Badge>
                    </div>
                    <div className="text-sm text-gray-400">{session?.user?.name || session?.user?.email || 'User'} • Standard Access</div>
                  </div>
                </div>
                <Button 
                  onClick={() => window.alert("Disconnection feature is coming soon.")}
                  variant="outline" 
                  className="border-white/20 hover:bg-red-500/10 hover:text-red-500 hover:border-red-500/30"
                >
                  Disconnect
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone Section */}
          <Card className="border-red-500/20 bg-red-950/10 text-white">
            <CardHeader>
              <CardTitle className="text-red-500 flex items-center">
                <ShieldAlert className="w-5 h-5 mr-2" /> Danger Zone
              </CardTitle>
              <CardDescription className="text-red-400/80">Irreversible actions regarding your account data.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-red-500/10 pb-4">
                <div className="mb-4 sm:mb-0">
                  <div className="font-medium text-gray-200">Clear Data</div>
                  <div className="text-sm text-gray-400">Permanently delete all your repositories, PRs, and issues.</div>
                </div>
                <Button 
                  onClick={() => window.alert("Feature coming soon.")}
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                >
                  Clear Data
                </Button>
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pt-2">
                <div className="mb-4 sm:mb-0">
                  <div className="font-medium text-gray-200">Delete Account</div>
                  <div className="text-sm text-gray-400">Permanently delete your account and all associated data.</div>
                </div>
                <Button 
                  onClick={() => window.alert("Feature coming soon.")}
                  variant="destructive" 
                  className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
}

function SettingsNavLink({ active, icon, label, danger }: { active?: boolean, icon: React.ReactNode, label: string, danger?: boolean }) {
  return (
    <button className={`w-full flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors text-left ${
      active 
        ? 'bg-white/10 text-white' 
        : danger 
          ? 'text-red-400 hover:bg-red-500/10 hover:text-red-300' 
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
    }`}>
      {icon}
      {label}
    </button>
  )
}

function ToggleRow({ title, description, checked, onChange }: { title: string, description: string, checked: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-0.5 pr-4">
        <div className="font-medium text-gray-200 text-sm">{title}</div>
        <div className="text-sm text-gray-400">{description}</div>
      </div>
      <button 
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[#111111] ${checked ? 'bg-blue-600' : 'bg-gray-700'}`}
      >
        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  )
}

