import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 3600; // Cache for 1 hour

export async function GET() {
  try {
    const owner = 'RushilMahadevu';
    const repo = 'scorpio';

    // Fetch total commits count using per_page=1 and looking at the Link header
    const commitsRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=1`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add a User-Agent which is required by GitHub API
          'User-Agent': 'scorpio-app'
        }
      }
    );

    if (!commitsRes.ok) {
      throw new Error(`GitHub API error: ${commitsRes.status}`);
    }

    const linkHeader = commitsRes.headers.get('link');
    let totalCommits = '120'; // Fallback
    
    if (linkHeader) {
      const match = linkHeader.match(/&page=(\d+)>; rel="last"/);
      if (match) {
        totalCommits = match[1];
      }
    }

    // Fetch recent commits
    const recentRes = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/commits?per_page=5`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          'User-Agent': 'scorpio-app'
        }
      }
    );

    if (!recentRes.ok) {
      throw new Error(`GitHub API error: ${recentRes.status}`);
    }

    const commitsData = await recentRes.json();
    const recentCommits = commitsData.map((c: any) => ({
      sha: c.sha.substring(0, 7),
      message: c.commit.message,
      date: c.commit.author.date,
      url: c.html_url,
      author: c.commit.author.name
    }));

    return NextResponse.json({
      totalCommits,
      recentCommits
    });
  } catch (error: any) {
    console.error('Error fetching GitHub stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch GitHub stats', details: error.message },
      { status: 500 }
    );
  }
}
