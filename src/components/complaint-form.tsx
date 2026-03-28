"use client"

import { useRef, useState } from "react"
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
import { CalendarIcon, Camera, Loader2, MapPin, Mic, RefreshCcw, Sparkles, Trash2, UploadCloud } from "lucide-react"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { runCategorizeComplaint } from "@/lib/actions"
import { ComplaintCategorizationAndRoutingOutput } from "@/ai/flows/ai-complaint-categorization-and-routing"

const complaintFormSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters."),
  description: z.string().min(25, "Description must be at least 25 characters."),
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
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const form = useForm<ComplaintFormValues>({
    resolver: zodResolver(complaintFormSchema),
    defaultValues: {
      title: "",
      description: "",
      tags: ""
    },
  })

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
      const result: ComplaintCategorizationAndRoutingOutput = await runCategorizeComplaint({ title, description });
      
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
    toast({
      title: "Complaint Submitted!",
      description: "Application number #CN-583921 has been generated.",
    })
  }

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
            setCapturedImage(imageDataUrl);
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

  const handleRetake = () => {
      setCapturedImage(null);
      handleOpenCamera();
  };

  const handleDeleteImage = () => {
      setCapturedImage(null);
  };

  return (
    <>
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
                          <Textarea
                            placeholder="Describe the issue in detail, including its impact..."
                            className="min-h-[150px]"
                            {...field}
                          />
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
                        <FormItem>
                            <FormLabel>Location</FormLabel>
                            <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                                <MapPin className="mr-2 h-4 w-4" />
                                Set Location on Map
                            </Button>
                            <FormDescription>Pinpoint the exact location of the issue.</FormDescription>
                        </FormItem>
                        <FormItem>
                            <FormLabel>Attach Media</FormLabel>
                             <div className={cn("w-full", capturedImage ? "hidden" : "grid grid-cols-1 sm:grid-cols-2 gap-4")}>
                               <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                    <div className="flex flex-col items-center justify-center">
                                        <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="font-semibold">Click to upload</p>
                                        <p className="text-xs text-muted-foreground">or drag and drop</p>
                                    </div>
                                    <input id="dropzone-file" type="file" className="hidden" />
                                </label>
                                <button type="button" onClick={handleOpenCamera} className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted text-center p-4">
                                    <div className="flex flex-col items-center justify-center">
                                        <Camera className="w-8 h-8 mb-3 text-muted-foreground" />
                                        <p className="font-semibold">Take a photo</p>
                                        <p className="text-xs text-muted-foreground">Use your device camera</p>
                                    </div>
                                </button>
                            </div>
                            {capturedImage && (
                                <div className="mt-2 relative w-full max-w-md mx-auto">
                                    <p className="text-sm font-medium mb-2 text-muted-foreground">Image Preview:</p>
                                    <div className="relative">
                                        <Image src={capturedImage} alt="Captured complaint" width={400} height={300} className="rounded-lg border w-full h-auto object-cover" />
                                        <div className="absolute top-2 right-2 flex gap-2">
                                            <Button type="button" size="icon" variant="outline" className="bg-background/50 hover:bg-background" onClick={handleRetake}>
                                                <RefreshCcw className="h-4 w-4" />
                                            </Button>
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
    </>
  )
}
