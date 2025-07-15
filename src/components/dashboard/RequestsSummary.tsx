import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ListChecks, Clock } from "lucide-react";

export default function RequestsSummary() {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium font-headline text-primary">Pending Requests</CardTitle>
        <ListChecks className="h-6 w-6 text-primary" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">3</div>
        <CardDescription className="text-xs text-muted-foreground">
          +2 from last week
        </CardDescription>
        <p className="text-sm text-muted-foreground mt-2">
          Manage your pending requests here. (Feature coming soon)
        </p>
      </CardContent>
    </Card>
  );
}
