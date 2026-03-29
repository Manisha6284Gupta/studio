"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CalendarIcon, Camera, Loader2, MapPin, Mic, RefreshCcw, Sparkles, Trash2, UploadCloud, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { runCategorizeComplaint, runTranslateText } from "@/lib/actions"
import { ComplaintCategorizationAndRoutingOutput } from "@/ai/flows/ai-complaint-categorization-and-routing"

const complaintFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  description: z.string().min(25, "Description must be at least 25 characters."),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
  category: z.string().min(1, "Please select a category."),
  priority: z.string().min(1, "Please select a priority."),
  severity: z.string().min(1, "Please select a severity."),
  deadline: z.date().optional(),
  tags: z.string().optional(),
})

type ComplaintFormValues = z.infer<typeof complaintFormSchema>

export function ComplaintForm() {
  const { toast } = useToast()
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isCameraOpen, setIsCameraOpen] = useState(false)
  const [mediaFile, setMediaFile] = useState<{ dataUrl: string; type: 'image' | 'video' } | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const descriptionBaseText = useRef<string>("");
  
  const [locationName, setLocationName] = useState<string | null>(null);


  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: "",
      location: undefined,
    },
  })

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      toast({
        variant: "destructive",
        title: "Not Supported",
        description: "Your browser does not support speech recognition.",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      return;
    }

    recognitionRef.current = new SpeechRecognition();
    const recognition = recognitionRef.current;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      descriptionBaseText.current = form.getValues("description");
      setIsListening(true);
      toast({ title: "Listening...", description: "Start speaking to dictate. You can speak in Hindi or English." });
    };

    recognition.onend = async () => {
      setIsListening(false);
      const spokenText = form.getValues("description").replace(descriptionBaseText.current, "").trim();

      if (spokenText) {
        setIsTranslating(true);
        toast({ title: "Analyzing and Translating...", description: "Please wait while we process your description." });
        try {
          const result = await runTranslateText({ text: spokenText });
          const newDescription = (descriptionBaseText.current ? `${descriptionBaseText.current.trim()} ` : "") + result.translatedText;
          form.setValue("description", newDescription, { shouldValidate: true });
          toast({ title: "Translation Complete", description: "Your description has been processed and translated to English." });
        } catch (error) {
          console.error("Translation failed:", error);
          toast({
            variant: "destructive",
            title: "Translation Failed",
            description: "Could not translate your text. Please ensure you are connected to the internet or try typing in English.",
          });
          form.setValue("description", (descriptionBaseText.current ? `${descriptionBaseText.current.trim()} ` : "") + spokenText);
        } finally {
          setIsTranslating(false);
        }
      }
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event.error);
      setIsListening(false);
      if (event.error === 'not-allowed') {
        toast({
          variant: "destructive",
          title: "Microphone Permission Denied",
          description: "Please allow microphone access in your browser settings.",
        });
      } else {
        toast({
          variant: "destructive",
          title: "Speech Recognition Error",
          description: "An error occurred. Please try again.",
        });
      }
    };

    recognition.onresult = (event) => {
      let interimTranscript = '';
      let finalTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interimTranscript += event.results[i][0].transcript;
        }
      }
      
      const newText = (descriptionBaseText.current ? `${descriptionBaseText.current.trim()} ` : "") + finalTranscript + interimTranscript;
      form.setValue("description", newText.trim(), { shouldValidate: false });
    };

    recognition.start();
  }

  const handleAiAnalysis = async () => {
    const title = form.getValues("title")
    const description = form.getValues("description")

    if (!title || !description) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please provide a title and description before running the AI analysis.",
      })
      return
    }

    setIsAiLoading(true)
    try {
      const complaintInput: any = { title, description };
      if (mediaFile && mediaFile.type === 'image') {
        complaintInput.photoDataUri = mediaFile.dataUrl;
      }
      
      const result: ComplaintCategorizationAndRoutingOutput = await runCategorizeComplaint(complaintInput);
      
      form.setValue("category", result.category)
      form.setValue("priority", result.priority)
      form.setValue("severity", result.severity)
      form.setValue("tags", result.tags.join(", "))
      if (result.deadline) {
        form.setValue("deadline", new Date(result.deadline))
      }

      toast({
        title: "AI Analysis Complete",
        description: "We've pre-filled the form with our suggestions.",
      })

    } catch (error) {
      console.error("AI analysis failed:", error)
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: "We couldn't analyze your complaint. Please fill the form manually.",
      })
    } finally {
      setIsAiLoading(false)
    }
  }

  function onSubmit(data: ComplaintFormValues) {
    console.log(data)
    if (!data.location) {
        toast({
            variant: "destructive",
            title: "Location is required",
            description: "Please set the location for your complaint.",
        });
        return;
    }
    toast({
      title: "Complaint Submitted!",
      description: "Application number #CN-583921 has been generated.",
    })
  }

    const getAddressFromCoordinates = async (lat: number, lng: number) => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error("Google Maps API key is not configured.");
            setLocationName("Could not fetch address: API Key missing.");
            return;
        }
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
            const data = await response.json();
            if (data.status === "OK" && data.results[0]) {
                setLocationName(data.results[0].formatted_address);
                 toast({
                    title: "Location Set",
                    description: `Location captured: ${data.results[0].formatted_address}`,
                });
            } else {
                setLocationName("Address not found.");
                toast({
                    variant: "destructive",
                    title: "Location Error",
                    description: "Could not find a valid address for your location.",
                });
            }
        } catch (error) {
            console.error("Error reverse geocoding:", error);
            setLocationName("Could not fetch address due to a network error.");
            toast({
                variant: "destructive",
                title: "Location Error",
                description: "Could not retrieve your location address. Please check your network.",
            });
        }
    };


    const handleSetLocation = () => {
        setLocationName("Fetching location...");
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    form.setValue("location", { type: "Point", coordinates: [longitude, latitude] }, { shouldValidate: true });
                    getAddressFromCoordinates(latitude, longitude);
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationName(null);
                    toast({
                        variant: "destructive",
                        title: "Location Error",
                        description: "Could not retrieve your location. Please ensure you've granted permission.",
                    });
                },
                { enableHighAccuracy: true }
            );
        } else {
            setLocationName(null);
            toast({
                variant: "destructive",
                title: "Geolocation Not Supported",
                description: "Your browser does not support geolocation.",
            });
        }
    };

  const handleOpenCamera = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
            videoRef.current.srcObject = stream;
            setIsCameraOpen(true);
        }
    } catch (error) {
        console.error('Error accessing camera:', error);
        toast({
            variant: 'destructive',
            title: 'Camera Access Denied',
            description: 'Please enable camera permissions in your browser settings to use this app.',
        });
    }
  }

  const handleCapture = () => {
      if (videoRef.current && canvasRef.current) {
          const video = videoRef.current;
          const canvas = canvasRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const context = canvas.getContext('2d');
          if (context) {
            context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            const imageDataUrl = canvas.toDataURL('image/png');
            setMediaFile({ dataUrl: imageDataUrl, type: 'image' });
            toast({ title: 'Image captured successfully!' });
          }

          const stream = video.srcObject as MediaStream;
          if (stream) {
              stream.getTracks().forEach(track => track.stop());
          }
          video.srcObject = null;
          setIsCameraOpen(false);
      }
  };

  const handleCloseCamera = () => {
    if (videoRef.current) {
        const stream = videoRef.current.srcObject as MediaStream;
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
        videoRef.current.srcObject = null;
    }
    setIsCameraOpen(false);
  }
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                if(file.type.startsWith('image/')) {
                    setMediaFile({ dataUrl, type: 'image' });
                    toast({ title: 'Image uploaded successfully!' });
                } else if (file.type.startsWith('video/')) {
                    setMediaFile({ dataUrl, type: 'video' });
                    toast({ title: 'Video uploaded successfully!' });
                } else {
                    toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload an image or video file.' });
                }
            };
            reader.readAsDataURL(file);
        }
    };


  const handleRetake = () => {
      setMediaFile(null);
      handleOpenCamera();
  };

  const handleDeleteImage = () => {
      setMediaFile(null);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
              <CardHeader>
                  <CardTitle className="text-xl font-semibold">1. Describe Your Complaint</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Complaint Title</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Large pothole on Main Street" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                            <div className="relative">
                              <Textarea
                                  placeholder="Describe the issue in detail, or use the mic to dictate in English or Hindi..."
                                  className="min-h-[150px] pr-12"
                                  {...field}
                                  disabled={isTranslating}
                              />
                              <Button 
                                  type="button" 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={handleMicClick}
                                  disabled={isTranslating}
                                  className={cn(
                                      "absolute right-2 top-2 h-8 w-8 text-muted-foreground hover:text-foreground", 
                                      isListening && "text-destructive animate-pulse"
                                  )}
                              >
                                  {isTranslating ? <Loader2 className="h-4 w-4 animate-spin" /> : isListening ? <Mic className="h-4 w-4 text-destructive"/> : <Mic className="h-4 w-4" />}
                              </Button>
                            </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
              </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
              <div className="lg:col-span-3 space-y-8">
                  <Card>
                      <CardHeader>
                          <CardTitle className="text-xl font-semibold">2. Add Location & Media</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                            <FormField
                                control={form.control}
                                name="location"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Location</FormLabel>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className="w-full justify-start text-left font-normal"
                                                onClick={handleSetLocation}
                                            >
                                                <MapPin className="mr-2 h-4 w-4" />
                                                {locationName || "Use My Current Location"}
                                            </Button>
                                        <FormDescription>Uses your device's GPS to pinpoint the exact location.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                          <FormItem>
                              <FormLabel>Attach Media</FormLabel>
                              <div className={cn("w-full", mediaFile ? "hidden" : "grid grid-cols-1 sm:grid-cols-2 gap-4")}>
                                <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                      <div className="flex flex-col items-center justify-center">
                                          <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                          <p className="font-semibold">Click to upload</p>
                                          <p className="text-xs text-muted-foreground">Image or Video</p>
                                      </div>
                                      <input id="dropzone-file" type="file" className="hidden" accept="image/*,video/*" onChange={handleFileSelect}/>
                                  </label>
                                  <button type="button" onClick={handleOpenCamera} className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                      <div className="flex flex-col items-center justify-center">
                                          <Camera className="w-8 h-8 mb-3 text-muted-foreground" />
                                          <p className="font-semibold">Take a photo</p>
                                          <p className="text-xs text-muted-foreground">Use your device camera</p>
                                      </div>
                                  </button>
                              </div>
                              {mediaFile && (
                                  <div className="mt-2 relative w-full max-w-md mx-auto">
                                      <p className="text-sm font-medium mb-2 text-muted-foreground">{mediaFile.type === 'image' ? 'Image' : 'Video'} Preview:</p>
                                      <div className="relative">
                                          {mediaFile.type === 'image' ? (
                                             <Image src={mediaFile.dataUrl} alt="Complaint media" width={400} height={300} className="rounded-lg border w-full h-auto object-cover" />
                                          ) : (
                                              <video src={mediaFile.dataUrl} controls className="rounded-lg border w-full h-auto object-cover" />
                                          )}
                                          <div className="absolute top-2 right-2 flex gap-2">
                                              {mediaFile.type === 'image' && (
                                                <Button type="button" size="icon" variant="outline" className="bg-background/50 hover:bg-background" onClick={handleRetake}>
                                                    <RefreshCcw className="h-4 w-4" />
                                                </Button>
                                              )}
                                              <Button type="button" size="icon" variant="destructive" onClick={handleDeleteImage}>
                                                  <Trash2 className="h-4 w-4" />
                                              </Button>
                                          </div>
                                      </div>
                                  </div>
                              )}
                          </FormItem>
                      </CardContent>
                  </Card>
              </div>

              <div className="lg:col-span-2 space-y-8">
                  <Card className="lg:sticky lg:top-24">
                      <CardHeader>
                          <CardTitle className="text-xl font-semibold">3. AI-Powered Analysis</CardTitle>
                          <CardDescription>Let our AI pre-fill the form based on your complaint details.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                          <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Category</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="AI will suggest a category" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                  <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                                  <SelectItem value="Utility">Utility</SelectItem>
                                  <SelectItem value="Health">Health</SelectItem>
                                  <SelectItem value="Environment">Environment</SelectItem>
                                  <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Priority</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="AI will suggest a priority" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                  <SelectItem value="Low">Low</SelectItem>
                                  <SelectItem value="Medium">Medium</SelectItem>
                                  <SelectItem value="High">High</SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="severity"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Severity</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                  <SelectTrigger>
                                      <SelectValue placeholder="AI will suggest a severity" />
                                  </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                      <SelectItem value="Low">Low</SelectItem>
                                      <SelectItem value="Medium">Medium</SelectItem>
                                      <SelectItem value="High">High</SelectItem>
                                      <SelectItem value="Critical">Critical</SelectItem>
                                  </SelectContent>
                              </Select>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="deadline"
                          render={({ field }) => (
                              <FormItem className="flex flex-col">
                              <FormLabel>Suggested Deadline</FormLabel>
                              <Popover>
                                  <PopoverTrigger asChild>
                                  <FormControl>
                                      <Button
                                      variant={"outline"}
                                      className={cn(
                                          "w-full pl-3 text-left font-normal",
                                          !field.value && "text-muted-foreground"
                                      )}
                                      >
                                      {field.value ? (
                                          format(field.value, "PPP")
                                      ) : (
                                          <span>AI will suggest a date</span>
                                      )}
                                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                  </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0" align="start">
                                  <Calendar
                                      mode="single"
                                      selected={field.value}
                                      onSelect={field.onChange}
                                      disabled={(date) =>
                                      date < new Date() || date < new Date("1900-01-01")
                                      }
                                      initialFocus
                                  />
                                  </PopoverContent>
                              </Popover>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                          <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                              <FormItem>
                              <FormLabel>Suggested Tags</FormLabel>
                              <FormControl>
                                  <Input placeholder="AI will suggest tags" {...field} />
                              </FormControl>
                              <FormDescription>Comma-separated tags.</FormDescription>
                              <FormMessage />
                              </FormItem>
                          )}
                          />
                      </CardContent>
                      <CardFooter className="flex-col items-start gap-2">
                          <Button type="button" className="w-full" onClick={handleAiAnalysis} disabled={isAiLoading}>
                              {isAiLoading ? (
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              ) : (
                                  <Sparkles className="mr-2 h-4 w-4" />
                              )}
                              Analyze & Suggest
                          </Button>
                          <p className="text-xs text-muted-foreground px-1">You can edit all fields after analysis.</p>
                      </CardFooter>
                  </Card>
              </div>
          </div>
          <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" size="lg">Cancel</Button>
              <Button type="submit" size="lg">Submit Complaint</Button>
          </div>
        </form>
      </FormProvider>

      <AlertDialog open={isCameraOpen} onOpenChange={(open) => !open && handleCloseCamera()}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Live Camera</AlertDialogTitle>
              </AlertDialogHeader>
              <div className="bg-black rounded-lg overflow-hidden border">
                  <video ref={videoRef} className="w-full aspect-video" autoPlay muted playsInline />
              </div>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={handleCloseCamera}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleCapture}>Capture Photo</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
