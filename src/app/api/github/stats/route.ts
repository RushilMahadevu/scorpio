import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  // Works for both local (.env.local) and Firebase Functions secrets
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("GITHUB_TOKEN is not set");
    return Response.json({ error: "GitHub token not configured" }, { status: 500 });
  }

  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github.v3+json',
    'User-Agent': 'scorpio-app',
    'Authorization': `token ${token}`,
  };

  try {
    const [commitsRes, recentRes] = await Promise.all([
      fetch('https://api.github.com/repos/RushilMahadevu/scorpio/commits?per_page=1', { headers }),
      fetch('https://api.github.com/repos/RushilMahadevu/scorpio/commits?per_page=5', { headers }),
    ]);

    if (!commitsRes.ok || !recentRes.ok) {
      const text = await commitsRes.text();
      console.error("GitHub API error:", commitsRes.status, text);
      return Response.json({ error: "GitHub API error", details: text }, { status: 502 });
    }

    const linkHeader = commitsRes.headers.get('link');
    const totalCommits = linkHeader?.match(/&page=(\d+)>; rel="last"/)?.[1] || "130";
    const recentCommits = await recentRes.json();

    const formattedCommits = recentCommits.map((c: any) => ({
      sha: c.sha,
      message: c.commit.message,
      date: c.commit.author.date,
      url: c.html_url,
      author: c.commit.author.name
    }));

    return Response.json({ totalCommits, recentCommits: formattedCommits });
  } catch (error) {
    console.error("GitHub Fetch Error:", error);
    return Response.json({ error: 'Failed to fetch GitHub stats' }, { status: 500 });
  }
}
