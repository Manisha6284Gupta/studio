'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { useAuth, useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc } from 'firebase/firestore';
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
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Mail, KeyRound, Shield, Loader2, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(1, { message: "Password is required." }),
});

type LoginFormValues = z.infer<typeof formSchema>;

export default function CitizenLoginPage() {
  const [isFormLoading, setIsFormLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const auth = useAuth();
  const { user, isUserLoading } = useUser();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  // If user is already logged in, redirect them to the dashboard.
  useEffect(() => {
    if (!isUserLoading && user) {
        router.replace('/dashboard/citizen');
    }
  }, [isUserLoading, user, router]);

  const onLoginSubmit = (data: LoginFormValues) => {
    setIsFormLoading(true);
    signInWithEmailAndPassword(auth, data.email, data.password)
      .then(() => {
        router.push('/dashboard/citizen');
      })
      .catch((error) => {
        let errorMessage = "An unknown error occurred during login.";
        if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
          errorMessage = "Invalid email or password. Please try again.";
        }
        toast({
          variant: "destructive",
          title: "Login Failed",
          description: errorMessage,
        });
        setIsFormLoading(false);
      });
  };

  // While checking auth or if user is logged in, show a loading screen before redirect.
  if (isUserLoading || user) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
            <div className="absolute top-8 left-8">
                <Link href="/" className="flex items-center gap-2 text-foreground">
                <Shield className="h-6 w-6 text-primary" />
                <span className="font-headline text-xl font-semibold">JanSevaConnect</span>
                </Link>
            </div>
            <Card className="w-full max-w-md shadow-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="font-headline text-2xl">Citizen Login</CardTitle>
                    <CardDescription>
                        Access your dashboard to submit and track complaints.
                    </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Checking authentication...</p>
                </CardContent>
            </Card>
        </div>
      )
  }

  // Only render the login form if the user is not authenticated.
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
       <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-semibold">JanSevaConnect</span>
        </Link>
      </div>
      <Card className="w-full max-w-md shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Citizen Login</CardTitle>
          <CardDescription>
            Access your dashboard to submit and track complaints.
          </CardDescription>
        </CardHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onLoginSubmit)}>
            <CardContent className="space-y-6">
                <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                    <FormItem>
                    <Label htmlFor="email">Email or Phone</Label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="email" type="email" placeholder="john.doe@example.com" className="pl-10" {...field} />
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input id="password" type={showPassword ? "text" : "password"} placeholder="••••••••" className="pl-10 pr-10" {...field} />
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-muted-foreground hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </Button>
                    </div>
                    <FormMessage />
                    </FormItem>
                )}
                />
                <div className="flex items-center justify-between">
                <Button variant="link" className="px-0">
                    Login with OTP
                </Button>
                <Button variant="link" className="px-0">
                    Forgot Password?
                </Button>
                </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isFormLoading}>
                {isFormLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
                </Button>
                <div className="text-center text-sm text-muted-foreground">
                Don&apos;t have an account?{' '}
                <Link href="/register/citizen" className="font-semibold text-primary underline-offset-4 hover:underline">
                    Register
                </Link>
                </div>
            </CardFooter>
            </form>
        </Form>
      </Card>
    </div>
  );
}
