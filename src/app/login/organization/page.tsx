import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, KeyRound, Shield } from 'lucide-react';
import Link from 'next/link';

export default function OrganizationLoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-semibold">CivicConnect</span>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Organization Login</CardTitle>
          <CardDescription>
            Access for Department & Control Room personnel.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
             <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="email" type="email" placeholder="Official Email" className="pl-10" />
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input id="password" type="password" placeholder="Password" className="pl-10" />
          </div>
           <div className="flex items-center justify-end">
            <Button variant="link" className="px-0">
              Forgot Password?
            </Button>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          {/* In a real app, you'd check credentials and route to the correct dashboard */}
          <Button className="w-full" asChild>
            <Link href="/dashboard/department">Login as Department</Link>
          </Button>
          <Button variant="outline" className="w-full" asChild>
             <Link href="/dashboard/control-room">Login as Control Room</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
