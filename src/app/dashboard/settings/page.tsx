"use client";

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, User as UserIcon, Building, Shield, Loader2 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useUser, useDoc, useFirestore, useMemoFirebase, errorEmitter } from '@/firebase';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { FirestorePermissionError } from '@/firebase/errors';
import { Skeleton } from '@/components/ui/skeleton';

const getRoleFromPathname = (pathname: string) => {
    if (pathname.startsWith('/dashboard/department')) return 'department';
    if (pathname.startsWith('/dashboard/control-room')) return 'control-room';
    return 'citizen';
}

const SettingsSkeleton = () => (
    <div className="space-y-8 max-w-2xl mx-auto">
        <div className="space-y-2">
            <Skeleton className="h-9 w-32" />
            <Skeleton className="h-5 w-72" />
        </div>
        <Card>
            <CardHeader>
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                    <Skeleton className="h-24 w-24 rounded-full" />
                    <div className="grid gap-2">
                        <Skeleton className="h-6 w-40" />
                        <Skeleton className="h-4 w-52" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-10 w-32" />
            </CardContent>
        </Card>
    </div>
);


export default function SettingsPage() {
    const pathname = usePathname();
    const router = useRouter();
    const { toast } = useToast();
    const { user, isUserLoading } = useUser();
    const firestore = useFirestore();
    const role = getRoleFromPathname(pathname);

    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const profileCollection = role === 'citizen' ? 'citizens' : 'staff';

    const userProfileRef = useMemoFirebase(() => {
        if (!user) return null;
        return doc(firestore, profileCollection, user.uid);
    }, [firestore, user, profileCollection]);

    const { data: userProfile, isLoading: isProfileLoading } = useDoc<{fullName: string, email: string, avatar?: string}>(userProfileRef);

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.fullName || '');
            setEmail(userProfile.email || '');
            setAvatarPreview(userProfile.avatar || null);
        } else if (user && !isProfileLoading) {
            // Fallback to auth data if profile doc is missing
            setName(user.displayName || '');
            setEmail(user.email || '');
        }
    }, [userProfile, user, isProfileLoading]);

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
        if (!userProfileRef) return;
        
        setIsSaving(true);
        const updatedData: Record<string, any> = {
            fullName: name,
            email: email,
            updatedAt: serverTimestamp(),
        };

        if (avatarPreview) {
            updatedData.avatar = avatarPreview;
        }

        updateDoc(userProfileRef, updatedData)
            .then(() => {
                toast({
                    title: "Profile Updated",
                    description: "Your profile information has been successfully saved.",
                });
            })
            .catch(error => {
                 const permissionError = new FirestorePermissionError({
                    path: userProfileRef.path,
                    operation: 'update',
                    requestResourceData: updatedData,
                });
                errorEmitter.emit('permission-error', permissionError);
                if (error.code !== 'permission-denied') {
                     toast({
                        variant: "destructive",
                        title: "Update Failed",
                        description: error.message || "An unexpected error occurred.",
                    });
                }
            })
            .finally(() => {
                setIsSaving(false);
            });
    };

    const isLoading = isUserLoading || (user && isProfileLoading);
    if (isLoading) return <SettingsSkeleton />;

    if (!user) {
        // This shouldn't happen if routes are protected, but as a fallback
        router.push('/');
        return <SettingsSkeleton />;
    }
    
    let fallbackIcon = <UserIcon className="h-10 w-10"/>;
    if (role === 'department') fallbackIcon = <Building className="h-10 w-10"/>;
    if (role === 'control-room') fallbackIcon = <Shield className="h-10 w-10"/>;

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
                                <AvatarImage src={avatarPreview || ''} alt={name} />
                                <AvatarFallback>
                                    {name ? name.charAt(0).toUpperCase() : fallbackIcon}
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
                            <h2 className="text-xl font-semibold">{name}</h2>
                            <p className="text-sm text-muted-foreground">{email}</p>
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
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                            id="email" 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                        />
                    </div>

                     <Button onClick={handleSaveChanges} disabled={isSaving}>
                        {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Save Changes
                     </Button>
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
