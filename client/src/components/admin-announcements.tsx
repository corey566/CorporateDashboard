import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertAnnouncementSchema, insertNewsTickerSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { 
  Megaphone, 
  CakeSlice, 
  AlertTriangle, 
  Volume2, 
  Send,
  Trash2,
  Clock,
  MessageCircle,
  Rss
} from "lucide-react";
import { z } from "zod";

const announcementFormSchema = insertAnnouncementSchema;
const newsTickerFormSchema = insertNewsTickerSchema;

type AnnouncementFormData = z.infer<typeof announcementFormSchema>;
type NewsTickerFormData = z.infer<typeof newsTickerFormSchema>;

export default function AdminAnnouncements() {
  const { toast } = useToast();

  const { data: announcements, isLoading: announcementsLoading } = useQuery({
    queryKey: ["/api/announcements"],
    refetchInterval: 5000,
  });

  const { data: newsTicker, isLoading: newsLoading } = useQuery({
    queryKey: ["/api/news-ticker"],
    refetchInterval: 5000,
  });

  const announcementForm = useForm<AnnouncementFormData>({
    resolver: zodResolver(announcementFormSchema),
    defaultValues: {
      type: "general",
      title: "",
      message: "",
      soundUrl: "",
    },
  });

  const newsForm = useForm<NewsTickerFormData>({
    resolver: zodResolver(newsTickerFormSchema),
    defaultValues: {
      message: "",
    },
  });

  const createAnnouncementMutation = useMutation({
    mutationFn: async (data: AnnouncementFormData) => {
      return apiRequest("POST", "/api/announcements", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Announcement sent successfully",
      });
      announcementForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const createNewsTickerMutation = useMutation({
    mutationFn: async (data: NewsTickerFormData) => {
      return apiRequest("POST", "/api/news-ticker", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news-ticker"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "News ticker updated successfully",
      });
      newsForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteAnnouncementMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/announcements/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/announcements"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "Announcement deleted successfully",
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

  const deleteNewsTickerMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/news-ticker/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/news-ticker"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
      toast({
        title: "Success",
        description: "News ticker item deleted successfully",
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

  const handleAnnouncementSubmit = (data: AnnouncementFormData) => {
    createAnnouncementMutation.mutate(data);
  };

  const handleNewsTickerSubmit = (data: NewsTickerFormData) => {
    createNewsTickerMutation.mutate(data);
  };

  const handleQuickAnnouncement = (type: string, title: string, message: string) => {
    announcementForm.setValue("type", type);
    announcementForm.setValue("title", title);
    announcementForm.setValue("message", message);
    createAnnouncementMutation.mutate({
      type,
      title,
      message,
      soundUrl: "",
    });
  };

  const getAnnouncementIcon = (type: string) => {
    switch (type) {
      case "birthday":
        return <CakeSlice className="w-4 h-4 text-pink-500" />;
      case "emergency":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Megaphone className="w-4 h-4 text-primary" />;
    }
  };

  const getAnnouncementBadge = (type: string) => {
    switch (type) {
      case "birthday":
        return "bg-pink-500 text-white";
      case "emergency":
        return "bg-red-500 text-white";
      default:
        return "bg-primary text-white";
    }
  };

  if (announcementsLoading || newsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Announcement Creator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="w-5 h-5 mr-2" />
            Create Announcement
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={announcementForm.handleSubmit(handleAnnouncementSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="type">Type</Label>
              <Select
                value={announcementForm.watch("type")}
                onValueChange={(value) => announcementForm.setValue("type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General</SelectItem>
                  <SelectItem value="birthday">CakeSlice</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                {...announcementForm.register("title")}
                placeholder="Announcement title"
              />
            </div>

            <div>
              <Label htmlFor="message">Message</Label>
              <Textarea
                id="message"
                {...announcementForm.register("message")}
                placeholder="Your announcement message..."
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="soundUrl">Sound URL (optional)</Label>
              <Input
                id="soundUrl"
                {...announcementForm.register("soundUrl")}
                placeholder="https://example.com/sound.mp3"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={createAnnouncementMutation.isPending}
            >
              <Send className="w-4 h-4 mr-2" />
              Send Announcement
            </Button>
          </form>

          {/* Quick Actions */}
          <div className="mt-6 space-y-2">
            <h4 className="font-semibold text-corporate-800">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAnnouncement("general", "Great Job!", "Keep up the excellent work team!")}
              >
                <Megaphone className="w-4 h-4 mr-1" />
                Encouragement
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAnnouncement("birthday", "Happy CakeSlice!", "Wishing you a wonderful day!")}
              >
                <CakeSlice className="w-4 h-4 mr-1" />
                CakeSlice
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleQuickAnnouncement("emergency", "Important", "Please check your email for important updates.")}
              >
                <AlertTriangle className="w-4 h-4 mr-1" />
                Alert
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Announcements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageCircle className="w-5 h-5 mr-2" />
            Recent Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {announcements?.map((announcement: any) => (
              <div
                key={announcement.id}
                className="p-3 bg-gradient-to-r from-corporate-50 to-blue-50 rounded-lg border flex items-start justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getAnnouncementIcon(announcement.type)}
                    <h4 className="font-semibold text-corporate-800">{announcement.title}</h4>
                    <Badge className={getAnnouncementBadge(announcement.type)}>
                      {announcement.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-corporate-600 mb-2">{announcement.message}</p>
                  <div className="flex items-center space-x-2 text-xs text-corporate-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(announcement.createdAt).toLocaleString()}</span>
                    {announcement.soundUrl && (
                      <div className="flex items-center space-x-1">
                        <Volume2 className="w-3 h-3" />
                        <span>Has Sound</span>
                      </div>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteAnnouncementMutation.mutate(announcement.id)}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
            ))}
            
            {(!announcements || announcements.length === 0) && (
              <div className="text-center py-8 text-corporate-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-corporate-300" />
                <p>No announcements yet</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* News Ticker Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Rss className="w-5 h-5 mr-2" />
            News Ticker
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={newsForm.handleSubmit(handleNewsTickerSubmit)} className="space-y-4">
            <div>
              <Label htmlFor="news-message">News Message</Label>
              <Textarea
                id="news-message"
                {...newsForm.register("message")}
                placeholder="Breaking news or update for the ticker..."
                rows={3}
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-corporate-800 hover:bg-corporate-700"
              disabled={createNewsTickerMutation.isPending}
            >
              <Rss className="w-4 h-4 mr-2" />
              Update Ticker
            </Button>
          </form>

          {/* Active Ticker Items */}
          <div className="mt-6">
            <h4 className="font-semibold text-corporate-800 mb-3">Active Ticker Items</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {newsTicker?.map((item: any) => (
                <div
                  key={item.id}
                  className="p-3 bg-corporate-800 text-white rounded-lg flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="text-sm">{item.message}</p>
                    <p className="text-xs text-gray-300 mt-1">
                      {new Date(item.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteNewsTickerMutation.mutate(item.id)}
                    className="text-white hover:bg-white/20"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              
              {(!newsTicker || newsTicker.length === 0) && (
                <div className="text-center py-4 text-corporate-500">
                  <p className="text-sm">No active ticker items</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Announcement Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                announcementForm.setValue("type", "general");
                announcementForm.setValue("title", "Meeting Reminder");
                announcementForm.setValue("message", "Team meeting starts in 15 minutes in the conference room.");
              }}
            >
              <Clock className="w-4 h-4 mr-2" />
              Meeting Reminder
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                announcementForm.setValue("type", "general");
                announcementForm.setValue("title", "Sales Target Update");
                announcementForm.setValue("message", "We're 85% towards our monthly goal. Great progress team!");
              }}
            >
              <Megaphone className="w-4 h-4 mr-2" />
              Progress Update
            </Button>

            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => {
                announcementForm.setValue("type", "emergency");
                announcementForm.setValue("title", "System Maintenance");
                announcementForm.setValue("message", "Brief system maintenance will occur in 30 minutes.");
              }}
            >
              <AlertTriangle className="w-4 h-4 mr-2" />
              Maintenance Alert
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
