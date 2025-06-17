import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Activity, History } from "lucide-react";

export default function RecentActions() {
  return (
    <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium font-headline text-accent-foreground">Recent Actions</CardTitle>
        <History className="h-6 w-6 text-accent-foreground" />
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li className="flex items-center">
            <Activity className="h-4 w-4 mr-2 text-primary" /> Profile updated successfully.
          </li>
          <li className="flex items-center">
            <Activity className="h-4 w-4 mr-2 text-primary" /> Document 'Hygiene Plan 2024' downloaded.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground mt-2">
          View your recent activity. (Full feature coming soon)
        </p>
      </CardContent>
    </Card>
  );
}
