"use client";

import { useEffect, useState, useMemo } from "react";
import { collection, query, where, limit, getDocs, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Activity, Clock, FileText, Bot, MessageCircle, GraduationCap, ShieldAlert, TrendingUp, DollarSign, Zap, Boxes, Download, FileJson, FileSpreadsheet, ExternalLink, Printer } from "lucide-react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  ResponsiveContainer, 
  Tooltip, 
  AreaChart, 
  Area, 
  LineChart, 
  Line 
} from "recharts";

interface UsageEntry {
  id: string;
  type: string;
  inputTokens: number;
  outputTokens: number;
  costCents: number;
  timestamp: Date;
}

interface DailyUsage {
  date: string;
  totalCost: number;
  queries: number;
  input: number;
  output: number;
}

export function UsageAnalytics({ organizationId }: { organizationId: string | null }) {
  const [usage, setUsage] = useState<UsageEntry[]>([]);
  const [dailyData, setDailyData] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!organizationId) return;
    setError(null);
    setLoading(true);

    const q = query(
      collection(db, "usage_analytics"),
      where("organizationId", "==", organizationId),
      orderBy("timestamp", "desc"),
      limit(250) // Detailed overview of recent history
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as UsageEntry[];
      
      setUsage(entries);

      // Process for chart (last 7-14 days grouping)
      const dailyMap = new Map<string, DailyUsage>();
      entries.forEach(entry => {
        const d = entry.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' });
        const existing = dailyMap.get(d) || { date: d, totalCost: 0, queries: 0, input: 0, output: 0 };
        existing.totalCost += entry.costCents / 100; // Store in dollars for chart ease
        existing.queries += 1;
        existing.input += entry.inputTokens;
        existing.output += entry.outputTokens;
        dailyMap.set(d, existing);
      });

      // Sort chronological
      const sortedDaily = Array.from(dailyMap.values()).reverse();
      setDailyData(sortedDaily);
      
      setLoading(false);
    }, (err) => {
      console.error("Firestore error in UsageAnalytics:", err);
      if (err.message.includes("index")) {
        setError("Index Deployment Required. Run: firebase deploy --only firestore:indexes");
      } else {
        setError("Failed to load analytics: " + err.message);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [organizationId]);

  const stats = useMemo(() => {
    const totalCostCents = usage.reduce((acc, curr) => acc + (curr.costCents || 0), 0);
    const totalQueries = usage.length;
    const totalTokens = usage.reduce((acc, curr) => acc + (curr.inputTokens || 0) + (curr.outputTokens || 0), 0);
    
    return {
      totalCost: (totalCostCents / 100).toFixed(4),
      totalQueries,
      totalTokens: (totalTokens / 1000).toFixed(1) + "k"
    };
  }, [usage]);

  const getTypeIcon = (type: string) => {
    switch(type) {
      case "navigation": return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "tutor": return <Bot className="h-4 w-4 text-purple-500" />;
      case "grading": return <GraduationCap className="h-4 w-4 text-emerald-500" />;
      case "sandbox": return <Boxes className="h-4 w-4 text-indigo-500" />;
      case "parsing": return <FileText className="h-4 w-4 text-amber-500" />;
      case "security": return <ShieldAlert className="h-4 w-4 text-rose-500" />;
      default: return <Activity className="h-4 w-4 text-zinc-500" />;
    }
  };

  const exportData = (format: 'csv' | 'json') => {
    if (usage.length === 0) return;
    
    let content = "";
    let mimeType = "";
    let extension = "";

    if (format === 'csv') {
      const headers = ["ID", "Type", "Input Tokens", "Output Tokens", "Cost (USD)", "Timestamp"];
      const rows = usage.map(u => [
        u.id, 
        u.type, 
        u.inputTokens, 
        u.outputTokens, 
        (u.costCents / 100).toFixed(6), 
        u.timestamp.toISOString()
      ].join(","));
      content = [headers.join(","), ...rows].join("\n");
      mimeType = "text/csv";
      extension = "csv";
    } else {
      content = JSON.stringify(usage, null, 2);
      mimeType = "application/json";
      extension = "json";
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `usage-report-${organizationId?.slice(0, 8)}-${new Date().toISOString().split('T')[0]}.${extension}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const chartConfig = {
    totalCost: {
      label: "Cost (USD)",
      color: "#a855f7", // purple-500
    },
    queries: {
      label: "Interactions",
      color: "#3b82f6", // blue-500
    }
  };

  if (loading) {
    return (
      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="h-6 w-32 bg-zinc-200 dark:bg-zinc-800 animate-pulse rounded" />
        </CardHeader>
        <CardContent className="h-64 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { label: "Estimated Spend", val: `$${stats.totalCost}`, icon: DollarSign, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "AI Interactions", val: stats.totalQueries, icon: Activity, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Token Volume", val: stats.totalTokens, icon: Zap, color: "text-blue-500", bg: "bg-blue-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="bg-card/50 backdrop-blur-sm border-border/40">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</CardTitle>
              <div className={`p-1.5 rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-3.5 w-3.5 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold font-mono">{stat.val}</div>
              <p className="text-[10px] text-muted-foreground mt-0.5 mt-1">Last 250 events</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-purple-400" />
                Interactions & Cost Trend
              </CardTitle>
              <CardDescription className="text-xs">
                AI engagement grouped by calendar date.
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[10px] px-2 py-0 border-purple-500/30 text-purple-400 bg-purple-500/5">
              Live
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {dailyData.length > 0 ? (
            <div className="h-[250px] w-full">
              <ChartContainer config={chartConfig}>
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a855f7" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorQueries" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-muted/30" stroke="#888888" />
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: "#888888", fontSize: 10 }}
                    minTickGap={20}
                  />
                  <YAxis 
                    hide 
                  />
                  <ChartTooltip />
                  <Area 
                    type="monotone" 
                    dataKey="totalCost" 
                    stroke="#a855f7" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCost)" 
                    name="totalCost"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="queries" 
                    stroke="#3b82f6" 
                    strokeWidth={1}
                    fillOpacity={1} 
                    fill="url(#colorQueries)" 
                    name="queries"
                  />
                </AreaChart>
              </ChartContainer>
            </div>
          ) : (
            <div className="h-[250px] flex items-center justify-center text-muted-foreground text-sm">
              No recent usage history recorded.
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-border/50 bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Activity className="h-4 w-4 text-purple-500" />
                AI Interaction Detail
              </CardTitle>
              <CardDescription className="text-[10px]">
                Displaying the last 250 organizational usage events.
              </CardDescription>
            </div>
            
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-wider gap-2 cursor-pointer">
                  <ExternalLink className="h-3 w-3" />
                  Full Report & Export
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col">
                <DialogHeader className="flex flex-row items-center justify-between space-y-0 pr-6">
                  <div>
                    <DialogTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      Usage Audit Trail
                    </DialogTitle>
                    <DialogDescription className="text-xs">
                      Comprehensive log of all AI interactions in this network.
                    </DialogDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="gap-2 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 font-bold text-xs h-9 cursor-pointer">
                        <Download className="h-4 w-4" />
                        Export Data
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => exportData('csv')} className="gap-2 cursor-pointer">
                        <FileSpreadsheet className="h-4 w-4 text-emerald-500" />
                        <span>Export as CSV (.csv)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportData('json')} className="gap-2 cursor-pointer">
                        <FileJson className="h-4 w-4 text-amber-500" />
                        <span>Export as JSON (.json)</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.print()} className="gap-2 cursor-pointer border-t mt-1">
                        <Printer className="h-4 w-4 text-zinc-500" />
                        <span>Print Report</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </DialogHeader>

                <div className="flex-1 overflow-auto mt-4 border rounded-xl">
                  <Table>
                    <TableHeader className="bg-muted/50 sticky top-0 z-20 backdrop-blur-md">
                      <TableRow>
                        <TableHead className="text-[11px] uppercase font-bold">Event Type</TableHead>
                        <TableHead className="text-[11px] uppercase font-bold text-center">Input</TableHead>
                        <TableHead className="text-[11px] uppercase font-bold text-center">Output</TableHead>
                        <TableHead className="text-[11px] uppercase font-bold font-mono">Total Cost</TableHead>
                        <TableHead className="text-right text-[11px] uppercase font-bold">Timestamp</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {usage.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {getTypeIcon(entry.type)}
                              <span className="text-xs font-semibold capitalize">
                                {entry.type}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                            {entry.inputTokens.toLocaleString()} tx
                          </TableCell>
                          <TableCell className="text-center text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                            {entry.outputTokens.toLocaleString()} tx
                          </TableCell>
                          <TableCell>
                            <span className="text-[11px] font-mono font-black text-emerald-500">
                              ${(entry.costCents / 100).toFixed(6)}
                            </span>
                          </TableCell>
                          <TableCell className="text-right text-[10px] font-medium text-muted-foreground">
                            {entry.timestamp.toLocaleDateString()} at {entry.timestamp.toLocaleTimeString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="max-h-[500px] overflow-auto pt-0">
          {usage.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No activities yet.</div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/10 sticky top-0 z-10 backdrop-blur-md">
                <TableRow>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Type</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Tokens</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground font-mono">Cost</TableHead>
                  <TableHead className="text-right text-[10px] uppercase font-bold text-muted-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usage.map((entry) => (
                  <TableRow key={entry.id} className="border-border/20">
                    <TableCell className="py-2">
                      <div className="flex items-center gap-2">
                        {getTypeIcon(entry.type)}
                        <span className="text-[11px] font-medium capitalize">
                          {entry.type}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="text-[10px] font-mono text-muted-foreground">
                        {((entry.inputTokens + entry.outputTokens) / 1000).toFixed(1)}k
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        ${(entry.costCents / 100).toFixed(6)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right py-2">
                      <span className="text-[10px] text-muted-foreground font-medium">
                        {entry.timestamp.toLocaleDateString([], { month: 'short', day: 'numeric' })} at {entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
