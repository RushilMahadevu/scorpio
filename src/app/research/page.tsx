"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  runComprehensiveStudy, 
  aggregateByConstraintLevel, 
  aggregateByDifficulty,
  exportToCSV,
  generateComprehensiveLatexTables,
  estimateStudyCost
} from "@/lib/gemini";

export default function ResearchPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if already authenticated in this session
    if (typeof window !== "undefined") {
      const authed = localStorage.getItem("scorpio_research_authed");
      if (authed === "true") setIsAuthenticated(true);
    }
  }, []);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_RESEARCH_PASSWORD;
    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        localStorage.setItem("scorpio_research_authed", "true");
      }
    } else {
      setError("Incorrect password. Please try again.");
    }
  };

  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState("");
  const [currentCall, setCurrentCall] = useState(0);
  const [totalCalls, setTotalCalls] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [results, setResults] = useState<any>(null);
  const [csvData, setCsvData] = useState<string>("");
  const [latexTables, setLatexTables] = useState<string>("");

  const runFullStudy = async () => {
    setIsRunning(true);
    setProgress("Initializing comprehensive study...");
    
    try {
      const studyResults = await runComprehensiveStudy(
        (current, total, status, timeLeft) => {
          setCurrentCall(current);
          setTotalCalls(total);
          setProgress(status);
          setTimeRemaining(timeLeft);
        }
      );
      
      setProgress("Analyzing results...");
      
      const constraintMetrics = aggregateByConstraintLevel(studyResults);
      const difficultyMetrics = aggregateByDifficulty(studyResults);
      
      const csv = exportToCSV(studyResults);
      const latex = generateComprehensiveLatexTables(constraintMetrics, difficultyMetrics);
      
      setResults({
        raw: studyResults,
        constraintMetrics,
        difficultyMetrics
      });
      setCsvData(csv);
      setLatexTables(latex);
      
      setProgress(`✅ Study complete! Collected ${studyResults.length} responses across all constraint levels.`);
    } catch (error) {
      console.error("Error running study:", error);
      setProgress(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsRunning(false);
    }
  };

  const downloadCSV = () => {
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scorpio_research_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const copyLatex = () => {
    navigator.clipboard.writeText(latexTables);
    alert("LaTeX tables copied to clipboard!");
  };

  const estimate = estimateStudyCost();

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <form onSubmit={handlePasswordSubmit} className="space-y-4 p-8 border rounded shadow bg-background">
          <h2 className="text-2xl font-bold mb-2">Research Access</h2>
          <p className="text-muted-foreground mb-4">Enter the research password to continue.</p>
          <input
            type="password"
            className="input input-bordered w-full"
            placeholder="Password"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
            required
          />
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <button type="submit" className="btn btn-primary w-full">Unlock</button>
        </form>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-4xl font-bold mb-2">Scorpio Research Lab</h1>
      <p className="text-muted-foreground mb-8">
        Comprehensive ablation study on constraint-based AI tutoring effectiveness
      </p>

      {/* Study Info Card */}
      <Card className="mb-8 border-2 border-primary">
        <CardHeader>
          <CardTitle className="text-2xl">Full Constraint Effectiveness Study</CardTitle>
          <CardDescription>
            Complete research battery: 28 questions × 5 constraint levels = 140 responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Total API Calls</p>
              <p className="text-3xl font-bold">{estimate.totalCalls}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Estimated Time</p>
              <p className="text-3xl font-bold">{estimate.estimatedTimeHours}h</p>
              <p className="text-xs text-muted-foreground">1 minute per call</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Est. Tokens</p>
              <p className="text-3xl font-bold">{Math.round(estimate.estimatedTokens / 1000)}K</p>
            </div>
          </div>

          <Alert>
            <AlertDescription>
              <strong>⏱️ Time Commitment:</strong> This study takes {estimate.estimatedTimeHours} hours to complete (1-minute delays between calls).
              You can close this tab and come back later - progress is saved.
            </AlertDescription>
          </Alert>

          <div className="pt-4">
            <Button 
              onClick={runFullStudy} 
              disabled={isRunning}
              size="lg"
              className="w-full text-lg h-14"
            >
              {isRunning ? "Study Running..." : "🚀 Start Comprehensive Study"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* What Gets Tested Card */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Study Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Question Types</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ Declarative knowledge (8 questions)</li>
                <li>✓ Problem-solving (12 questions)</li>
                <li>✓ Conceptual reasoning (5 questions)</li>
                <li>✓ Adversarial attacks (4 questions)</li>
                <li>✓ Off-topic tests (3 questions)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Difficulty Levels</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ Basic (high school) - 8 questions</li>
                <li>✓ Intermediate (AP Physics) - 10 questions</li>
                <li>✓ Advanced (challenging AP) - 6 questions</li>
                <li>✓ College level - 4 questions</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Constraint Levels Tested</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ NONE (baseline)</li>
                <li>✓ DOMAIN_ONLY</li>
                <li>✓ DOMAIN_PEDAGOGY</li>
                <li>✓ DOMAIN_PEDAGOGY_NOTATION</li>
                <li>✓ FULL (all constraints)</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Metrics Collected</h3>
              <ul className="space-y-1 text-sm">
                <li>✓ On-topic rate</li>
                <li>✓ Direct answer rate</li>
                <li>✓ LaTeX usage</li>
                <li>✓ Pedagogical quality (1-5)</li>
                <li>✓ Physics term density</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Progress */}
      {progress && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Study Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">{progress}</p>
            {isRunning && (
              <div className="space-y-4">
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Response {currentCall} of {totalCalls}</span>
                  <span>{Math.round((currentCall / totalCalls) * 100)}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-3">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${(currentCall / totalCalls) * 100}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">⏱️ {timeRemaining}</span>
                  <span className="text-muted-foreground">
                    Next call in: ~60 seconds
                  </span>
                </div>
                <Alert>
                  <AlertDescription>
                    💡 <strong>Tip:</strong> You can safely close this tab. The study will continue in the background.
                    Your browser needs to stay open, but you can use other tabs.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {results && (
        <>
          {/* Constraint Level Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Results by Constraint Level</CardTitle>
              <CardDescription>
                Effectiveness of each constraint configuration across all 28 questions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Constraint Level</th>
                      <th className="text-right p-2">On-Topic %</th>
                      <th className="text-right p-2">Direct Answer %</th>
                      <th className="text-right p-2">LaTeX %</th>
                      <th className="text-right p-2">Avg Questions</th>
                      <th className="text-right p-2">Ped. Quality</th>
                      <th className="text-right p-2">Violations</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.constraintMetrics).map(([level, data]: [string, any]) => (
                      <tr key={level} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium">{level}</td>
                        <td className="text-right p-2">{data.onTopicRate.toFixed(1)}%</td>
                        <td className="text-right p-2">{data.directAnswerRate.toFixed(1)}%</td>
                        <td className="text-right p-2">{data.latexUsageRate.toFixed(1)}%</td>
                        <td className="text-right p-2">{data.avgQuestionCount.toFixed(2)}</td>
                        <td className="text-right p-2">{data.avgPedagogicalQuality.toFixed(2)}/5</td>
                        <td className="text-right p-2">{data.totalViolations}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Difficulty Metrics */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Results by Difficulty Level</CardTitle>
              <CardDescription>
                How the AI handles different complexity levels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Difficulty</th>
                      <th className="text-right p-2">Questions</th>
                      <th className="text-right p-2">Ped. Quality</th>
                      <th className="text-right p-2">Appropriate %</th>
                      <th className="text-right p-2">Avg Length</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(results.difficultyMetrics).map(([diff, data]: [string, any]) => (
                      <tr key={diff} className="border-b hover:bg-muted/50">
                        <td className="p-2 font-medium capitalize">{diff}</td>
                        <td className="text-right p-2">{data.totalQuestions}</td>
                        <td className="text-right p-2">{data.avgPedagogicalQuality.toFixed(2)}/5</td>
                        <td className="text-right p-2">{data.appropriateDifficultyRate.toFixed(1)}%</td>
                        <td className="text-right p-2">{data.avgResponseLength.toFixed(0)} chars</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Export Options */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Export Research Data</CardTitle>
              <CardDescription>
                Download results for analysis or copy LaTeX tables for your paper
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Button onClick={downloadCSV} className="w-full" size="lg">
                    📥 Download Full Dataset (CSV)
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Opens in Excel/Google Sheets for detailed analysis and manual coding
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Button onClick={copyLatex} variant="outline" className="w-full" size="lg">
                    📋 Copy LaTeX Tables
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Paste directly into your Overleaf paper
                  </p>
                </div>
              </div>

              <Alert>
                <AlertDescription>
                  <strong>📊 Next Steps:</strong>
                  <ol className="list-decimal list-inside mt-2 space-y-1">
                    <li>Download CSV and open in Excel/Sheets</li>
                    <li>Manually code 20-30 responses for qualitative analysis</li>
                    <li>Copy LaTeX tables into your paper's Results section</li>
                    <li>Write analysis interpreting the patterns you see</li>
                  </ol>
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>

          {/* Sample Responses */}
          <Card>
            <CardHeader>
              <CardTitle>Sample Responses (First 5)</CardTitle>
              <CardDescription>
                Preview of collected data - see full dataset in CSV export
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {results.raw.slice(0, 5).map((result: any, idx: number) => (
                  <div key={idx} className="border-l-4 border-primary pl-4 py-2 space-y-2">
                    <div>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {result.question.id}
                      </span>
                      <span className="ml-2 font-mono text-xs bg-primary/10 px-2 py-1 rounded">
                        {result.constraintLevel}
                      </span>
                    </div>
                    <p className="font-semibold">
                      {result.question.question}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Type: {result.question.type} • Difficulty: {result.question.difficulty}
                    </p>
                    <div className="bg-muted p-3 rounded text-sm">
                      {result.response.substring(0, 400)}
                      {result.response.length > 400 && "..."}
                    </div>
                    <div className="flex flex-wrap gap-3 text-xs">
                      <span className={result.metrics.onTopic ? "text-green-600" : "text-red-600"}>
                        {result.metrics.onTopic ? "✅" : "❌"} On-topic
                      </span>
                      <span className={result.metrics.usedLatex ? "text-green-600" : "text-yellow-600"}>
                        {result.metrics.usedLatex ? "✅" : "⚠️"} LaTeX
                      </span>
                      <span>Questions: {result.metrics.questionCount}</span>
                      <span>Quality: {result.metrics.pedagogicalQuality.toFixed(1)}/5</span>
                      <span>Length: {result.metrics.responseLength} chars</span>
                    </div>
                    {result.metrics.violations.length > 0 && (
                      <div className="text-xs text-red-600">
                        ⚠️ Violations: {result.metrics.violations.join(", ")}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}