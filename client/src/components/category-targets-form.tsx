import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Target } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CategoryTarget {
  categoryId: number;
  categoryName?: string;
  volumeTarget: number;
  unitsTarget: number;
}

interface CategoryTargetsFormProps {
  entityType: 'agent' | 'team';
  entityId: number | null;
  initialTargets?: CategoryTarget[];
  onTargetsChange: (targets: CategoryTarget[]) => void;
}

export default function CategoryTargetsForm({ 
  entityType, 
  entityId, 
  initialTargets = [], 
  onTargetsChange 
}: CategoryTargetsFormProps) {
  const [targets, setTargets] = useState<CategoryTarget[]>(initialTargets);
  const { toast } = useToast();

  const { data: categories = [] } = useQuery({
    queryKey: ["/api/categories"],
  });

  // Update targets when initialTargets change
  useEffect(() => {
    setTargets(initialTargets);
  }, [initialTargets]);

  // Notify parent when targets change
  useEffect(() => {
    onTargetsChange(targets);
  }, [targets, onTargetsChange]);

  const addTarget = () => {
    const availableCategories = categories.filter(
      cat => !targets.some(target => target.categoryId === cat.id)
    );
    
    if (availableCategories.length === 0) {
      toast({
        title: "No Categories Available",
        description: "All categories already have targets assigned.",
        variant: "destructive",
      });
      return;
    }

    const newTarget: CategoryTarget = {
      categoryId: availableCategories[0].id,
      categoryName: availableCategories[0].name,
      volumeTarget: 0,
      unitsTarget: 0,
    };

    setTargets(prev => [...prev, newTarget]);
  };

  const removeTarget = (index: number) => {
    setTargets(prev => prev.filter((_, i) => i !== index));
  };

  const updateTarget = (index: number, field: keyof CategoryTarget, value: any) => {
    setTargets(prev => prev.map((target, i) => 
      i === index 
        ? { 
            ...target, 
            [field]: value,
            ...(field === 'categoryId' ? {
              categoryName: categories.find(cat => cat.id === value)?.name
            } : {})
          }
        : target
    ));
  };

  const getTotalTargets = () => {
    return targets.reduce((acc, target) => ({
      volume: acc.volume + target.volumeTarget,
      units: acc.units + target.unitsTarget,
    }), { volume: 0, units: 0 });
  };

  const totals = getTotalTargets();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Category Targets
        </CardTitle>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <div>Total Volume: <Badge variant="secondary">${totals.volume.toLocaleString()}</Badge></div>
          <div>Total Units: <Badge variant="secondary">{totals.units}</Badge></div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {targets.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No category targets set</p>
            <p className="text-sm">Add targets for different categories</p>
          </div>
        ) : (
          <div className="space-y-4">
            {targets.map((target, index) => (
              <Card key={index} className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={target.categoryId.toString()}
                      onValueChange={(value) => updateTarget(index, 'categoryId', parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {categories
                          .filter(cat => 
                            cat.id === target.categoryId || 
                            !targets.some(t => t.categoryId === cat.id)
                          )
                          .map((category) => (
                            <SelectItem key={category.id} value={category.id.toString()}>
                              {category.name}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Volume Target ($)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={target.volumeTarget}
                      onChange={(e) => updateTarget(index, 'volumeTarget', parseFloat(e.target.value) || 0)}
                      placeholder="0.00"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Units Target</Label>
                    <Input
                      type="number"
                      min="0"
                      value={target.unitsTarget}
                      onChange={(e) => updateTarget(index, 'unitsTarget', parseInt(e.target.value) || 0)}
                      placeholder="0"
                    />
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTarget(index)}
                    className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}

        <Button
          type="button"
          variant="outline"
          onClick={addTarget}
          className="w-full"
          disabled={targets.length >= categories.length}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Category Target
        </Button>
      </CardContent>
    </Card>
  );
}