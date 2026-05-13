import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../shared/ui/card';

export function DashboardPage() {
  return (
    <main className="grid gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Dashboard</CardTitle>
          <CardDescription>
            Quick entry point for your CRM workspace.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Use the sidebar to navigate between clients, notes and the activity log.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
