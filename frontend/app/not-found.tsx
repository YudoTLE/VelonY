'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

export default function NotFoundPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <Card className="w-[340px] p-6 text-center shadow-sm">
        <CardHeader className="flex flex-col items-center space-y-3">
          <AlertTriangle className="h-10 w-10 text-destructive" />
          <CardTitle className="text-lg font-semibold">404 – Page Not Found</CardTitle>
        </CardHeader>

        <CardContent className="text-sm text-muted-foreground">
          The page you’re looking for doesn’t exist.
        </CardContent>

        <CardFooter className="flex justify-center">
          <Button variant="default" onClick={() => router.push('/')}>
            Go back home
          </Button>
        </CardFooter>
      </Card>
    </main>
  );
}
