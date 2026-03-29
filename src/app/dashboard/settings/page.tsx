"use client";

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, User, Building, Shield } from 'lucide-react';
import { Switch } from '@/components/ui/switch';

// In a real app, this would come from a user session/context
const citizenUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    avatar: "https://picsum.photos/seed/avatar/100/100"
};

const departmentUser = {
    name: "Public Works Department",
    email: "public.works@example.gov",
    avatar: ""
};

const controlRoomUser = {
    name: "City Control Room",
    email: "control.room@example.gov",
    avatar: ""
};

const getRoleFromPathname = (pathname: string) => {
    if (pathname.startsWith('/dashboard/department')) return 'department';
    if (pathname.startsWith('/dashboard/control-room')) return 'control-room';
    return 'citizen';
}

const getUserForRole = (role: string) => {
    switch (role) {
        case 'department': return departmentUser;
        case 'control-room': return controlRoomUser;
        default: return citizenUser;
    }
}

export default function SettingsPage() {
    const pathname = usePathname();
    const role = getRoleFromPathname(pathname);
    const initialUser = getUserForRole(role);

    const [user, setUser] = useState(initialUser);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(initialUser.avatar);
    const { toast } = useToast();

    useEffect(() => {
        const currentUser = getUserForRole(getRoleFromPathname(pathname));
        setUser(currentUser);
        setAvatarPreview(currentUser.avatar);
    }, [pathname]);


    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveChanges = () => {
        // In a real app, you would call an API to save the user data
        const updatedUser = { ...user, avatar: avatarPreview || user.avatar };
        setUser(updatedUser);
        console.log("Saving user data:", updatedUser);
        toast({
            title: "Profile Updated",
            description: "Your profile information has been successfully saved.",
        });
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <div className="space-y-2">
                <h1 className="text-3xl font-headline font-bold">Settings</h1>
                <p className="text-muted-foreground">
                    Manage your account settings and profile information.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>
                        {role === 'citizen' && 'Profile'}
                        {role === 'department' && 'Department Profile'}
                        {role === 'control-room' && 'Control Room Profile'}
                    </CardTitle>
                    <CardDescription>Update your details and profile picture.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center gap-6">
                         <div className="relative">
                            <Avatar className="h-24 w-24 border">
                                <AvatarImage src={avatarPreview || ''} alt={user.name} />
                                <AvatarFallback>
                                    {role === 'citizen' && (user.name ? user.name.charAt(0) : <User className="h-10 w-10"/>)}
                                    {role === 'department' && <Building className="h-10 w-10"/>}
                                    {role === 'control-room' && <Shield className="h-10 w-10"/>}
                                </AvatarFallback>
                            </Avatar>
                            <Button asChild size="icon" className="absolute -bottom-2 -right-2 rounded-full h-8 w-8 cursor-pointer">
                                <label htmlFor="avatar-upload">
                                    <Upload className="h-4 w-4" />
                                    <span className="sr-only">Upload</span>
                                    <input id="avatar-upload" type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} />
                                </label>
                            </Button>
                        </div>
                        <div className="grid gap-1.5">
                            <h2 className="text-xl font-semibold">{user.name}</h2>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            {role === 'citizen' && 'Full Name'}
                            {role === 'department' && 'Department Name'}
                            {role === 'control-room' && 'Team Name'}
                        </Label>
                        <Input 
                            id="name" 
                            value={user.name} 
                            onChange={(e) => setUser(prev => ({ ...prev, name: e.target.value }))} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={user.email} 
                            onChange={(e) => setUser(prev => ({ ...prev, email: e.target.value }))} 
                        />
                    </div>

                     <Button onClick={handleSaveChanges}>Save Changes</Button>
                </CardContent>
            </Card>

            {['department', 'control-room'].includes(role) && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notification Settings</CardTitle>
                        <CardDescription>Manage how you receive notifications.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg border p-4">
                            <div className="space-y-0.5">
                                <Label htmlFor="email-notifications" className="text-base font-medium">Email Notifications</Label>
                                <p className="text-sm text-muted-foreground">
                                    {role === 'department' 
                                        ? 'Receive an email for new complaint assignments and status updates.'
                                        : 'Receive an email for system-wide alerts and critical escalations.'
                                    }
                                </p>
                            </div>
                            <Switch id="email-notifications" defaultChecked />
                        </div>
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>Security</CardTitle>
                    <CardDescription>Change your password.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="current-password">Current Password</Label>
                        <Input id="current-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="new-password">New Password</Label>
                        <Input id="new-password" type="password" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="confirm-password">Confirm New Password</Label>
                        <Input id="confirm-password" type="password" />
                    </div>
                    <Button>Update Password</Button>
                </CardContent>
            </Card>
        </div>
    );
}
