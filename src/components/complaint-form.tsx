
"use client"

import { useEffect, useRef, useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import Image from "next/image"
import { useRouter } from "next/navigation"

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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { CalendarIcon, Camera, Loader2, MapPin, Mic, RefreshCcw, Sparkles, StopCircle, Trash2, UploadCloud, Video } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { runCategorizeComplaint, runTranslateText } from "@/lib/actions"
import type { ComplaintCategorizationAndRoutingOutput } from "@/lib/ai-types"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"

import { useUser, useFirestore, errorEmitter } from "@/firebase";
import { FirestorePermissionError } from "@/firebase/errors"
import { addDoc, collection, serverTimestamp, doc, updateDoc } from "firebase/firestore";
import type { Complaint } from "@/lib/types"

const complaintFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  description: z.string().min(25, "Description must be at least 25 characters."),
  location: z.object({
    type: z.literal("Point"),
    coordinates: z.tuple([z.number(), z.number()]),
  }).optional(),
  category: z.string().min(1, "Please select a category."),
  tags: z.string().optional(),
  priority: z.string().optional(),
  severity: z.string().optional(),
  deadline: z.date().optional(),
  recommendedDepartment: z.string().optional(),
})

type ComplaintFormValues = z.infer<typeof complaintFormSchema>

interface ComplaintFormProps {
    complaint?: Complaint;
}

const getInitialDeadline = (deadline: any): Date | undefined => {
    if (!deadline) return undefined;
    // Firestore Timestamps have a toDate() method
    if (typeof deadline.toDate === 'function') {
        return deadline.toDate();
    }
    // Handle JS Date objects, strings, or numbers
    const date = new Date(deadline);
    if (!isNaN(date.getTime())) {
        return date;
    }
    return undefined;
};

export function ComplaintForm({ complaint }: ComplaintFormProps) {
  const { toast } = useToast()
  const [isAiLoading, setIsAiLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()
  const { user } = useUser()
  const firestore = useFirestore()
  
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [videoFile, setVideoFile] = useState<string | null>(null);

  // Camera and video state
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [cameraMode, setCameraMode] = useState<'photo' | 'video'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<BlobPart[]>([]);

  const [isListening, setIsListening] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const descriptionBaseText = useRef<string>("");
  
  const [locationName, setLocationName] = useState<string | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      title: complaint?.title || "",
      description: complaint?.description || "",
      tags: complaint?.tags?.join(", ") || "",
      location: complaint?.location || undefined,
      category: complaint?.category || "",
      priority: complaint?.priority || "",
      severity: complaint?.severity || "",
      deadline: getInitialDeadline(complaint?.deadline),
      recommendedDepartment: complaint?.initialDepartmentId,
    },
  })
  
  useEffect(() => {
    if (complaint) {
        setImageFile(complaint.imageUrl || null);
        setVideoFile(complaint.videoUrl || null);
        // For backward compatibility
        if (complaint.image) {
            if (complaint.image.startsWith('data:image') && !complaint.imageUrl) {
                setImageFile(complaint.image);
            } else if (complaint.image.startsWith('data:video') && !complaint.videoUrl) {
                setVideoFile(complaint.image);
            }
        }
    } else {
        setImageFile(null);
        setVideoFile(null);
    }
  }, [complaint]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);
  
  useEffect(() => {
    if (!isCameraOpen) {
      if (videoRef.current?.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      return;
    }

    const getCameraPermission = async () => {
      try {
        const constraints = cameraMode === 'video' ? { video: true, audio: true } : { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    getCameraPermission();
    
    return () => {
        if (videoRef.current?.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            stream.getTracks().forEach(track => track.stop());
        }
    }
}, [isCameraOpen, cameraMode, toast]);


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
      if (imageFile) {
        complaintInput.photoDataUri = imageFile;
      }
      
      const result: ComplaintCategorizationAndRoutingOutput = await runCategorizeComplaint(complaintInput);
      
      form.setValue("category", result.category, { shouldValidate: true });
      form.setValue("tags", result.tags.join(", "), { shouldValidate: true });
      form.setValue("priority", result.priority, { shouldValidate: true });
      form.setValue("severity", result.severity, { shouldValidate: true });
      form.setValue("deadline", new Date(result.deadline), { shouldValidate: true });
      if (result.recommendedDepartmentNames.length > 0) {
        form.setValue("recommendedDepartment", result.recommendedDepartmentNames[0]);
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

  async function onSubmit(data: ComplaintFormValues) {
    if (!user) {
        toast({
            variant: "destructive",
            title: "Authentication Error",
            description: "You must be logged in to submit a complaint.",
        });
        return;
    }
    
    setIsSubmitting(true);
    
    if (complaint) {
        // Edit mode
        const complaintRef = doc(firestore, 'complaints', complaint._id);
        const updatedComplaintData: Record<string, any> = {
            title: data.title,
            description: data.description,
            ...(data.location && { location: data.location }),
            initialDepartmentId: data.recommendedDepartment || complaint.initialDepartmentId,
            priority: data.priority || "Medium",
            severity: data.severity || "Medium",
            category: data.category,
            deadline: data.deadline || null,
            tags: data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
            updatedAt: serverTimestamp(),
            imageUrl: imageFile,
            videoUrl: videoFile,
        };

        updateDoc(complaintRef, updatedComplaintData)
            .then(() => {
                toast({
                    title: "Complaint Updated!",
                    description: `Complaint #${complaint.applicationNumber} has been updated.`,
                });
                router.push(`/dashboard/citizen/complaints/${complaint._id}`);
            })
            .catch((error) => {
                console.error("Error updating complaint:", error);
                const permissionError = new FirestorePermissionError({
                    path: complaintRef.path,
                    operation: 'update',
                    requestResourceData: updatedComplaintData,
                });
                errorEmitter.emit('permission-error', permissionError);
                if (error.code !== 'permission-denied') {
                    toast({
                        variant: "destructive",
                        title: "Update Failed",
                        description: error.message || "An unexpected error occurred. Please try again.",
                    });
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    } else {
        // Create mode
        const applicationNumber = `CN-${Date.now().toString().slice(-6)}`;
        const newComplaintData = {
            title: data.title,
            description: data.description,
            ...(data.location && { location: data.location }),
            citizenId: user.uid,
            initialDepartmentId: data.recommendedDepartment || data.category,
            priority: data.priority || "Medium",
            severity: data.severity || "Medium",
            category: data.category,
            deadline: data.deadline || null,
            tags: data.tags?.split(',').map(tag => tag.trim()).filter(Boolean) || [],
            status: "Pending",
            applicationNumber: applicationNumber,
            isEscalated: false,
            resolutionStatus: "Unresolved",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            imageUrl: imageFile,
            videoUrl: videoFile,
            history: [{
                action: 'Complaint Submitted',
                status: 'Pending',
                comment: 'Citizen submitted the complaint.',
                date: new Date(),
                updatedBy: user.uid
            }]
        };

        const complaintsCol = collection(firestore, 'complaints');
        addDoc(complaintsCol, newComplaintData)
            .then((docRef) => {
                toast({
                    title: "Complaint Submitted!",
                    description: `Application number #${applicationNumber} has been generated.`,
                });
                router.push('/dashboard/citizen/complaints');
            })
            .catch((error) => {
                console.error("Error submitting complaint:", error);
                const permissionError = new FirestorePermissionError({
                    path: complaintsCol.path,
                    operation: 'create',
                    requestResourceData: newComplaintData,
                });
                errorEmitter.emit('permission-error', permissionError);
                if (error.code !== 'permission-denied') {
                    toast({
                        variant: "destructive",
                        title: "Submission Failed",
                        description: error.message || "An unexpected error occurred. Please try again.",
                    });
                }
            })
            .finally(() => {
                setIsSubmitting(false);
            });
    }
  }

    const getAddressFromCoordinates = async (lat: number, lng: number) => {
        const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
        if (!apiKey) {
            console.error("Google Maps API key is not configured.");
            setLocationName("Could not fetch address: API Key missing.");
            toast({
                variant: "destructive",
                title: "Configuration Error",
                description: "Google Maps API key is not configured. Please add it to your .env file.",
            });
            return;
        }
        try {
            const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`);
            const data = await response.json();
            if (data.status === "OK" && data.results[0]) {
                const address = data.results[0].formatted_address;
                setLocationName(address);
                 toast({
                    title: "Location Set",
                    description: `Location captured: ${address}`,
                });
            } else {
                setLocationName("Address not found for the captured coordinates.");
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
        setIsFetchingLocation(true);
        setLocationName(null);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    form.setValue("location", { type: "Point", coordinates: [longitude, latitude] }, { shouldValidate: true });
                    getAddressFromCoordinates(latitude, longitude).finally(() => {
                        setIsFetchingLocation(false);
                    });
                },
                (error) => {
                    console.error("Error getting location:", error);
                    setLocationName(null);
                    toast({
                        variant: "destructive",
                        title: "Location Error",
                        description: "Could not retrieve your location. Please ensure you've granted permission.",
                    });
                    setIsFetchingLocation(false);
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
            setIsFetchingLocation(false);
        }
    };

    const handleOpenCamera = (mode: 'photo' | 'video') => {
        setHasCameraPermission(null);
        setRecordedVideoUrl(null);
        setCameraMode(mode);
        setIsCameraOpen(true);
    };

    const handleCloseCamera = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
            mediaRecorderRef.current.stop();
        }
        setIsRecording(false);
        if (recordedVideoUrl) {
          URL.revokeObjectURL(recordedVideoUrl);
          setRecordedVideoUrl(null);
        }
        recordedChunksRef.current = [];
        setIsCameraOpen(false);
    };
    
    const handleCapture = () => {
        if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
                const imageDataUrl = canvas.toDataURL('image/png');
                
                setImageFile(imageDataUrl);
                toast({
                    title: "Photo Captured!",
                    description: "Your photo has been attached to the complaint.",
                });
                handleCloseCamera();
            }
        } else {
            toast({
                variant: "destructive",
                title: "Capture Failed",
                description: "Camera not ready. Please try again in a moment.",
            });
        }
    };

    const handleStartRecording = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream;
            recordedChunksRef.current = [];
            
            const mimeTypes = ['video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus', 'video/webm', 'video/mp4'];
            const supportedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type));
            
            if(!supportedMimeType) {
                toast({ variant: 'destructive', title: 'Video Recording Not Supported', description: 'Your browser does not support the required video formats.' });
                return;
            }

            mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: supportedMimeType });

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
            };

            mediaRecorderRef.current.onstop = () => {
                const blob = new Blob(recordedChunksRef.current, { type: supportedMimeType });
                const videoUrl = URL.createObjectURL(blob);
                setRecordedVideoUrl(videoUrl);
                setIsRecording(false);
                toast({ title: "Recording Finished", description: "You can now preview your video." });
            };

            mediaRecorderRef.current.start();
            setIsRecording(true);
            toast({ title: 'Recording started...' });
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
        }
    };

    const handleSaveVideo = () => {
        if (recordedVideoUrl) {
            fetch(recordedVideoUrl)
                .then(res => res.blob())
                .then(blob => {
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onloadend = () => {
                        const base64data = reader.result as string;
                        setVideoFile(base64data);
                        toast({ title: "Video saved successfully!" });
                    };
                });
            handleCloseCamera();
        }
    };
    
    const handleRetakeVideo = () => {
        if (recordedVideoUrl) {
            URL.revokeObjectURL(recordedVideoUrl);
        }
        setRecordedVideoUrl(null);
        recordedChunksRef.current = [];
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => {
                const dataUrl = reader.result as string;
                if(file.type.startsWith('image/') && type === 'image') {
                    setImageFile(dataUrl);
                    toast({ title: 'Image uploaded successfully!' });
                } else if (file.type.startsWith('video/') && type === 'video') {
                    setVideoFile(dataUrl);
                    toast({ title: 'Video uploaded successfully!' });
                } else {
                    toast({ variant: 'destructive', title: 'Invalid File Type', description: 'Please upload a valid file for the selected type.' });
                }
            };
            reader.readAsDataURL(file);
             e.target.value = '';
        }
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
                                            disabled={isFetchingLocation}
                                        >
                                            {isFetchingLocation ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <MapPin className="mr-2 h-4 w-4" />
                                            )}
                                            {isFetchingLocation ? "Fetching your location..." : "Use My Current Location"}
                                        </Button>
                                        
                                        {locationName ? (
                                            <FormDescription className="text-foreground">
                                                <span className="font-semibold">Selected Location:</span> {locationName}
                                            </FormDescription>
                                        ) : (
                                            <FormDescription>Click the button to use your device's GPS to pinpoint the exact location.</FormDescription>
                                        )}
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="space-y-4">
                                <FormItem>
                                    <FormLabel>Attach Image</FormLabel>
                                    {imageFile ? (
                                        <div className="mt-2 relative w-full max-w-sm">
                                            <Image src={imageFile} alt="Complaint image" width={400} height={300} className="rounded-lg border w-full h-auto object-cover" />
                                            <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2" onClick={() => setImageFile(null)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <span className="font-semibold text-sm">Upload</span>
                                                <input id="image-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileSelect(e, 'image')} />
                                            </label>
                                            <button type="button" onClick={() => handleOpenCamera('photo')} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                                <Camera className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <span className="font-semibold text-sm">Take Photo</span>
                                            </button>
                                        </div>
                                    )}
                                </FormItem>

                                <FormItem>
                                    <FormLabel>Attach Video</FormLabel>
                                    {videoFile ? (
                                        <div className="mt-2 relative w-full max-w-sm">
                                            <video src={videoFile} controls className="rounded-lg border w-full h-auto object-cover" />
                                            <Button type="button" size="icon" variant="destructive" className="absolute top-2 right-2" onClick={() => setVideoFile(null)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-2 gap-4">
                                            <label htmlFor="video-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                                <UploadCloud className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <span className="font-semibold text-sm">Upload</span>
                                                <input id="video-upload" type="file" className="hidden" accept="video/*" onChange={(e) => handleFileSelect(e, 'video')} />
                                            </label>
                                            <button type="button" onClick={() => handleOpenCamera('video')} className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                                <Video className="w-8 h-8 mb-2 text-muted-foreground" />
                                                <span className="font-semibold text-sm">Record Video</span>
                                            </button>
                                        </div>
                                    )}
                                </FormItem>
                            </div>
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
                                        <SelectItem value="Water Department">Water Department</SelectItem>
                                        <SelectItem value="Road Department">Road Department</SelectItem>
                                        <SelectItem value="Electricity">Electricity</SelectItem>
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
                                        <SelectValue placeholder="AI will suggest priority" />
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
                                        <SelectValue placeholder="AI will suggest severity" />
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
                                            format(new Date(field.value), "PPP")
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
                                        disabled={(date) => date < new Date()}
                                        initialFocus
                                        />
                                    </PopoverContent>
                                    </Popover>
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
              <Button type="button" variant="outline" size="lg" onClick={() => router.back()}>Cancel</Button>
              <Button type="submit" size="lg" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {complaint ? 'Update Complaint' : 'Submit Complaint'}
              </Button>
          </div>
        </form>
      </FormProvider>

      <AlertDialog open={isCameraOpen} onOpenChange={(open) => !open && handleCloseCamera()}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>
                      {cameraMode === 'photo' ? 'Live Camera' : 'Record Video'}
                  </AlertDialogTitle>
                   {(recordedVideoUrl) ? (
                        <AlertDialogDescription>Preview your media before saving.</AlertDialogDescription>
                   ) : hasCameraPermission === false ? (
                        <AlertDialogDescription>Please grant camera permissions to continue.</AlertDialogDescription>
                   ) : hasCameraPermission === null ? (
                        <AlertDialogDescription>Waiting for camera permission...</AlertDialogDescription>
                   ) : (
                        <AlertDialogDescription>
                           {cameraMode === 'photo' ? 'Position the subject in the frame and capture.' : 'Press record to start. Press stop when done.'}
                        </AlertDialogDescription>
                   )}
              </AlertDialogHeader>
              <div className="relative bg-black rounded-lg overflow-hidden border flex items-center justify-center min-h-[300px]">
                <video
                    ref={videoRef}
                    className={cn(
                        "w-full aspect-video object-cover",
                        (recordedVideoUrl || !hasCameraPermission) && "hidden"
                    )}
                    autoPlay
                    muted
                    playsInline
                />

                {isRecording && (
                    <div className="absolute top-2 left-2 flex items-center gap-2 bg-destructive/80 text-destructive-foreground text-xs font-bold px-2 py-1 rounded-full">
                        <div className="h-2 w-2 rounded-full bg-white animate-pulse"></div>REC
                    </div>
                )}

                {recordedVideoUrl && (
                    <video
                        src={recordedVideoUrl}
                        className="w-full aspect-video"
                        controls
                    />
                )}
                
                {hasCameraPermission === false && (
                     <Alert variant="destructive" className="m-4">
                        <AlertTitle>Camera Access Required</AlertTitle>
                        <AlertDescription>
                            Please allow camera access in your browser settings to use this feature.
                        </AlertDescription>
                    </Alert>
                )}

                {hasCameraPermission === null && (
                    <div className="text-center text-muted-foreground p-4">
                        <Loader2 className="h-8 w-8 mx-auto mb-2 animate-spin" />
                        <p>Requesting camera access...</p>
                    </div>
                )}
              </div>
              <AlertDialogFooter>
                    {cameraMode === 'photo' ? (
                        <>
                            <AlertDialogCancel onClick={handleCloseCamera}>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleCapture} disabled={!hasCameraPermission}>Capture Photo</AlertDialogAction>
                        </>
                    ) : ( // video mode
                        recordedVideoUrl ? (
                            <>
                                <Button variant="outline" onClick={handleRetakeVideo}>Retake</Button>
                                <AlertDialogAction onClick={handleSaveVideo}>Save Video</AlertDialogAction>
                            </>
                        ) : isRecording ? (
                             <Button onClick={handleStopRecording} variant="destructive">
                                <StopCircle className="mr-2 h-4 w-4" /> Stop Recording
                            </Button>
                        ) : (
                            <>
                                <AlertDialogCancel onClick={handleCloseCamera}>Cancel</AlertDialogCancel>
                                <Button onClick={handleStartRecording} disabled={!hasCameraPermission}>Start Recording</Button>
                            </>
                        )
                    )}
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
