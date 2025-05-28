
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  className?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  value,
  icon,
  description,
  className,
  trend,
  trendValue,
}) => {
  return (
    <Card className={cn("overflow-hidden transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
        {trend && trendValue && (
          <div className="flex items-center mt-2">
            <div
              className={cn(
                "text-xs font-medium flex items-center rounded-full px-2 py-0.5",
                trend === 'up' && "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100",
                trend === 'down' && "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100",
                trend === 'neutral' && "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
              )}
            >
              {trend === 'up' && "↑ "}
              {trend === 'down' && "↓ "}
              {trendValue}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardCard;
