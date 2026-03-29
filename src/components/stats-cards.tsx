import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText, CheckCircle, Clock, AlertTriangle } from 'lucide-react';

interface Stats {
  total: number;
  resolved: number;
  pending: number;
  overdue: number;
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

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {statItems.map((item) => (
        <Card key={item.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
            <item.icon className={`h-4 w-4 ${item.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{item.value}</div>
            <p className="text-xs text-muted-foreground">
              {/* You can add comparison logic here */}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
