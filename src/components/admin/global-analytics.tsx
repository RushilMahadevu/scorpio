"use client";

import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UsageAnalytics } from "./usage-analytics";
import { AICostCalculator } from "./ai-cost-calculator";
import CostComparisonChart from "./cost-comparison-chart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Calculator, PieChart, Users, Globe } from "lucide-react";
import { motion } from "framer-motion";

export function GlobalAnalytics() {
  const [organizations, setOrganizations] = useState<{ id: string; name: string }[]>([]);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("global");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOrgs() {
      try {
        const q = query(collection(db, "organizations"), orderBy("name", "asc"));
        const snapshot = await getDocs(q);
        const orgs = snapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data().name || doc.id
        }));
        setOrganizations(orgs);
      } catch (err) {
        console.error("Error fetching organizations:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrgs();
  }, []);

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-black tracking-tighter">Analytics & Insights</h2>
          <p className="text-muted-foreground">Monitor platform-wide usage, costs, and performance.</p>
        </div>
        
        <div className="flex items-center gap-3 bg-secondary/30 p-2 rounded-xl border border-border/40">
          <Globe className="h-4 w-4 text-muted-foreground ml-2" />
          <Select value={selectedOrgId} onValueChange={setSelectedOrgId}>
            <SelectTrigger className="w-[240px] bg-background border-none shadow-none focus:ring-0">
              <SelectValue placeholder="Select Organization" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="global">Global View (All)</SelectItem>
              {organizations.map((org) => (
                <SelectItem key={org.id} value={org.id}>
                  {org.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="usage" className="space-y-6">
        <TabsList className="bg-secondary/20 p-1 border border-border/40 rounded-xl">
          <TabsTrigger value="usage" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <BarChart3 className="h-4 w-4" />
            Usage Telemetry
          </TabsTrigger>
          <TabsTrigger value="calculator" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <Calculator className="h-4 w-4" />
            Cost Estimator
          </TabsTrigger>
          <TabsTrigger value="comparison" className="rounded-lg gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm">
            <PieChart className="h-4 w-4" />
            Market Comparison
          </TabsTrigger>
        </TabsList>

        <TabsContent value="usage" className="space-y-6 outline-none">
          <UsageAnalytics organizationId={selectedOrgId === "global" ? null : selectedOrgId} />
        </TabsContent>

        <TabsContent value="calculator" className="outline-none">
          <div className="max-w-4xl mx-auto">
            <AICostCalculator />
          </div>
        </TabsContent>

        <TabsContent value="comparison" className="outline-none">
           <div className="max-w-5xl mx-auto">
             <CostComparisonChart />
           </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
