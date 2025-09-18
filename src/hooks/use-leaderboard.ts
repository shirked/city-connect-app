
"use client";

import { useState, useEffect } from 'react';
import type { Report, User } from '@/lib/types';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, Timestamp } from 'firebase/firestore';

interface LeaderboardUser {
    userId: string;
    name: string | null;
    reportCount: number;
    score: number;
}

const SCORE_CONFIG = {
    Resolved: 10,
    'In Progress': 5,
    Submitted: 1,
};

export const useLeaderboard = () => {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);

        // We need to listen to both users and reports collections
        const usersUnsubscribe = onSnapshot(collection(db, 'users'), (usersSnapshot) => {
            const usersMap = new Map<string, User>();
            usersSnapshot.forEach(doc => {
                usersMap.set(doc.id, { id: doc.id, ...doc.data() } as User);
            });

            const reportsQuery = query(collection(db, 'reports'));
            const reportsUnsubscribe = onSnapshot(reportsQuery, (reportsSnapshot) => {
                const userScores: { [userId: string]: { reportCount: number, score: number } } = {};

                // Initialize scores for all known users to handle users with 0 reports
                usersMap.forEach(user => {
                    if (!userScores[user.id]) {
                        userScores[user.id] = { reportCount: 0, score: 0 };
                    }
                });

                reportsSnapshot.forEach(doc => {
                    const report = doc.data() as Omit<Report, 'id' | 'createdAt' | 'history'> & {
                        createdAt: Timestamp;
                        history: { status: string; date: Timestamp; notes: string }[];
                    };
                    
                    const userId = report.userId;
                    if (!userId) return;

                    // Ensure user score object exists if a report exists for a user not in the users collection yet
                    if (!userScores[userId]) {
                        userScores[userId] = { reportCount: 0, score: 0 };
                    }

                    userScores[userId].reportCount += 1;
                    userScores[userId].score += SCORE_CONFIG[report.status] || 0;
                });

                const rankedUsers: LeaderboardUser[] = Object.entries(userScores)
                    .map(([userId, data]) => ({
                        userId,
                        name: usersMap.get(userId)?.name || 'Anonymous',
                        reportCount: data.reportCount,
                        score: data.score,
                    }))
                    .sort((a, b) => b.score - a.score || b.reportCount - a.reportCount)
                    .slice(0, 10); // Top 10 users

                setLeaderboardData(rankedUsers);
                if(isLoading) setIsLoading(false);
            }, (error) => {
                console.error("Error fetching reports for leaderboard:", error);
                setIsLoading(false);
            });

            // Return the nested unsubscribe function
            return () => reportsUnsubscribe();

        }, (error) => {
            console.error("Error fetching users for leaderboard:", error);
            setIsLoading(false);
        });

        // Return the top-level unsubscribe function
        return () => usersUnsubscribe();
    }, []);

    return { leaderboardData, isLoading };
};
