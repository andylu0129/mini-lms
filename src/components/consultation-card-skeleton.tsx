import { Card, CardContent } from '@/lib/shadcn/components/ui/card';
import { Skeleton } from '@/lib/shadcn/components/ui/skeleton';

export function ConsultationCardSkeleton() {
  return (
    <Card className="border-border bg-card">
      <CardContent className="p-4 sm:p-5">
        <div className="flex flex-col gap-3">
          <div className="flex items-start gap-3">
            {/* Icon placeholder */}
            <Skeleton className="h-5 w-5 shrink-0 rounded-full" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              {/* Title and badge row */}
              <div className="flex items-start gap-2">
                <Skeleton className="h-5 w-48 flex-1" />
                <Skeleton className="h-5 w-16 shrink-0 rounded-full" />
              </div>
              {/* Date and time row */}
              <div className="flex items-center gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-16" />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
