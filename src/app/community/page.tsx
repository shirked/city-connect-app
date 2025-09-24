
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Bot, MessageCircle, Sprout } from "lucide-react";
import { ChatBot } from "@/components/community/chat-bot";
import { InspirationTab } from "@/components/community/inspiration-tab";
import { LeaderboardTable } from "@/components/community/leaderboard-table";

export default function CommunityPage() {
    return (
        <div className="container py-8 md:py-12">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight font-headline">Community Hub</h1>
                <p className="text-muted-foreground">Engage with your community and city officials.</p>
            </div>

            <Tabs defaultValue="rewards" className="w-full">
                <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 h-auto">
                    <TabsTrigger value="rewards"><Award className="mr-2" /> Rewards</TabsTrigger>
                    <TabsTrigger value="whatsapp"><MessageCircle className="mr-2" /> WhatsApp</TabsTrigger>
                    <TabsTrigger value="inspiration"><Sprout className="mr-2" /> Inspiration</TabsTrigger>
                    <TabsTrigger value="chatbot"><Bot className="mr-2" /> Chat Bot</TabsTrigger>
                </TabsList>

                <TabsContent value="rewards">
                    <Card>
                        <CardHeader>
                            <CardTitle>Rewards & Leaderboard</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <LeaderboardTable />
                        </CardContent>
                    </Card>
                </TabsContent>
                 <TabsContent value="whatsapp">
                    <Card>
                        <CardHeader>
                            <CardTitle>WhatsApp API Integration</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>This section will provide information on how to report issues and receive updates via WhatsApp. (Coming soon)</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="inspiration">
                   <InspirationTab />
                </TabsContent>
                <TabsContent value="chatbot">
                   <ChatBot />
                </TabsContent>
            </Tabs>
        </div>
    );
}
