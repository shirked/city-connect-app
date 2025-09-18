
"use client";

import { useLeaderboard } from "@/hooks/use-leaderboard";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Loader2, Crown, Shield, Star, Medal } from "lucide-react";
import { Badge } from "../ui/badge";

const getTitle = (rank: number) => {
    if (rank === 1) return { title: "Community Champion", icon: <Crown className="h-4 w-4 text-yellow-500" />, color: "border-yellow-500 bg-yellow-500/10 text-yellow-600" };
    if (rank === 2) return { title: "Civic Hero", icon: <Shield className="h-4 w-4 text-gray-400" />, color: "border-gray-400 bg-gray-400/10 text-gray-500" };
    if (rank === 3) return { title: "Impact Maker", icon: <Star className="h-4 w-4 text-orange-400" />, color: "border-orange-400 bg-orange-400/10 text-orange-500" };
    return { title: "Active Citizen", icon: <Medal className="h-4 w-4 text-blue-400" />, color: "border-blue-400 bg-blue-400/10 text-blue-500" };
};

export function LeaderboardTable() {
    const { leaderboardData, isLoading } = useLeaderboard();

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="ml-4 text-muted-foreground">Calculating Leaderboard...</p>
            </div>
        );
    }

    if (leaderboardData.length === 0) {
        return (
            <div className="text-center py-10">
                <h3 className="text-lg font-semibold">No data for the leaderboard yet.</h3>
                <p className="text-muted-foreground mt-2">Be the first to submit a report and get on the board!</p>
            </div>
        );
    }

    return (
        <div className="border rounded-lg">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-[80px]">Rank</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Title</TableHead>
                        <TableHead className="text-right">Reports</TableHead>
                        <TableHead className="text-right">Score</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {leaderboardData.map((user, index) => {
                        const rank = index + 1;
                        const { title, icon, color } = getTitle(rank);
                        const name = user.name || 'Anonymous';
                        return (
                            <TableRow key={user.userId}>
                                <TableCell className="font-bold text-lg">{rank}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <Avatar className="h-9 w-9">
                                            <AvatarFallback>{name.charAt(0).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <span className="font-medium">{name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant="outline" className={color}>
                                        {icon}
                                        <span>{title}</span>
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">{user.reportCount}</TableCell>
                                <TableCell className="text-right font-semibold">{user.score}</TableCell>
                            </TableRow>
                        );
                    })}
                </TableBody>
            </Table>
        </div>
    );
}
