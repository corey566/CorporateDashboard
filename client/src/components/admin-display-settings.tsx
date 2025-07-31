import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Volume2, TestTube, Settings } from "lucide-react";

export default function AdminDisplaySettings() {
  const [testMessage, setTestMessage] = useState("");
  const [lastTestMessage, setLastTestMessage] = useState("");

  const testVoiceAlert = (message: string, teamName = "Test Team") => {
    const fullMessage = `Daily target not achieved for team ${teamName}. ${message}`;
    setLastTestMessage(fullMessage);
    
    // Text-to-speech alert
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(fullMessage);
      utterance.rate = 0.8;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    } else {
      alert("Speech synthesis not supported in this browser");
    }
  };

  const predefinedTests = [
    {
      name: "Behind Schedule - Volume",
      message: "Volume target at 65%, Units target at 80%"
    },
    {
      name: "Behind Schedule - Units", 
      message: "Volume target at 95%, Units target at 60%"
    },
    {
      name: "Critical Alert",
      message: "Volume target at 45%, Units target at 50%. Immediate action required!"
    },
    {
      name: "End of Day Warning",
      message: "Working hours ending soon. Volume target at 70%, Units target at 75%"
    }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="w-5 h-5" />
            Voice Alert Testing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Test Buttons */}
          <div>
            <Label className="text-base font-semibold mb-3 block">Quick Test Scenarios</Label>
            <div className="grid grid-cols-2 gap-3">
              {predefinedTests.map((test, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => testVoiceAlert(test.message)}
                  className="justify-start h-auto p-3 text-left"
                >
                  <div>
                    <div className="font-semibold text-sm">{test.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {test.message.substring(0, 40)}...
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Custom Test Message */}
          <div className="space-y-3">
            <Label htmlFor="test-message" className="text-base font-semibold">
              Custom Test Message
            </Label>
            <div className="flex gap-2">
              <Input
                id="test-message"
                placeholder="Enter custom warning message..."
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                className="flex-1"
              />
              <Button
                onClick={() => {
                  if (testMessage.trim()) {
                    testVoiceAlert(testMessage);
                    setTestMessage("");
                  }
                }}
                disabled={!testMessage.trim()}
                className="px-6"
              >
                <Volume2 className="w-4 h-4 mr-2" />
                Test Voice
              </Button>
            </div>
          </div>

          {/* Last Test Result */}
          {lastTestMessage && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-semibold text-red-700 dark:text-red-300">
                    Last Test Message:
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-400 mt-1">
                    "{lastTestMessage}"
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Alert Settings Info */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Settings className="w-4 h-4" />
              <span className="font-semibold text-sm">Current Alert Settings</span>
            </div>
            <div className="text-sm text-muted-foreground space-y-1">
              <div>• Working Hours: 9:00 AM - 5:00 PM</div>
              <div>• Alert Time: 4:00 PM (if targets not met)</div>
              <div>• Voice alerts trigger when volume or units progress &lt; 90%</div>
              <div>• Alerts check every hour during working hours</div>
            </div>
          </div>

          {/* Test Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="text-sm">
              <div className="font-semibold text-blue-700 dark:text-blue-300 mb-2">
                Testing Instructions:
              </div>
              <ul className="text-blue-600 dark:text-blue-400 space-y-1 text-xs">
                <li>• Click any quick test button to hear a predefined warning message</li>
                <li>• Use custom message field to test specific scenarios</li>
                <li>• Ensure your device volume is audible</li>
                <li>• Voice alerts use browser's speech synthesis API</li>
                <li>• In production, alerts trigger automatically based on target progress</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}