"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface AssignmentStat {
  id: string;
  title: string;
  average: number;
  count: number;
}

export default function TeacherAnalyticsPage() {
  const [stats, setStats] = useState<AssignmentStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const assignmentsSnap = await getDocs(collection(db, "assignments"));
        const assignments = assignmentsSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));

        const results: AssignmentStat[] = [];

        for (const a of assignments) {
          const subsSnap = await getDocs(query(collection(db, "submissions"), where("assignmentId", "==", a.id)));
          const scores: number[] = [];
          subsSnap.forEach(s => {
            const data = s.data();
            if (data.score !== undefined && data.score !== null) scores.push(data.score);
          });
          const avg = scores.length > 0 ? Math.round(scores.reduce((s, x) => s + x, 0) / scores.length) : 0;
          results.push({ id: a.id, title: a.title || "Untitled", average: avg, count: scores.length });
        }

        setStats(results);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  if (loading) return <div>Loading analytics...</div>;

  const max = Math.max(...stats.map(s => s.average), 100);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Class Analytics</h1>
        <p className="text-muted-foreground">Overview of class performance</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Average Score by Assignment</CardTitle>
          <CardDescription>Shows average graded score per assignment</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stats.map((s) => (
              <div key={s.id} className="flex items-center gap-4">
                <div className="w-48">{s.title}</div>
                <div className="flex-1 bg-gray-100 rounded h-6">
                  <div className="bg-blue-600 h-6 rounded" style={{ width: `${(s.average / max) * 100}%` }} />
                </div>
                <div className="w-12 text-right font-medium">{s.average}%</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Next Steps</CardTitle>
          <CardDescription>Actions for teachers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Button onClick={() => alert('Exporting CSV for all assignments not yet implemented in bulk')}>
              Export All Grades (CSV)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
