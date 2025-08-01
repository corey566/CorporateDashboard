import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertSoundEffectSchema, type SoundEffect } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { Trash2, Volume2, Upload, Play, Pause } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ObjectUploader } from "@/components/ObjectUploader";
import type { UploadResult } from "@uppy/core";

const soundEffectFormSchema = insertSoundEffectSchema.extend({
  volume: z.number().min(0).max(1).optional(),
});

type SoundEffectFormData = z.infer<typeof soundEffectFormSchema>;

const EVENT_TYPES = [
  { value: "sale", label: "Sale" },
  { value: "announcement", label: "Announcement" },
  { value: "cash_offer", label: "Cash Offer" },
  { value: "birthday", label: "Birthday" },
  { value: "emergency", label: "Emergency" },
  { value: "achievement", label: "Achievement" },
  { value: "reminder", label: "Reminder" },
];

export default function AdminSoundEffects() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEffect, setEditingEffect] = useState<SoundEffect | null>(null);
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HTMLAudioElement | null>(null);
  const { toast } = useToast();

  const { data: soundEffects = [], isLoading } = useQuery({
    queryKey: ["/api/sound-effects"],
  });

  const { data: files = [] } = useQuery({
    queryKey: ["/api/files"],
  });

  const audioFiles = files.filter((file: any) => file.type === 'audio');

  const form = useForm<SoundEffectFormData>({
    resolver: zodResolver(soundEffectFormSchema),
    defaultValues: {
      name: "",
      eventType: "",
      fileUrl: "",
      isActive: true,
      volume: 0.5,
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: SoundEffectFormData) => {
      const response = await fetch("/api/sound-effects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create sound effect');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sound-effects"] });
      setIsDialogOpen(false);
      setEditingEffect(null);
      form.reset();
      toast({
        title: "Success",
        description: "Sound effect created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create sound effect",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SoundEffectFormData }) => {
      const response = await fetch(`/api/sound-effects/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update sound effect');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sound-effects"] });
      setIsDialogOpen(false);
      setEditingEffect(null);
      form.reset();
      toast({
        title: "Success",
        description: "Sound effect updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update sound effect",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/sound-effects/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete sound effect');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/sound-effects"] });
      toast({
        title: "Success",
        description: "Sound effect deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete sound effect",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: SoundEffectFormData) => {
    if (editingEffect) {
      updateMutation.mutate({ id: editingEffect.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (effect: SoundEffect) => {
    setEditingEffect(effect);
    form.reset({
      name: effect.name,
      eventType: effect.eventType,
      fileUrl: effect.fileUrl,
      isActive: effect.isActive,
      volume: effect.volume,
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this sound effect?")) {
      deleteMutation.mutate(id);
    }
  };

  const playAudio = async (url: string, effectId: number) => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }

    if (currentlyPlaying === effectId) {
      setCurrentlyPlaying(null);
      setCurrentAudio(null);
      return;
    }

    try {
      const audio = new Audio(url);
      audio.volume = (effectId === -1 ? form.watch("volume") : 0.5) || 0.5;
      
      // Wait for audio to load
      await new Promise((resolve, reject) => {
        audio.addEventListener('canplaythrough', resolve, { once: true });
        audio.addEventListener('error', reject, { once: true });
        audio.load();
      });
      
      // Play the audio
      const playPromise = audio.play();
      
      if (playPromise !== undefined) {
        await playPromise;
      }
      
      setCurrentAudio(audio);
      setCurrentlyPlaying(effectId);

      audio.addEventListener("ended", () => {
        setCurrentlyPlaying(null);
        setCurrentAudio(null);
      });
      
      audio.addEventListener("error", (e) => {
        console.error("Audio playback error:", e);
        setCurrentlyPlaying(null);
        setCurrentAudio(null);
        toast({
          title: "Error",
          description: "Failed to play audio file. File may be corrupted or unsupported.",
          variant: "destructive",
        });
      });
      
    } catch (error) {
      console.error("Audio play error:", error);
      setCurrentlyPlaying(null);
      setCurrentAudio(null);
      toast({
        title: "Error",
        description: "Failed to play audio file. Please check the file format.",
        variant: "destructive",
      });
    }
  };

  const stopAudio = () => {
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    }
    setCurrentlyPlaying(null);
    setCurrentAudio(null);
  };

  const resetForm = () => {
    form.reset({
      name: "",
      eventType: "",
      fileUrl: "",
      isActive: true,
      volume: 0.5,
    });
    setEditingEffect(null);
  };

  if (isLoading) {
    return <div>Loading sound effects...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Sound Effects Management</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Volume2 className="mr-2 h-4 w-4" />
              Add Sound Effect
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingEffect ? "Edit Sound Effect" : "Add New Sound Effect"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  {...form.register("name")}
                  placeholder="Enter sound effect name"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="eventType">Event Type</Label>
                <Select
                  value={form.watch("eventType")}
                  onValueChange={(value) => form.setValue("eventType", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENT_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.eventType && (
                  <p className="text-sm text-red-500">{form.formState.errors.eventType.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fileUrl">Audio File</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="fileUrl"
                    {...form.register("fileUrl")}
                    placeholder="Upload an audio file"
                    readOnly
                    className="flex-1"
                  />
                  <input
                    type="file"
                    accept="audio/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      try {
                        const formData = new FormData();
                        formData.append('file', file);

                        const response = await fetch('/api/files', {
                          method: 'POST',
                          credentials: 'include',
                          body: formData
                        });

                        if (!response.ok) {
                          throw new Error('Failed to upload file');
                        }

                        const uploadedFile = await response.json();
                        const fileUrl = `/uploads/${uploadedFile.filename}`;
                        
                        // Update the form with the uploaded file URL
                        form.setValue("fileUrl", fileUrl);
                        
                        toast({
                          title: "Success",
                          description: "Audio file uploaded successfully!",
                        });
                      } catch (error) {
                        console.error('Upload error:', error);
                        toast({
                          title: "Error",
                          description: "Failed to upload audio file",
                          variant: "destructive",
                        });
                      }
                    }}
                    className="hidden"
                    id="audio-file-upload"
                  />
                  <Button 
                    type="button" 
                    onClick={() => document.getElementById('audio-file-upload')?.click()}
                    className="px-3 py-2"
                  >
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
                {form.formState.errors.fileUrl && (
                  <p className="text-sm text-red-500">{form.formState.errors.fileUrl.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="volume">Volume ({Math.round((form.watch("volume") || 0.5) * 100)}%)</Label>
                <Slider
                  value={[form.watch("volume") || 0.5]}
                  onValueChange={(value) => form.setValue("volume", value[0])}
                  max={1}
                  min={0}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  checked={form.watch("isActive")}
                  onCheckedChange={(checked) => form.setValue("isActive", checked)}
                />
                <Label>Active</Label>
              </div>

              {form.watch("fileUrl") && (
                <div className="flex items-center space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => playAudio(form.watch("fileUrl"), -1)}
                  >
                    {currentlyPlaying === -1 ? (
                      <Pause className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4" />
                    )}
                    Test Audio
                  </Button>
                  {currentlyPlaying === -1 && (
                    <Button type="button" variant="outline" size="sm" onClick={stopAudio}>
                      Stop
                    </Button>
                  )}
                </div>
              )}

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                >
                  {editingEffect ? "Update" : "Create"} Sound Effect
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sound Effects</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Event Type</TableHead>
                <TableHead>Volume</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {soundEffects.map((effect: SoundEffect) => (
                <TableRow key={effect.id}>
                  <TableCell className="font-medium">{effect.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {EVENT_TYPES.find(t => t.value === effect.eventType)?.label || effect.eventType}
                    </Badge>
                  </TableCell>
                  <TableCell>{Math.round(effect.volume * 100)}%</TableCell>
                  <TableCell>
                    <Badge variant={effect.isActive ? "default" : "secondary"}>
                      {effect.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => playAudio(effect.fileUrl, effect.id)}
                      >
                        {currentlyPlaying === effect.id ? (
                          <Pause className="h-4 w-4" />
                        ) : (
                          <Play className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(effect)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(effect.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {soundEffects.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No sound effects configured yet. Add your first sound effect to get started.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}