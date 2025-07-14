import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMediaSlideSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Images, 
  Video, 
  FileText, 
  Upload, 
  Edit, 
  Trash2, 
  Eye, 
  Plus,
  ArrowUp,
  ArrowDown,
  Play,
  Pause
} from "lucide-react";
import { z } from "zod";

const mediaSlideFormSchema = insertMediaSlideSchema.extend({
  order: z.string().min(1, "Order is required"),
});

type MediaSlideFormData = z.infer<typeof mediaSlideFormSchema>;

export default function AdminMedia() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [previewSlide, setPreviewSlide] = useState<any>(null);
  const { toast } = useToast();

  const { data: mediaSlides, isLoading } = useQuery({
    queryKey: ["/api/media-slides"],
    refetchInterval: 5000,
  });

  const form = useForm<MediaSlideFormData>({
    resolver: zodResolver(mediaSlideFormSchema),
    defaultValues: {
      title: "",
      type: "",
      url: "",
      content: "",
      order: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MediaSlideFormData) => {
      const slideData = {
        ...data,
        order: parseInt(data.order),
      };
      return apiRequest("POST", "/api/media-slides", slideData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Media slide created successfully",
      });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MediaSlideFormData }) => {
      const slideData = {
        ...data,
        order: parseInt(data.order),
      };
      return apiRequest("PUT", `/api/media-slides/${id}`, slideData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Media slide updated successfully",
      });
      setIsDialogOpen(false);
      setEditingSlide(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/media-slides/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/media-slides"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Media slide deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleEdit = (slide: any) => {
    setEditingSlide(slide);
    form.reset({
      title: slide.title,
      type: slide.type,
      url: slide.url || "",
      content: slide.content || "",
      order: slide.order.toString(),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (data: MediaSlideFormData) => {
    if (editingSlide) {
      updateMutation.mutate({ id: editingSlide.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this media slide?")) {
      deleteMutation.mutate(id);
    }
  };

  const getSlideIcon = (type: string) => {
    switch (type) {
      case "image":
        return <Images className="w-4 h-4" />;
      case "video":
        return <Video className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      default:
        return <Images className="w-4 h-4" />;
    }
  };

  const getSlideTypeColor = (type: string) => {
    switch (type) {
      case "image":
        return "bg-blue-500 text-white";
      case "video":
        return "bg-purple-500 text-white";
      case "text":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const renderSlidePreview = (slide: any) => {
    switch (slide.type) {
      case "image":
        return slide.url ? (
          <img
            src={slide.url}
            alt={slide.title}
            className="w-full h-32 object-cover rounded-lg"
          />
        ) : (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <Images className="w-8 h-8 text-gray-400" />
          </div>
        );
      case "video":
        return (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <Video className="w-8 h-8 text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Video</span>
          </div>
        );
      case "text":
        return (
          <div className="w-full h-32 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg flex items-center justify-center p-4">
            <div className="text-center">
              <h4 className="font-semibold text-corporate-800 mb-2">{slide.title}</h4>
              <p className="text-sm text-corporate-600">{slide.content}</p>
            </div>
          </div>
        );
      default:
        return (
          <div className="w-full h-32 bg-gray-100 rounded-lg flex items-center justify-center">
            <FileText className="w-8 h-8 text-gray-400" />
          </div>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Media Slides Grid */}
      <div className="lg:col-span-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center">
                <Images className="w-5 h-5 mr-2" />
                Media Slides
              </CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button
                    onClick={() => {
                      setEditingSlide(null);
                      form.reset();
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Slide
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>
                      {editingSlide ? "Edit Media Slide" : "Add New Media Slide"}
                    </DialogTitle>
                  </DialogHeader>
                  <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="title">Title</Label>
                        <Input
                          id="title"
                          {...form.register("title")}
                          placeholder="Slide title"
                        />
                        {form.formState.errors.title && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.title.message}
                          </p>
                        )}
                      </div>
                      
                      <div>
                        <Label htmlFor="type">Type</Label>
                        <Select
                          value={form.watch("type")}
                          onValueChange={(value) => form.setValue("type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="image">Image</SelectItem>
                            <SelectItem value="video">Video</SelectItem>
                            <SelectItem value="text">Text</SelectItem>
                          </SelectContent>
                        </Select>
                        {form.formState.errors.type && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.type.message}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    {(form.watch("type") === "image" || form.watch("type") === "video") && (
                      <div>
                        <Label htmlFor="url">URL</Label>
                        <Input
                          id="url"
                          {...form.register("url")}
                          placeholder="https://example.com/image.jpg"
                        />
                        {form.formState.errors.url && (
                          <p className="text-sm text-destructive">
                            {form.formState.errors.url.message}
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div>
                      <Label htmlFor="content">Content</Label>
                      <Textarea
                        id="content"
                        {...form.register("content")}
                        placeholder="Slide content or description"
                        rows={4}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="order">Display Order</Label>
                      <Input
                        id="order"
                        type="number"
                        {...form.register("order")}
                        placeholder="1"
                      />
                      {form.formState.errors.order && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.order.message}
                        </p>
                      )}
                    </div>
                    
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
                        {editingSlide ? "Update" : "Create"}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mediaSlides?.map((slide: any) => (
                <div key={slide.id} className="bg-white rounded-lg border shadow-sm overflow-hidden">
                  <div className="relative">
                    {renderSlidePreview(slide)}
                    <div className="absolute top-2 right-2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => setPreviewSlide(slide)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => handleEdit(slide)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/80 hover:bg-white"
                        onClick={() => handleDelete(slide.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-corporate-800">{slide.title}</h4>
                      <Badge className={getSlideTypeColor(slide.type)}>
                        {getSlideIcon(slide.type)}
                        <span className="ml-1">{slide.type}</span>
                      </Badge>
                    </div>
                    
                    {slide.content && (
                      <p className="text-sm text-corporate-600 mb-2 line-clamp-2">
                        {slide.content}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-corporate-500">
                      <span>Order: {slide.order}</span>
                      <span>
                        {new Date(slide.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {(!mediaSlides || mediaSlides.length === 0) && (
              <div className="text-center py-12">
                <Images className="w-16 h-16 text-corporate-300 mx-auto mb-4" />
                <p className="text-corporate-500 mb-4">No media slides yet</p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your First Slide
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Side Panel */}
      <div className="space-y-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  form.reset({
                    title: "Company News",
                    type: "text",
                    content: "Great quarterly results achieved!",
                    order: "1",
                  });
                  setIsDialogOpen(true);
                }}
              >
                <FileText className="w-4 h-4 mr-2" />
                Text Announcement
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  form.reset({
                    title: "Team Photo",
                    type: "image",
                    url: "https://images.unsplash.com/photo-1556761175-4b46a572b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=400",
                    content: "Our amazing team in action!",
                    order: "2",
                  });
                  setIsDialogOpen(true);
                }}
              >
                <Images className="w-4 h-4 mr-2" />
                Team Image
              </Button>
              
              <Button
                variant="outline"
                className="w-full justify-start"
                onClick={() => {
                  form.reset({
                    title: "Training Video",
                    type: "video",
                    url: "",
                    content: "Weekly training session",
                    order: "3",
                  });
                  setIsDialogOpen(true);
                }}
              >
                <Video className="w-4 h-4 mr-2" />
                Video Content
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Slide Management */}
        <Card>
          <CardHeader>
            <CardTitle>Slide Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-sm text-corporate-600">
                <p><strong>Total Slides:</strong> {mediaSlides?.length || 0}</p>
                <p><strong>Active Slides:</strong> {mediaSlides?.filter((s: any) => s.isActive).length || 0}</p>
              </div>
              
              <div className="border-t pt-3">
                <h4 className="font-semibold text-corporate-800 mb-2">Tips</h4>
                <ul className="text-sm text-corporate-600 space-y-1">
                  <li>• Images work best at 16:9 ratio</li>
                  <li>• Keep text slides concise</li>
                  <li>• Use order numbers for sequence</li>
                  <li>• Test content on display screens</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Modal */}
      {previewSlide && (
        <Dialog open={!!previewSlide} onOpenChange={() => setPreviewSlide(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Preview: {previewSlide.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {renderSlidePreview(previewSlide)}
              {previewSlide.content && (
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-corporate-700">{previewSlide.content}</p>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
