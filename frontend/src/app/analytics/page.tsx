export default function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground mt-2">
          View detailed analytics and insights for your projects
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder content */}
        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Project Performance</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Analytics coming soon...
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Resource Utilization</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Analytics coming soon...
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h3 className="font-semibold">Budget Analysis</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Analytics coming soon...
          </p>
        </div>
      </div>
    </div>
  )
}
