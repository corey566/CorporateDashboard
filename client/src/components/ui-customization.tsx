import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  Palette, 
  Type, 
  Layout, 
  Settings, 
  Monitor, 
  Zap,
  Eye,
  Volume2,
  Clock,
  Sparkles,
  Accessibility
} from "lucide-react";

const uiCustomizationSchema = z.object({
  primaryColor: z.string().min(1, "Primary color is required"),
  secondaryColor: z.string().min(1, "Secondary color is required"),
  accentColor: z.string().min(1, "Accent color is required"),
  fontSize: z.number().min(10).max(24).default(16),
  fontFamily: z.string().min(1, "Font family is required"),
  cardStyle: z.enum(["minimal", "rounded", "shadow", "gradient"]),
  animationSpeed: z.number().min(0.5).max(3).default(1),
  newsTickerSpeed: z.number().min(10).max(100).default(50),
  autoSlideInterval: z.number().min(10).max(300).default(30),
  soundEnabled: z.boolean().default(true),
  highContrast: z.boolean().default(false),
  largeText: z.boolean().default(false),
  reducedMotion: z.boolean().default(false),
});

type UICustomizationData = z.infer<typeof uiCustomizationSchema>;

export default function UICustomization() {
  const [activeTab, setActiveTab] = useState("colors");
  const [previewMode, setPreviewMode] = useState(false);
  const { toast } = useToast();

  const form = useForm<UICustomizationData>({
    resolver: zodResolver(uiCustomizationSchema),
    defaultValues: {
      primaryColor: "#1e40af",
      secondaryColor: "#64748b",
      accentColor: "#10b981",
      fontSize: 16,
      fontFamily: "Inter",
      cardStyle: "rounded",
      animationSpeed: 1,
      newsTickerSpeed: 50,
      autoSlideInterval: 30,
      soundEnabled: true,
      highContrast: false,
      largeText: false,
      reducedMotion: false,
    },
  });

  const handleSubmit = (data: UICustomizationData) => {
    // Apply CSS custom properties
    const root = document.documentElement;
    root.style.setProperty('--primary-color', data.primaryColor);
    root.style.setProperty('--secondary-color', data.secondaryColor);
    root.style.setProperty('--accent-color', data.accentColor);
    root.style.setProperty('--font-size', `${data.fontSize}px`);
    root.style.setProperty('--font-family', data.fontFamily);
    root.style.setProperty('--animation-speed', `${data.animationSpeed}s`);
    
    // Apply accessibility settings
    if (data.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }
    
    if (data.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }
    
    if (data.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Save to localStorage
    localStorage.setItem('ui-customization', JSON.stringify(data));
    
    toast({
      title: "UI Settings Updated",
      description: "Your customization settings have been applied successfully.",
    });
  };

  const resetToDefaults = () => {
    form.reset();
    localStorage.removeItem('ui-customization');
    
    // Reset CSS custom properties
    const root = document.documentElement;
    root.style.removeProperty('--primary-color');
    root.style.removeProperty('--secondary-color');
    root.style.removeProperty('--accent-color');
    root.style.removeProperty('--font-size');
    root.style.removeProperty('--font-family');
    root.style.removeProperty('--animation-speed');
    root.classList.remove('high-contrast', 'large-text', 'reduced-motion');
    
    toast({
      title: "Settings Reset",
      description: "UI customization has been reset to default values.",
    });
  };

  const previewColors = [
    { name: "Corporate Blue", primary: "#1e40af", secondary: "#64748b", accent: "#10b981" },
    { name: "Modern Purple", primary: "#7c3aed", secondary: "#6b7280", accent: "#f59e0b" },
    { name: "Professional Green", primary: "#059669", secondary: "#4b5563", accent: "#ef4444" },
    { name: "Elegant Dark", primary: "#1f2937", secondary: "#6b7280", accent: "#8b5cf6" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center">
              <Sparkles className="w-5 h-5 mr-2" />
              UI Customization
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? "Exit Preview" : "Preview"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetToDefaults}
              >
                Reset to Defaults
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-5">
                <TabsTrigger value="colors">Colors</TabsTrigger>
                <TabsTrigger value="typography">Typography</TabsTrigger>
                <TabsTrigger value="layout">Layout</TabsTrigger>
                <TabsTrigger value="behavior">Behavior</TabsTrigger>
                <TabsTrigger value="accessibility">Accessibility</TabsTrigger>
              </TabsList>
              
              <TabsContent value="colors" className="space-y-4">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold flex items-center">
                      <Palette className="w-5 h-5 mr-2" />
                      Color Scheme
                    </h3>
                    
                    <div className="space-y-3">
                      <div>
                        <Label htmlFor="primaryColor">Primary Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="primaryColor"
                            type="color"
                            {...form.register("primaryColor")}
                            className="w-12 h-10"
                          />
                          <Input
                            {...form.register("primaryColor")}
                            placeholder="#1e40af"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="secondaryColor">Secondary Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="secondaryColor"
                            type="color"
                            {...form.register("secondaryColor")}
                            className="w-12 h-10"
                          />
                          <Input
                            {...form.register("secondaryColor")}
                            placeholder="#64748b"
                            className="flex-1"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor="accentColor">Accent Color</Label>
                        <div className="flex items-center space-x-2">
                          <Input
                            id="accentColor"
                            type="color"
                            {...form.register("accentColor")}
                            className="w-12 h-10"
                          />
                          <Input
                            {...form.register("accentColor")}
                            placeholder="#10b981"
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Color Presets</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {previewColors.map((preset) => (
                        <div
                          key={preset.name}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                          onClick={() => {
                            form.setValue("primaryColor", preset.primary);
                            form.setValue("secondaryColor", preset.secondary);
                            form.setValue("accentColor", preset.accent);
                          }}
                        >
                          <div className="flex items-center space-x-2 mb-2">
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.secondary }}
                            />
                            <div
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: preset.accent }}
                            />
                          </div>
                          <p className="text-sm font-medium">{preset.name}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="typography" className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Type className="w-5 h-5 mr-2" />
                  Typography Settings
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="fontSize">Font Size</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[form.watch("fontSize")]}
                        onValueChange={(value) => form.setValue("fontSize", value[0])}
                        max={24}
                        min={10}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>10px</span>
                        <span>{form.watch("fontSize")}px</span>
                        <span>24px</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="fontFamily">Font Family</Label>
                    <Select
                      value={form.watch("fontFamily")}
                      onValueChange={(value) => form.setValue("fontFamily", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Poppins">Poppins</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="layout" className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Layout className="w-5 h-5 mr-2" />
                  Layout & Style
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="cardStyle">Card Style</Label>
                    <Select
                      value={form.watch("cardStyle")}
                      onValueChange={(value) => form.setValue("cardStyle", value as any)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select card style" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="rounded">Rounded</SelectItem>
                        <SelectItem value="shadow">Shadow</SelectItem>
                        <SelectItem value="gradient">Gradient</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="animationSpeed">Animation Speed</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[form.watch("animationSpeed")]}
                        onValueChange={(value) => form.setValue("animationSpeed", value[0])}
                        max={3}
                        min={0.5}
                        step={0.1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>0.5x</span>
                        <span>{form.watch("animationSpeed")}x</span>
                        <span>3x</span>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="behavior" className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Behavior Settings
                </h3>
                
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="newsTickerSpeed">News Ticker Speed</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[form.watch("newsTickerSpeed")]}
                        onValueChange={(value) => form.setValue("newsTickerSpeed", value[0])}
                        max={100}
                        min={10}
                        step={5}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Slow</span>
                        <span>{form.watch("newsTickerSpeed")}%</span>
                        <span>Fast</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="autoSlideInterval">Auto-slide Interval (seconds)</Label>
                    <div className="space-y-2">
                      <Slider
                        value={[form.watch("autoSlideInterval")]}
                        onValueChange={(value) => form.setValue("autoSlideInterval", value[0])}
                        max={300}
                        min={10}
                        step={10}
                        className="w-full"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>10s</span>
                        <span>{form.watch("autoSlideInterval")}s</span>
                        <span>5min</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="soundEnabled"
                      checked={form.watch("soundEnabled")}
                      onCheckedChange={(checked) => form.setValue("soundEnabled", checked)}
                    />
                    <Label htmlFor="soundEnabled" className="flex items-center">
                      <Volume2 className="w-4 h-4 mr-2" />
                      Sound Effects
                    </Label>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="accessibility" className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center">
                  <Accessibility className="w-5 h-5 mr-2" />
                  Accessibility Features
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="highContrast"
                      checked={form.watch("highContrast")}
                      onCheckedChange={(checked) => form.setValue("highContrast", checked)}
                    />
                    <Label htmlFor="highContrast">High Contrast Mode</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="largeText"
                      checked={form.watch("largeText")}
                      onCheckedChange={(checked) => form.setValue("largeText", checked)}
                    />
                    <Label htmlFor="largeText">Large Text</Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reducedMotion"
                      checked={form.watch("reducedMotion")}
                      onCheckedChange={(checked) => form.setValue("reducedMotion", checked)}
                    />
                    <Label htmlFor="reducedMotion">Reduced Motion</Label>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <div className="flex justify-end space-x-2">
              <Button type="submit" className="bg-primary hover:bg-primary/90">
                Apply Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}