export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function fetchStats() {
  const res = await fetch('/api/proxy/dashboard/stats', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch stats');
  return res.json();
}

export async function fetchRepositories() {
  const res = await fetch('/api/proxy/repositories', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch repositories');
  return res.json();
}

export async function fetchRepositoryDetails(id: string) {
  const res = await fetch(`/api/proxy/repositories/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch repository details');
  return res.json();
}

export async function triggerAnalysis(repoUrl: string) {
  const res = await fetch('/api/analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: repoUrl })
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || 'Failed to trigger analysis');
  }
  return res.json();
}

export async function checkJobStatus(jobId: string) {
  const res = await fetch(`/api/proxy/repositories/jobs/${jobId}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to check job status');
  return res.json();
}

export async function fetchPullRequests() {
  const res = await fetch('/api/proxy/pull-requests', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch pull requests');
  return res.json();
}

export async function fetchPullRequestDetails(id: string) {
  const res = await fetch(`/api/proxy/pull-requests/${id}`, { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch PR details');
  return res.json();
}

export async function fetchIssues() {
  const res = await fetch('/api/proxy/issues', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch issues');
  return res.json();
}
