
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useState, useRef } from "react";
import { Camera, Loader2, LocateFixed, CheckCircle, Mic, Square, Trash2, Waves } from "lucide-react";
import Image from "next/image";
import { useReports } from "@/hooks/use-reports";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Input } from "../ui/input";
import { speechToText } from "@/ai/flows/speech-to-text";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }).max(500, {
    message: "Description must not be longer than 500 characters."
  }),
  photoDataUrl: z.string().url({ message: "Please upload a photo." }),
  location: z.object({
    lat: z.coerce.number().min(-90, "Invalid latitude").max(90, "Invalid latitude"),
    lng: z.coerce.number().min(-180, "Invalid longitude").max(180, "Invalid longitude"),
  }).refine(data => data.lat !== undefined && data.lng !== undefined, {
    message: "Location is required.",
    path: ["lat"], // assign error to a field
  }),
});

const MAX_IMAGE_SIZE_BYTES = 750 * 1024; // 750KB to be safe for Firestore's 1MiB limit

export function NewReportForm() {
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [manualLocation, setManualLocation] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const { addReport } = useReports();
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      location: {
        lat: "" as unknown as number,
        lng: "" as unknown as number,
      },
    },
  });

  const resizeImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const img = document.createElement("img");
            img.onload = () => {
                const canvas = document.createElement("canvas");
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;

                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    return reject(new Error("Could not get canvas context"));
                }
                ctx.drawImage(img, 0, 0, width, height);

                // Start with high quality
                let quality = 0.9;
                let dataUrl = canvas.toDataURL(file.type, quality);

                // Reduce quality until it's under the size limit
                while (dataUrl.length > MAX_IMAGE_SIZE_BYTES && quality > 0.1) {
                    quality -= 0.1;
                    dataUrl = canvas.toDataURL(file.type, quality);
                }

                if (dataUrl.length > MAX_IMAGE_SIZE_BYTES) {
                  return reject(new Error("Image is too large even after compression. Please choose a smaller file."));
                }

                resolve(dataUrl);
            };
            img.onerror = reject;
            img.src = event.target?.result as string;
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
  };

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsSubmitting(true); // Use submitting state to show loading
      toast({ description: "Processing image..." });
      try {
        const resizedDataUrl = await resizeImage(file);
        setPhotoPreview(resizedDataUrl);
        form.setValue("photoDataUrl", resizedDataUrl, { shouldValidate: true });
        form.clearErrors("photoDataUrl");
        toast({ title: "Image ready!", description: "Image has been processed and is ready." });
      } catch (error: any) {
        console.error("Image processing error:", error);
        toast({
            variant: "destructive",
            title: "Image Error",
            description: error.message || "Could not process the image. Please try another one.",
        });
        setPhotoPreview(null);
        form.resetField("photoDataUrl");
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const handleDeletePhoto = () => {
    setPhotoPreview(null);
    form.resetField("photoDataUrl");
    // Also reset the file input so the user can re-select the same file if they want
    const fileInput = document.getElementById('photo-upload') as HTMLInputElement;
    if (fileInput) {
        fileInput.value = "";
    }
  };


  const handleGeolocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        form.setValue("location", { lat: latitude, lng: longitude }, { shouldValidate: true });
        form.clearErrors("location");
        setIsLocating(false);
        setManualLocation(false);
        toast({
            description: "Location captured successfully.",
        })
      },
      (error) => {
        console.error("Geolocation error:", error);
        form.setError("location", { type: "manual", message: "Could not get location. Please enable permissions or enter manually." });
        setIsLocating(false);
        toast({
            variant: "destructive",
            title: "Location Error",
            description: "Could not get your location. Please check browser permissions.",
        })
      }
    );
  };
  
  const handleStartRecording = async () => {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorderRef.current = new MediaRecorder(stream);
        audioChunksRef.current = [];

        mediaRecorderRef.current.ondataavailable = (event) => {
            audioChunksRef.current.push(event.data);
        };

        mediaRecorderRef.current.onstop = async () => {
            const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
            const reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onloadend = async () => {
                const base64Audio = reader.result as string;
                setAudioUrl(base64Audio);
                
                setIsTranscribing(true);
                try {
                    const result = await speechToText({ audioDataUri: base64Audio });
                    if (result.transcription) {
                        form.setValue('description', result.transcription, { shouldValidate: true });
                        toast({ title: "Transcription successful!" });
                    } else {
                        toast({ variant: 'destructive', title: "Transcription failed", description: "Could not transcribe audio. Please type manually." });
                    }
                } catch (e) {
                    console.error(e);
                    toast({ variant: 'destructive', title: "Transcription error", description: "An error occurred during transcription." });
                } finally {
                    setIsTranscribing(false);
                }
            };
        };

        mediaRecorderRef.current.start();
        setIsRecording(true);
        setAudioUrl(null);
    } catch (err) {
        console.error("Error accessing microphone:", err);
        toast({
            variant: "destructive",
            title: "Microphone Access Denied",
            description: "Please enable microphone permissions in your browser settings.",
        });
    }
  };

  const handleStopRecording = () => {
      if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
          setIsRecording(false);
      }
  };

  const handleDeleteAudio = () => {
      setAudioUrl(null);
      if (form.getValues('description') === "Transcription in progress...") {
        form.setValue('description', '');
      }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
        await addReport({
          description: values.description,
          location: values.location,
          photoDataUrl: values.photoDataUrl,
          photoHint: 'user upload', // a generic hint
        });

        toast({
            title: "Report Submitted!",
            description: "Thank you for helping improve your city.",
        });
        router.push('/dashboard');
    } catch(e: any) {
        console.error("Failed to submit report:", e);
        toast({
            variant: "destructive",
            title: "Submission Failed",
            description: e.message || "Could not submit your report. Please try again.",
        });
        setIsSubmitting(false);
    }
  }

  const locationValue = form.watch("location");
  const descriptionValue = form.watch("description");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-24 md:pb-0">
        <Card>
            <CardContent className="p-6">
                <FormField
                    control={form.control}
                    name="photoDataUrl"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Photo of the issue</FormLabel>
                            <div className="relative mt-2">
                                <Input id="photo-upload" type="file" accept="image/*" className="sr-only" onChange={handlePhotoUpload} disabled={isSubmitting} />
                                <label htmlFor="photo-upload" className={cn("aspect-video flex items-center justify-center w-full border-2 border-dashed rounded-lg transition-colors", 
                                    isSubmitting ? "cursor-not-allowed bg-muted/50" : "cursor-pointer hover:bg-muted",
                                    photoPreview && "border-solid"
                                    )}>
                                    {photoPreview ? (
                                        <Image src={photoPreview} alt="Preview" fill className="object-cover rounded-lg" />
                                    ) : (
                                        <div className="text-center text-muted-foreground">
                                            <Camera className="mx-auto h-12 w-12" />
                                            <p className="mt-2">Click to upload a photo</p>
                                        </div>
                                    )}
                                    {isSubmitting && !photoPreview && (
                                      <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 rounded-md">
                                          <Loader2 className="h-8 w-8 animate-spin" />
                                          <p className="mt-2 text-sm font-medium">Processing image...</p>
                                      </div>
                                    )}
                                </label>
                                {photoPreview && !isSubmitting && (
                                    <Button 
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={handleDeletePhoto}
                                        className="absolute top-2 right-2 rounded-full h-8 w-8"
                                        aria-label="Remove photo"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                )}
                            </div>
                            <FormMessage>{form.formState.errors.photoDataUrl?.message}</FormMessage>
                        </FormItem>
                    )}
                />
            </CardContent>
        </Card>

        <Card>
            <CardContent className="p-6">
                <FormItem>
                    <div className="flex justify-between items-center">
                        <FormLabel>Location</FormLabel>
                        <Button type="button" variant="link" size="sm" onClick={() => setManualLocation(!manualLocation)}>
                            {manualLocation ? "Use Auto-Capture" : "Enter Manually"}
                        </Button>
                    </div>
                    {manualLocation ? (
                        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="location.lat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. 34.0522" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="location.lng"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Longitude</FormLabel>
                                        <FormControl>
                                            <Input type="number" placeholder="e.g. -118.2437" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    ) : (
                        <div className="mt-2 flex items-center gap-4">
                            <Button type="button" variant="outline" onClick={handleGeolocation} disabled={isLocating}>
                                {isLocating ? (
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                ) : (
                                    <LocateFixed className="mr-2 h-4 w-4" />
                                )}
                                Capture My Location
                            </Button>
                            {locationValue && locationValue.lat && locationValue.lng && (
                                <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                                    <CheckCircle className="h-5 w-5 text-accent" />
                                    <span>{locationValue.lat.toFixed(4)}, {locationValue.lng.toFixed(4)}</span>
                                </div>
                            )}
                        </div>
                    )}
                    <FormMessage>{form.formState.errors.location?.lat?.message || form.formState.errors.location?.lng?.message}</FormMessage>
                </FormItem>
            </CardContent>
        </Card>
        
        <Card>
            <CardContent className="p-6">
                <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                    <FormItem>
                        <div className="flex justify-between items-center">
                            <FormLabel>Brief Description</FormLabel>
                            
                            {!isRecording && !audioUrl && (
                                <Button type="button" variant="outline" size="sm" onClick={handleStartRecording}>
                                    <Mic className="mr-2 h-4 w-4" />
                                    Record Voice
                                </Button>
                            )}
                            {isRecording && (
                                <Button type="button" variant="destructive" size="sm" onClick={handleStopRecording}>
                                    <Square className="mr-2 h-4 w-4" />
                                    Stop Recording
                                </Button>
                            )}
                        </div>

                        <FormControl>
                            <div className="relative">
                                <Textarea
                                placeholder="e.g., Large pothole at the intersection of Main St and 1st Ave."
                                className="resize-none"
                                rows={5}
                                {...field}
                                disabled={isTranscribing}
                                />
                                {isTranscribing && (
                                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-md">
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        <span>Transcribing...</span>
                                    </div>
                                )}
                            </div>
                        </FormControl>
                        {isRecording && (
                           <div className="flex items-center gap-2 text-sm text-destructive font-medium pt-2">
                             <Waves className="h-4 w-4 animate-pulse" />
                             Recording in progress...
                           </div>
                        )}
                        {audioUrl && !isRecording && (
                            <div className="flex items-center gap-2 pt-2">
                                <audio src={audioUrl} controls className="w-full h-10"/>
                                <Button type="button" variant="ghost" size="icon" onClick={handleDeleteAudio} aria-label="Delete audio">
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                            </div>
                        )}
                        <FormDescription className={cn(descriptionValue.length > 450 && "text-destructive")}>
                            {descriptionValue.length} / 500 characters
                        </FormDescription>
                        <FormMessage />
                    </FormItem>
                )}
                />
            </CardContent>
        </Card>

        <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || isRecording || isTranscribing}>
            {(isSubmitting || isTranscribing) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isSubmitting ? "Submitting..." : isTranscribing ? "Transcribing..." : "Submit Report"}
        </Button>
      </form>
    </Form>
  );
}

    