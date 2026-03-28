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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { User, Mail, Phone, KeyRound, Shield, Venus, Mars, Transgender } from 'lucide-react';
import Link from 'next/link';

export default function CitizenRegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-secondary p-4">
      <div className="absolute top-8 left-8">
        <Link href="/" className="flex items-center gap-2 text-foreground">
          <Shield className="h-6 w-6 text-primary" />
          <span className="font-headline text-xl font-semibold">CivicConnect</span>
        </Link>
      </div>
      <Card className="w-full max-w-lg shadow-2xl">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-2xl">Create Your Account</CardTitle>
          <CardDescription>
            Join CivicConnect to help improve your community.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-6">
          <div className="space-y-2">
            <Label htmlFor="fullname">Full Name</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="fullname" placeholder="John Doe" className="pl-10" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Gender</Label>
            <Select>
              <SelectTrigger className="pl-10">
                 <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground flex items-center">
                   <Venus className="h-4 w-4" /><Mars className="h-4 w-4" />
                 </div>
                <SelectValue placeholder="Select Gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" className="pl-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="email" type="email" placeholder="john.doe@example.com" className="pl-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="password" type="password" placeholder="••••••••" className="pl-10" />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirm Password</Label>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input id="confirm-password" type="password" placeholder="••••••••" className="pl-10" />
            </div>
          </div>

        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button className="w-full">Register</Button>
          <div className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login/citizen" className="font-semibold text-primary underline-offset-4 hover:underline">
              Login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
