import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as tar from 'tar';
import * as os from 'os';

export class GitHubFetcher {
  private token: string | undefined;
  private headers: Record<string, string>;
  private maxRepoSizeBytes = 50 * 1024 * 1024;
  private maxFileSizeBytes = 1 * 1024 * 1024;
  private ignoreDirs = new Set(['.git', 'node_modules', 'dist', 'build', 'coverage', 'vendor', '__pycache__', '.next']);
  private ignoreExts = new Set(['.exe', '.dll', '.so', '.dylib', '.png', '.jpg', '.jpeg', '.gif', '.mp4', '.pdf', '.zip', '.tar', '.gz']);

  constructor() {
    this.token = process.env.GITHUB_TOKEN;
    this.headers = { "Accept": "application/vnd.github.v3+json" };
    if (this.token) {
      this.headers["Authorization"] = `token ${this.token}`;
    }
  }

  parseUrl(url: string) {
    const pattern = /https?:\/\/(?:www\.)?github\.com\/([^\/]+)\/([^\/]+?)(?:\.git)?$/;
    const match = url.trim().match(pattern);
    if (!match) throw new Error("Invalid GitHub repository URL");
    return { owner: match[1], repo: match[2] };
  }

  async getMetadata(owner: string, repo: string) {
    try {
      const resp = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers: this.headers });
      const sizeKb = resp.data.size || 0;
      if (sizeKb * 1024 > this.maxRepoSizeBytes) {
        throw new Error(`Repository too large (${sizeKb} KB). Max limit is 50MB.`);
      }
      return resp.data;
    } catch (e: any) {
      if (e.response?.status === 404) throw new Error("Repository not found or is private");
      if (e.response?.status === 403) throw new Error("GitHub API rate limit exceeded");
      throw e;
    }
  }

  async getLatestCommit(owner: string, repo: string, branch = "main") {
    try {
      const resp = await axios.get(`https://api.github.com/repos/${owner}/${repo}/commits/${branch}`, { headers: this.headers });
      return resp.data.sha || "HEAD";
    } catch {
      return "HEAD";
    }
  }

  async downloadTarball(owner: string, repo: string, branch = "main") {
    const url = `https://api.github.com/repos/${owner}/${repo}/tarball/${branch}`;
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `codelens_${owner}_${repo}_`));
    const tarPath = path.join(tempDir, "repo.tar.gz");
    const extractedDir = path.join(tempDir, "source");
    fs.mkdirSync(extractedDir);

    try {
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'stream',
        headers: this.headers
      });

      let downloadedSize = 0;
      const writer = fs.createWriteStream(tarPath);

      await new Promise((resolve, reject) => {
        response.data.on('data', (chunk: Buffer) => {
          downloadedSize += chunk.length;
          if (downloadedSize > this.maxRepoSizeBytes) {
            writer.destroy();
            reject(new Error("Repository tarball exceeds size limit"));
          }
        });
        response.data.pipe(writer);
        writer.on('finish', () => resolve(null));
        writer.on('error', reject);
      });

      await tar.x({
        file: tarPath,
        cwd: extractedDir,
        strip: 1,
        filter: (pathStr, entry: any) => {
          if (entry.type === 'SymbolicLink' || entry.type === 'Link') return false;
          const parts = pathStr.split('/');
          if (parts.some(p => this.ignoreDirs.has(p))) return false;
          const ext = path.extname(pathStr).toLowerCase();
          if (this.ignoreExts.has(ext)) return false;
          if (entry.size > this.maxFileSizeBytes) return false;
          return true;
        }
      });
      
      fs.unlinkSync(tarPath);
      return extractedDir;
    } catch (error) {
      this.cleanup(tempDir);
      throw error;
    }
  }

  cleanup(directory: string) {
    if (fs.existsSync(directory) && directory.includes('codelens_')) {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  }
}
