import { LandingNav } from '@/components/landing-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, Shield, FileText, Users, Smile } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const features = [
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: 'Effortless Submission',
    description: 'Report issues quickly with our easy-to-use form, featuring voice-to-text and image uploads.',
    imageId: 'feature-1'
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Direct to Department',
    description: 'Our AI automatically directs your complaint to the right department, ensuring a faster response.',
    imageId: 'feature-2'
  },
  {
    icon: <Smile className="h-10 w-10 text-primary" />,
    title: 'Track to Resolution',
    description: 'Stay updated on your complaint status from submission to resolution through your personal dashboard.',
    imageId: 'feature-3'
  },
];

const howItWorks = [
    {
        step: 1,
        title: "Submit Your Complaint",
        description: "Use our simple web form to detail the issue. You can upload photos, add a description, and pinpoint the location on a map.",
    },
    {
        step: 2,
        title: "AI-Powered Routing",
        description: "Our intelligent system analyzes and categorizes your complaint, instantly assigning it to the correct city department for action.",
    },
    {
        step: 3,
        title: "Track and Get Notified",
        description: "Follow the progress of your complaint in real-time on your dashboard and receive notifications as its status changes, right up to resolution.",
    }
]

export default function Home() {
  const heroImage = PlaceHolderImages.find(p => p.id === 'hero-image-1');
  const ctaImage = PlaceHolderImages.find(p => p.id === 'cta-background');

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingNav />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative w-full h-[70vh] flex items-center justify-center text-center text-white">
            {heroImage && (
                 <Image
                    src={heroImage.imageUrl}
                    data-ai-hint={heroImage.imageHint}
                    alt="City Background"
                    layout="fill"
                    objectFit="cover"
                    className="z-0"
                />
            )}
            <div className="absolute inset-0 bg-black/50 z-10"></div>
            <div className="z-20 container px-4 md:px-6 space-y-6">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none">
                    Your Voice, Your City, Transformed.
                </h1>
                <p className="max-w-[700px] mx-auto text-lg md:text-xl text-gray-200">
                    CivicConnect is the modern platform for reporting civic issues, tracking their resolution, and fostering a stronger, more connected community.
                </p>
                <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/register/citizen">
                      Report an Issue
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                   <Button asChild size="lg" variant="secondary">
                    <Link href="/dashboard/citizen/complaints">
                      Track My Complaints
                    </Link>
                  </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-semibold">Key Features</div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                A Better Way to Engage with Your City
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Our platform is designed to make civic engagement seamless, transparent, and effective for everyone.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
              {features.map((feature) => {
                const featureImage = PlaceHolderImages.find(p => p.id === feature.imageId);
                return (
                    <Card key={feature.title} className="bg-card overflow-hidden h-full transform transition-transform duration-300 hover:-translate-y-2 hover:shadow-2xl">
                        {featureImage && (
                             <Image
                                src={featureImage.imageUrl}
                                data-ai-hint={featureImage.imageHint}
                                alt={feature.title}
                                width={500}
                                height={300}
                                className="object-cover w-full h-48"
                            />
                        )}
                        <CardHeader>
                            <div className="flex items-center gap-4">
                                {feature.icon}
                                <CardTitle className="font-headline text-xl">{feature.title}</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                        </CardContent>
                    </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-semibold">Simple Process</div>
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                        How It Works
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                       Resolving city issues in three simple steps.
                    </p>
                </div>
                <div className="relative grid gap-10 lg:grid-cols-3">
                    <div className="absolute left-0 top-1/2 w-full h-0.5 bg-border -translate-y-1/2 hidden lg:block"></div>
                     {howItWorks.map((step) => (
                        <div key={step.step} className="relative flex flex-col items-center text-center">
                            <div className="absolute top-0 -translate-y-1/2 bg-background p-2 hidden lg:block">
                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground border-4 border-background">
                                    {step.step}
                                </div>
                            </div>
                             <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground mb-4 lg:hidden">
                                {step.step}
                            </div>
                            <h3 className="font-headline text-xl font-bold mt-16">{step.title}</h3>
                            <p className="mt-2 max-w-xs text-muted-foreground">{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>


        {/* CTA Section */}
        <section className="w-full py-16 md:py-24 lg:py-32">
          <div className="container relative">
            {ctaImage && (
                <Image
                    src={ctaImage.imageUrl}
                    data-ai-hint={ctaImage.imageHint}
                    alt="City Sunset"
                    layout="fill"
                    objectFit="cover"
                    className="z-0 rounded-2xl"
                />
            )}
            <div className="absolute inset-0 bg-primary/80 z-10 rounded-2xl"></div>
            <div className="relative z-20 grid items-center justify-center gap-4 px-4 text-center text-primary-foreground py-20">
                <div className="space-y-3">
                <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Ready to Make a Difference?
                </h2>
                <p className="mx-auto max-w-[600px] md:text-xl/relaxed">
                    Join thousands of other citizens. Create an account and submit your first report today to help build a better tomorrow.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    <Link href="/register/citizen">
                        Get Started Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    </Button>
                </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t">
         <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">&copy; 2024 CivicConnect. All rights reserved.</p>
        </div>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Terms of Service
          </Link>
          <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Privacy Policy
          </Link>
           <Link href="#" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Contact Us
          </Link>
        </nav>
      </footer>
    </div>
  );
}
