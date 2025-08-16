import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Crown, TrendingUp, Target } from "lucide-react";
import { useCurrency } from "@/hooks/use-currency";
import { useState, useEffect } from "react";

interface TeamLeaderboardProps {
  teams: any[];
  agents: any[];
}

export default function TeamLeaderboard({
  teams,
  agents,
}: TeamLeaderboardProps) {
  const { formatCurrency } = useCurrency();
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);

  // Team carousel functionality - cycles all teams every 6 seconds
  const [carouselOffset, setCarouselOffset] = useState(0);

  // Calculate team performance based on agents' data
  const teamPerformance = teams
    .map((team, index) => {
      const teamAgents = agents.filter((agent) => agent.teamId === team.id);
      const totalSales = teamAgents.reduce(
        (sum, agent) => sum + parseFloat(agent.currentVolume || 0),
        0,
      );
      const targetSales = teamAgents.reduce(
        (sum, agent) => sum + parseFloat(agent.volumeTarget || 0),
        0,
      );
      const percentage = targetSales > 0 ? (totalSales / targetSales) * 100 : 0;

      return {
        ...team,
        totalSales,
        targetSales,
        percentage,
        memberCount: teamAgents.length,
        rank: index + 1,
      };
    })
    .sort((a, b) => b.totalSales - a.totalSales);

  useEffect(() => {
    // Only start carousel if we have more than 2 teams
    if (teamPerformance.length <= 2) {
      setIsAutoScrolling(false);
      return;
    }

    setIsAutoScrolling(true);
    console.log("Starting team carousel with", teamPerformance.length, "teams");

    const cycleTeams = () => {
      setCarouselOffset((prevOffset) => {
        const nextOffset = (prevOffset + 1) % teamPerformance.length;
        console.log(
          `Team carousel cycling: offset ${prevOffset} -> ${nextOffset}`,
        );
        console.log(
          "Team order:",
          teamPerformance
            .map((team, i) => {
              const position =
                (i - nextOffset + teamPerformance.length) %
                teamPerformance.length;
              return `${team.name} (pos: ${position})`;
            })
            .join(", "),
        );
        return nextOffset;
      });
    };

    // Start cycling immediately, then every 6 seconds
    const intervalId = setInterval(cycleTeams, 6000);
    console.log("Team carousel started - cycling every 6 seconds");

    return () => {
      console.log("Cleaning up team carousel");
      clearInterval(intervalId);
      setIsAutoScrolling(false);
    };
  }, [teamPerformance.length]);

  // Reorder the entire team list based on carousel offset
  const getTeamOrder = () => {
    if (teamPerformance.length <= 2) return teamPerformance;

    // Rotate the entire team list by the offset
    const rotatedTeams = [];
    for (let i = 0; i < teamPerformance.length; i++) {
      const sourceIndex = (i + carouselOffset) % teamPerformance.length;
      rotatedTeams.push(teamPerformance[sourceIndex]);
    }

    console.log(
      "Current team order:",
      rotatedTeams.map((t) => t.name).join(" -> "),
    );
    return rotatedTeams;
  };

  const getTeamIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-4 h-4 text-warning" />;
      case 2:
        return <TrendingUp className="w-4 h-4 text-accent" />;
      default:
        return <Target className="w-4 h-4 text-primary" />;
    }
  };

  const getTeamBadgeColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-primary text-white";
      case 2:
        return "bg-accent text-white";
      case 3:
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getTeamGradient = (rank: number) => {
    switch (rank) {
      case 1:
        return "from-blue-50 to-indigo-50 border-blue-100";
      case 2:
        return "from-green-50 to-emerald-50 border-green-100";
      case 3:
        return "from-purple-50 to-pink-50 border-purple-100";
      default:
        return "from-gray-50 to-slate-50 border-gray-100";
    }
  };

  return (
    <div className="h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-foreground mb-2">
              TEAM SCOREBOARD
            </h2>
            {/* <div className="text-sm font-bold text-muted-foreground">
              Live Team Rankings • Team Carousel • {teamPerformance.length} teams
            </div> */}
          </div>
          {isAutoScrolling && (
            <div className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
              {/* <span className="text-lg font-black">Team Carousel</span>
              <div className="text-md font-bold ml-2">
                Offset: {carouselOffset}/{teamPerformance.length}
              </div> */}
            </div>
          )}
        </div>
      </div>

      <div className="space-y-3 h-[calc(100%-80px)] overflow-y-auto carousel-container carousel-transition">
        {getTeamOrder().map((team, index) => (
          <div
            key={`team-${team.id}-${carouselOffset}-${index}`}
            className={`bg-card border-2 border-border rounded-xl p-4 shadow-lg carousel-row carousel-transition ${team.rank === 1 ? "ring-2 ring-primary/50 bg-primary/5" : ""}`}
          >
            {/* Team Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${getTeamBadgeColor(team.rank)}`}
                >
                  #{team.rank}
                </div>
                <div>
                  <h3 className="font-black text-xl text-foreground">
                    {team.name}
                  </h3>
                  <p className="text-l font-semibold text-muted-foreground">
                    {team.memberCount} Players
                  </p>
                </div>
              </div>
              <div className="text-lg">
                {team.rank === 1 ? (
                  <Crown className="w-6 h-6 text-yellow-500" />
                ) : team.rank === 2 ? (
                  <TrendingUp className="w-6 h-6 text-green-500" />
                ) : (
                  <Target className="w-6 h-6 text-blue-500" />
                )}
              </div>
            </div>

            {/* Team Stats */}
            <div className="text-center">
              <div
                className={`text-3xl font-black mb-1 ${team.rank === 1 ? "text-primary" : team.rank === 2 ? "text-accent" : "text-purple-500"}`}
              >
                {formatCurrency(team.totalSales)}
              </div>
              <div className="text-xl font-semibold text-muted-foreground mb-1">
                Target: {formatCurrency(team.targetSales)}
              </div>
              <div
                className={`text-lg font-black ${team.rank === 1 ? "text-primary" : team.rank === 2 ? "text-accent" : "text-purple-500"}`}
              >
                {team.percentage.toFixed(0)}% COMPLETE
              </div>
            </div>

            {/* Performance Bar */}
            <div className="mt-3">
              <div className="w-full bg-muted rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    team.rank === 1
                      ? "bg-primary"
                      : team.rank === 2
                        ? "bg-accent"
                        : "bg-purple-500"
                  }`}
                  style={{ width: `${Math.min(100, team.percentage)}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
