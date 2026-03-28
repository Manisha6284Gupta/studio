"use client"

import { useState } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { categorizeComplaint } from "@/ai/flows/ai-complaint-categorization-and-routing"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { CalendarIcon, Loader2, MapPin, Mic, Sparkles, UploadCloud } from "lucide-react"
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

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle>Complaint Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                            placeholder="Describe the issue in detail..."
                            className="min-h-[150px] pr-10"
                            {...field}
                          />
                          <Button type="button" variant="ghost" size="icon" className="absolute right-1 bottom-1 h-8 w-8">
                             <Mic className="h-4 w-4" />
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                 <CardTitle>Location & Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormItem>
                    <FormLabel>Location</FormLabel>
                    <Button type="button" variant="outline" className="w-full justify-start text-left font-normal">
                        <MapPin className="mr-2 h-4 w-4" />
                        Set Location on Map
                    </Button>
                    <FormDescription>Pinpoint the exact location of the issue.</FormDescription>
                </FormItem>
                 <FormItem>
                    <FormLabel>Upload Image</FormLabel>
                    <FormControl>
                       <div className="flex items-center justify-center w-full">
                          <label htmlFor="dropzone-file" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-secondary hover:bg-muted">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                  <UploadCloud className="w-8 h-8 mb-3 text-muted-foreground" />
                                  <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                  <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 800x400px)</p>
                              </div>
                              <input id="dropzone-file" type="file" className="hidden" />
                          </label>
                      </div> 
                    </FormControl>
                </FormItem>
              </CardContent>
            </Card>

          </div>

          <div className="space-y-8">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                   <CardTitle>AI Assistant</CardTitle>
                   <Button type="button" size="sm" onClick={handleAiAnalysis} disabled={isAiLoading}>
                        {isAiLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Analyze
                    </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                 <p className="text-sm text-muted-foreground">Let AI categorize your complaint for faster processing.</p>
                
                 <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a category" />
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
                            <SelectValue placeholder="Select a priority" />
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
                            <SelectValue placeholder="Select a severity" />
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
                                <span>Pick a date</span>
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
                        <Input placeholder="e.g., pothole, road_damage, traffic" {...field} />
                      </FormControl>
                       <FormDescription>Comma-separated tags.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

              </CardContent>
            </Card>
          </div>
        </div>
        <div className="flex justify-end">
            <Button type="submit" size="lg">Submit Complaint</Button>
        </div>
      </form>
    </FormProvider>
  )
}
