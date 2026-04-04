import { LandingNav } from '@/components/landing-nav';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { ArrowRight, FileText, Users, CircleCheckBig, Twitter, Facebook, Linkedin } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const AshokaChakraLogo = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-8 w-8 text-primary"
  >
    <path
      d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
      fill="none"
    />
    <path
      d="M12 4a.999.999 0 00-1 1v2.58c-1.3.52-2.37 1.4-3.08 2.59l-2.16-.72a1 1 0 10-.72 1.86l2.16.72C7.37 13.6 8.44 14.48 9.74 15L7.58 15.72a1 1 0 10.72 1.86l2.16-.72c1.09.71 2.37 1.14 3.74 1.14s2.65-.43 3.74-1.14l2.16.72a1 1 0 10.72-1.86L14.26 15c1.3-.52 2.37-1.4 3.08-2.59l2.16.72a1 1 0 10.72-1.86l-2.16-.72C17.27 8.7 16.2 7.82 14.9 7.29V5a1 1 0 00-1-1zm0 2.5c2.49 0 4.5 2.01 4.5 4.5S14.49 15.5 12 15.5 7.5 13.49 7.5 11 9.51 6.5 12 6.5z"
    />
    <path
      d="M12 10a1 1 0 110 2 1 1 0 010-2zM12 6.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM12 14.5a.5.5 0 01.5.5v1a.5.5 0 01-1 0v-1a.5.5 0 01.5-.5zM15.57 7.72a.5.5 0 01.63.31l.5 1.73a.5.5 0 11-.94.27l-.5-1.73a.5.5 0 01.31-.63zM7.22 13.04a.5.5 0 01.63.31l.5 1.73a.5.5 0 01-.94.27l-.5-1.73a.5.5 0 01.31-.63zM8.43 7.72a.5.5 0 01.31.63l-.5 1.73a.5.5 0 11-.94-.27l.5-1.73a.5.5 0 01.63-.31zM14.36 13.04a.5.5 0 01.31.63l-.5 1.73a.5.5 0 11-.94-.27l.5-1.73a.5.5 0 01.63-.31zM6.5 11a.5.5 0 01.5.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5v-1zM15.5 11a.5.5 0 01.5.5h1a.5.5 0 010 1h-1a.5.5 0 01-.5-.5v-1zM9.64 14.36a.5.5 0 01.63-.31l1.73.5a.5.5 0 01.27.94l-1.73.5a.5.5 0 01-.63-.31.5.5 0 01.31-.63zM13.04 7.22a.5.5 0 01.63-.31l1.73.5a.5.5 0 11-.27.94l-1.73-.5a.5.5 0 01-.31-.63zM8.96 14.36a.5.5 0 01-.63.31l-1.73-.5a.5.5 0 11.27-.94l1.73.5a.5.5 0 01.31.63zM14.36 8.96a.5.5 0 01-.63.31l-1.73-.5a.5.5 0 11.27-.94l1.73.5a.5.5 0 01.31.63z"
      fill="currentColor"
    />
  </svg>
);

const features = [
  {
    icon: <FileText className="h-10 w-10 text-primary" />,
    title: 'Streamlined Complaint Submission',
    description: 'Our intuitive portal simplifies the process of lodging service requests and grievances, with options for media uploads.',
    imageId: 'feature-1'
  },
  {
    icon: <Users className="h-10 w-10 text-primary" />,
    title: 'Automated Department Routing',
    description: 'Advanced AI ensures your complaint is automatically categorized and assigned to the correct government department.',
    imageId: 'feature-2'
  },
  {
    icon: <CircleCheckBig className="h-10 w-10 text-primary" />,
    title: 'Transparent Resolution Tracking',
    description: 'Monitor the status of your complaint in real-time from submission to final resolution via your personal dashboard.',
    imageId: 'feature-3'
  },
];

const howItWorks = [
    {
        step: 1,
        title: "Lodge Your Grievance",
        description: "Utilize the portal to submit a detailed account of the issue, including location data and supporting media files.",
    },
    {
        step: 2,
        title: "Intelligent Case Assignment",
        description: "Our system analyzes and routes your case to the responsible department, ensuring efficient and accurate processing.",
    },
    {
        step: 3,
        title: "Track to Resolution",
        description: "Receive status updates through your dashboard as your case progresses, ensuring full transparency until the matter is resolved.",
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
        <section className="relative w-full h-[85vh] md:h-[70vh] flex items-center justify-center text-center text-white">
            {heroImage && (
                 <Image
                    src={heroImage.imageUrl}
                    data-ai-hint={heroImage.imageHint}
                    alt="Official Government of India Portal Background"
                    fill
                    className="z-0 object-cover"
                    priority
                />
            )}
            <div className="z-20 container px-4 md:px-6 space-y-6">
                <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl/none [text-shadow:0_3px_6px_rgba(0,0,0,0.7)]">
                    Public Grievance Redressal Portal
                </h1>
                <p className="max-w-[700px] mx-auto text-base sm:text-lg md:text-xl text-gray-200 [text-shadow:0_2px_4px_rgba(0,0,0,0.5)]">
                   A unified platform for citizens to report civic issues, track resolution progress, and engage with government services.
                </p>
                <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
                  <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    <Link href="/register/citizen">
                      Lodge a Complaint
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                  </Button>
                   <Button asChild size="lg" variant="secondary">
                    <Link href="/dashboard/citizen/complaints">
                      Track Complaint Status
                    </Link>
                  </Button>
                </div>
            </div>
        </section>

        {/* Features Section */}
        <section id="features" className="w-full py-16 md:py-24 lg:py-32 bg-secondary">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
              <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-semibold">Portal Features</div>
              <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                Efficient, Transparent, and Accountable Governance
              </h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                Our platform is engineered to enhance civic engagement and ensure the timely redressal of public grievances.
              </p>
            </div>
            <div className="mx-auto grid max-w-5xl items-start gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:max-w-none">
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
        <section id="how-it-works" className="w-full py-16 md:py-24 lg:py-32">
            <div className="container px-4 md:px-6">
                 <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
                    <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm text-primary font-semibold">Standard Operating Procedure</div>
                    <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-5xl">
                        Complaint Redressal Mechanism
                    </h2>
                    <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed">
                       Follow a simple three-step process for grievance resolution.
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
                            <h3 className="font-headline text-xl font-bold mt-4 lg:mt-16">{step.title}</h3>
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
                    alt="Indian Parliament"
                    fill
                    className="z-0 rounded-2xl object-cover"
                />
            )}
            <div className="absolute inset-0 bg-primary/80 z-10 rounded-2xl"></div>
            <div className="relative z-20 grid items-center justify-center gap-4 px-4 text-center text-primary-foreground py-20">
                <div className="space-y-3">
                <h2 className="font-headline text-3xl font-bold tracking-tighter md:text-4xl/tight">
                    Participate in Nation-Building
                </h2>
                <p className="mx-auto max-w-[600px] text-base md:text-xl/relaxed">
                    Register as a citizen and contribute to a more responsive and effective governance model by reporting issues.
                </p>
                </div>
                <div className="mx-auto w-full max-w-sm space-y-2">
                <Button asChild size="lg" className="w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90">
                    <Link href="/register/citizen">
                        Register to File a Grievance
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                    </Button>
                </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="bg-secondary border-t">
        <div className="container py-12 px-4 md:px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="md:col-span-1 space-y-4">
                    <Link href="/" className="flex items-center gap-2">
                        <AshokaChakraLogo />
                        <span className="font-headline text-xl font-semibold text-foreground">CivicConnect</span>
                    </Link>
                    <p className="text-sm text-muted-foreground">A public service by the Government of India for transparent and efficient grievance redressal.</p>
                     <div className="flex space-x-4">
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
                        <Link href="#" className="text-muted-foreground hover:text-primary"><Linkedin className="h-5 w-5" /></Link>
                    </div>
                </div>
                <div className="md:col-start-3">
                    <h4 className="font-semibold mb-4 text-foreground">Quick Links</h4>
                    <nav className="flex flex-col space-y-2">
                        <Link href="#features" className="text-sm text-muted-foreground hover:text-primary hover:underline">Portal Features</Link>
                        <Link href="#how-it-works" className="text-sm text-muted-foreground hover:text-primary hover:underline">Procedure</Link>
                        <Link href="/register/citizen" className="text-sm text-muted-foreground hover:text-primary hover:underline">Lodge a Grievance</Link>
                        <Link href="/dashboard/citizen" className="text-sm text-muted-foreground hover:text-primary hover:underline">Citizen Dashboard</Link>
                    </nav>
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-foreground">Legal</h4>
                    <nav className="flex flex-col space-y-2">
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:underline">Terms of Service</Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:underline">Privacy Policy</Link>
                        <Link href="#" className="text-sm text-muted-foreground hover:text-primary hover:underline">Contact Directory</Link>
                    </nav>
                </div>
            </div>
            <div className="mt-8 pt-8 border-t border-border">
                <p className="text-center text-sm text-muted-foreground">&copy; 2024 Government of India. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
}
