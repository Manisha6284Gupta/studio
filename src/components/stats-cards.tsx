import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertTriangle, Send } from 'lucide-react';

interface Stats {
  total: number;
  resolved: number;
  pending: number;
  overdue: number;
  escalated?: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export function StatsCards({ stats }: StatsCardsProps) {
  const statItems = [
    { title: 'Total Complaints', value: stats.total, icon: FileText, color: 'text-primary' },
    { title: 'Resolved', value: stats.resolved, icon: CheckCircle, color: 'text-success' },
    { title: 'Pending', value: stats.pending, icon: Clock, color: 'text-warning' },
    { title: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-destructive' },
  ];

  if (stats.escalated !== undefined) {
    statItems.push({ title: 'Escalated', value: stats.escalated, icon: Send, color: 'text-amber-500' });
  }

  return (
    <div className={`grid gap-4 md:grid-cols-2 ${stats.escalated !== undefined ? 'lg:grid-cols-5' : 'lg:grid-cols-4'}`}>
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent className="p-4 pt-0">
            <div className="text-xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              {/* You can add comparison logic here */}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
