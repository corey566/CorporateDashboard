import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useCurrency } from "@/hooks/use-currency";

interface DailyTargetsTableProps {
  teams: any[];
}

export default function DailyTargetsTable({ teams }: DailyTargetsTableProps) {
  const { formatCurrency } = useCurrency();

  // Calculate working days in current month (excluding weekends)
  const calculateWorkingDaysInMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    
    // Get first and last day of current month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    let workingDays = 0;
    for (let day = new Date(firstDay); day <= lastDay; day.setDate(day.getDate() + 1)) {
      // Skip weekends (Saturday = 6, Sunday = 0)
      if (day.getDay() !== 0 && day.getDay() !== 6) {
        workingDays++;
      }
    }
    
    return workingDays;
  };

  const workingDays = calculateWorkingDaysInMonth();
  const currentMonth = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="w-full">
      <div className="bg-card rounded-2xl border-2 border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-primary/10 p-4 border-b-2 border-border">
          <h2 className="text-2xl font-black text-foreground text-center">
            DAILY TARGETS - {currentMonth.toUpperCase()}
          </h2>
          <p className="text-lg font-bold text-muted-foreground text-center">
            {workingDays} Working Days
          </p>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 border-b-2 border-border">
              <TableHead className="text-2xl font-black text-foreground py-2 px-4">
                TEAM
              </TableHead>
              <TableHead className="text-2xl font-black text-foreground py-2 px-4 text-center">
                DAILY VOLUME
              </TableHead>
              <TableHead className="text-2xl font-black text-foreground py-2 px-4 text-center">
                DAILY UNITS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((team: any, index: number) => {
              // Calculate daily targets
              const monthlyVolumeTarget = parseFloat(team.volumeTarget || "0");
              const monthlyUnitsTarget = parseInt(team.unitsTarget || "0");
              
              const dailyVolumeTarget = monthlyVolumeTarget / workingDays;
              const dailyUnitsTarget = monthlyUnitsTarget / workingDays;

              return (
                <TableRow
                  key={team.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    index % 2 === 0 ? "bg-background" : "bg-muted/10"
                  }`}
                >
                  {/* Team Info */}
                  <TableCell className="py-2 px-4">
                    <div className="flex items-center space-x-3">
                      <div 
                        className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                        style={{ backgroundColor: team.color }}
                      ></div>
                      <div>
                        <div className="text-xl font-black text-foreground">
                          {team.name}
                        </div>
                        <div className="text-sm font-bold text-muted-foreground">
                          Monthly: {formatCurrency(team.volumeTarget)} / {team.unitsTarget} units
                        </div>
                      </div>
                    </div>
                  </TableCell>

                  {/* Daily Volume */}
                  <TableCell className="py-2 px-4 text-center">
                    <div className="text-xl font-black text-foreground">
                      {formatCurrency(dailyVolumeTarget.toFixed(2))}
                    </div>
                  </TableCell>

                  {/* Daily Units */}
                  <TableCell className="py-2 px-4 text-center">
                    <div className="text-xl font-black text-foreground">
                      {Math.round(dailyUnitsTarget)}
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}