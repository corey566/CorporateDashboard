import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "@/components/theme-provider";
import { 
  Palette, 
  Type, 
  Moon, 
  Sun, 
  Settings, 
  Monitor,
  Image,
  Upload,
  Trash2,
  Eye,
  Check,
  X,
  RefreshCw,
  Building,
  DollarSign
} from "lucide-react";
import CurrencySettings from "./currency-settings";
import { z } from "zod";

const uiCustomizationSchema = z.object({
  companyName: z.string().min(1, "Company name is required"),
  logoUrl: z.string().optional(),
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  backgroundColor: z.string().min(1, "Background color is required"),
  accentColor: z.string().min(1, "Accent color is required"),
  fontFamily: z.string().min(1, "Font family is required"),
  fontSize: z.string().min(1, "Font size is required"),
  enableHighContrast: z.boolean(),
  enableReducedMotion: z.boolean(),
  dashboardDuration: z.number().min(5).max(300).default(30),
});

type UICustomizationData = z.infer<typeof uiCustomizationSchema>;

export default function UICustomization() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  const { data: systemSettings } = useQuery({
    queryKey: ["/api/system-settings"],
    refetchInterval: 5000,
  });

  const { data: files } = useQuery({
    queryKey: ["/api/files"],
    refetchInterval: 5000,
  });

  const form = useForm<UICustomizationData>({
    resolver: zodResolver(uiCustomizationSchema),
    defaultValues: {
      companyName: systemSettings?.find((s: any) => s.key === "companyName")?.value || "Sales Dashboard",
      logoUrl: systemSettings?.find((s: any) => s.key === "logoUrl")?.value || "",
      primaryColor: systemSettings?.find((s: any) => s.key === "primaryColor")?.value || "#3B82F6",
      secondaryColor: systemSettings?.find((s: any) => s.key === "secondaryColor")?.value || "#64748B",
      backgroundColor: systemSettings?.find((s: any) => s.key === "backgroundColor")?.value || "#FFFFFF",
      accentColor: systemSettings?.find((s: any) => s.key === "accentColor")?.value || "#10B981",
      fontFamily: systemSettings?.find((s: any) => s.key === "fontFamily")?.value || "Inter, sans-serif",
      fontSize: systemSettings?.find((s: any) => s.key === "fontSize")?.value || "16px",
      dashboardDuration: parseInt(systemSettings?.find((s: any) => s.key === "dashboardDuration")?.value) || 30,
      enableHighContrast: systemSettings?.find((s: any) => s.key === "enableHighContrast")?.value === "true",
      enableReducedMotion: systemSettings?.find((s: any) => s.key === "enableReducedMotion")?.value === "true",
    },
  });

  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      const existingSetting = systemSettings?.find((s: any) => s.key === key);
      if (existingSetting) {
        return apiRequest("PUT", `/api/system-settings/${key}`, { value });
      } else {
        return apiRequest("POST", "/api/system-settings", { key, value, type: "string" });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      toast({
        title: "Success",
        description: "UI settings updated successfully",
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

  const handleSubmit = async (data: UICustomizationData) => {
    // Update all settings
    for (const [key, value] of Object.entries(data)) {
      await updateSettingMutation.mutateAsync({ 
        key, 
        value: typeof value === 'boolean' ? value.toString() : value 
      });
    }

    // Apply theme changes immediately
    applyThemeChanges(data);
  };

  const applyThemeChanges = (data: UICustomizationData) => {
    const root = document.documentElement;
    
    // Apply colors
    root.style.setProperty('--primary', data.primaryColor);
    root.style.setProperty('--secondary', data.secondaryColor);
    root.style.setProperty('--background', data.backgroundColor);
    root.style.setProperty('--accent', data.accentColor);
    
    // Apply typography
    root.style.setProperty('--font-family', data.fontFamily);
    root.style.setProperty('--font-size', data.fontSize);
    
    // Store in localStorage for persistence
    localStorage.setItem("ui-customization", JSON.stringify(data));
  };

  const handleColorChange = (field: keyof UICustomizationData, value: string) => {
    form.setValue(field, value);
    if (isPreviewMode) {
      applyPreviewStyles(field, value);
    }
  };

  const applyPreviewStyles = (field: string, value: string) => {
    const root = document.documentElement;
    switch (field) {
      case 'primaryColor':
        root.style.setProperty('--primary', value);
        break;
      case 'secondaryColor':
        root.style.setProperty('--secondary', value);
        break;
      case 'backgroundColor':
        root.style.setProperty('--background', value);
        break;
      case 'accentColor':
        root.style.setProperty('--accent', value);
        break;
    }
  };

  const resetToDefaults = () => {
    form.reset();
    const root = document.documentElement;
    root.style.removeProperty('--primary');
    root.style.removeProperty('--secondary');
    root.style.removeProperty('--background');
    root.style.removeProperty('--accent');
    root.style.removeProperty('--font-family');
    root.style.removeProperty('--font-size');
    
    toast({
      title: "Reset Complete",
      description: "All settings have been reset to defaults",
    });
  };

  const togglePreview = () => {
    setIsPreviewMode(!isPreviewMode);
    if (!isPreviewMode) {
      const data = form.getValues();
      applyThemeChanges(data);
    }
  };

  const imageFiles = files?.filter((file: any) => file.type === 'image') || [];

  return (
    <div className="space-y-6">
      {/* Currency Settings */}
      <CurrencySettings />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            UI Customization & Theme Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Theme Selection */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Theme Mode</Label>
              <div className="grid grid-cols-3 gap-4">
                <Button
                  type="button"
                  variant={theme === "light" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="w-4 h-4" />
                  Light
                </Button>
                <Button
                  type="button"
                  variant={theme === "dark" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => setTheme("dark")}
                >
                  <Moon className="w-4 h-4" />
                  Dark
                </Button>
                <Button
                  type="button"
                  variant={theme === "system" ? "default" : "outline"}
                  className="flex items-center gap-2"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="w-4 h-4" />
                  System
                </Button>
              </div>
            </div>

            {/* Company Branding */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Building className="w-4 h-4" />
                Company Branding
              </Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Company Name</Label>
                  <Input
                    {...form.register("companyName")}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Logo URL</Label>
                  <Input
                    {...form.register("logoUrl")}
                    placeholder="Enter logo URL or select from uploaded files"
                  />
                </div>
                {imageFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select from uploaded files</Label>
                    <div className="grid grid-cols-4 gap-2">
                      {imageFiles.map((file: any) => (
                        <div
                          key={file.id}
                          className="relative cursor-pointer border-2 border-dashed border-gray-300 rounded-lg p-2 hover:border-primary transition-colors"
                          onClick={() => {
                            const logoUrl = `/uploads/${file.filename}`;
                            form.setValue("logoUrl", logoUrl);
                            setLogoPreview(logoUrl);
                          }}
                        >
                          <img
                            src={`/uploads/${file.filename}`}
                            alt={file.originalName}
                            className="w-full h-16 object-contain rounded"
                          />
                          <p className="text-xs text-center mt-1 truncate">{file.originalName}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {(logoPreview || form.watch("logoUrl")) && (
                  <div className="space-y-2">
                    <Label>Logo Preview</Label>
                    <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-800">
                      <img
                        src={logoPreview || form.watch("logoUrl")}
                        alt="Logo preview"
                        className="h-16 object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Color Palette */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Palette className="w-4 h-4" />
                Color Palette
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Primary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={form.watch("primaryColor")}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={form.watch("primaryColor")}
                      onChange={(e) => handleColorChange("primaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Secondary Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={form.watch("secondaryColor")}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={form.watch("secondaryColor")}
                      onChange={(e) => handleColorChange("secondaryColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Background Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={form.watch("backgroundColor")}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={form.watch("backgroundColor")}
                      onChange={(e) => handleColorChange("backgroundColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Accent Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={form.watch("accentColor")}
                      onChange={(e) => handleColorChange("accentColor", e.target.value)}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={form.watch("accentColor")}
                      onChange={(e) => handleColorChange("accentColor", e.target.value)}
                      className="flex-1"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Typography */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Type className="w-4 h-4" />
                Typography
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Font Family</Label>
                  <Select
                    value={form.watch("fontFamily")}
                    onValueChange={(value) => form.setValue("fontFamily", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                      <SelectItem value="Roboto, sans-serif">Roboto</SelectItem>
                      <SelectItem value="Open Sans, sans-serif">Open Sans</SelectItem>
                      <SelectItem value="Lato, sans-serif">Lato</SelectItem>
                      <SelectItem value="Montserrat, sans-serif">Montserrat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Font Size</Label>
                  <Select
                    value={form.watch("fontSize")}
                    onValueChange={(value) => form.setValue("fontSize", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="14px">Small (14px)</SelectItem>
                      <SelectItem value="16px">Medium (16px)</SelectItem>
                      <SelectItem value="18px">Large (18px)</SelectItem>
                      <SelectItem value="20px">Extra Large (20px)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Dashboard Settings */}
            <div className="space-y-4">
              <Label className="text-base font-semibold flex items-center gap-2">
                <Monitor className="w-4 h-4" />
                Dashboard Settings
              </Label>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Dashboard Display Duration</Label>
                  <div className="flex items-center gap-4">
                    <Input
                      type="number"
                      min="5"
                      max="300"
                      value={form.watch("dashboardDuration")}
                      onChange={(e) => form.setValue("dashboardDuration", parseInt(e.target.value) || 30)}
                      className="w-24"
                    />
                    <span className="text-sm text-muted-foreground">seconds</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    How long the main dashboard displays before transitioning to media slides (5-300 seconds)
                  </p>
                </div>
              </div>
            </div>

            {/* Accessibility */}
            <div className="space-y-4">
              <Label className="text-base font-semibold">Accessibility Options</Label>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>High Contrast Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("enableHighContrast")}
                    onCheckedChange={(checked) => form.setValue("enableHighContrast", checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <Label>Reduced Motion</Label>
                    <p className="text-sm text-muted-foreground">
                      Reduce animations and transitions
                    </p>
                  </div>
                  <Switch
                    checked={form.watch("enableReducedMotion")}
                    onCheckedChange={(checked) => form.setValue("enableReducedMotion", checked)}
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={updateSettingMutation.isPending}
                className="flex-1"
              >
                {updateSettingMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={togglePreview}
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPreviewMode ? "Exit Preview" : "Preview Changes"}
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={resetToDefaults}
              >
                <X className="w-4 h-4 mr-2" />
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}