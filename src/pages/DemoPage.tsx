import { AppLayout } from '@/components/layout/AppLayout';
export function DemoPage() {
  return (
    <AppLayout container>
      <div className="text-center">
        <h1 className="text-4xl font-bold">Demo Page</h1>
        <p className="mt-4 text-muted-foreground">
          This page can be used for internal tools or demonstrations.
        </p>
      </div>
    </AppLayout>
  );
}