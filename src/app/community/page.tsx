
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Award, Bot, MessageCircle, Sprout, QrCode } from "lucide-react";
import { ChatBot } from "@/components/community/chat-bot";
import { InspirationTab } from "@/components/community/inspiration-tab";
import { LeaderboardTable } from "@/components/community/leaderboard-table";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function CommunityPage() {
    const whatsAppNumber = process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || "14155238886"; // Default to Twilio sandbox number
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://wa.me/${whatsAppNumber.replace('+', '')}`;

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
                            <CardTitle className="flex items-center gap-2"><MessageCircle /> Report via WhatsApp</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 text-center md:text-left p-8">
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative h-48 w-48 border-4 border-primary/20 rounded-xl p-2 bg-white">
                                    <Image src={qrCodeUrl} alt="WhatsApp QR Code" width={200} height={200} className="rounded-md" />
                                    <div className="absolute -top-4 -left-4 h-10 w-10 bg-white flex items-center justify-center rounded-lg border-2 border-primary/20">
                                       <QrCode className="h-6 w-6 text-primary"/>
                                    </div>
                                </div>
                                 <Button asChild>
                                    <a href={`https://wa.me/${whatsAppNumber.replace('+', '')}`} target="_blank" rel="noopener noreferrer">
                                        Open Chat
                                    </a>
                                </Button>
                            </div>
                            <div className="max-w-md">
                                <h3 className="text-xl font-semibold font-headline mb-2">Scan or Click to Start a Report</h3>
                                <p className="text-muted-foreground mb-4">
                                    Use our dedicated WhatsApp number to report civic issues directly from your phone. It's fast, easy, and you'll get updates on the go.
                                </p>
                                 <p className="font-semibold text-lg mb-4">
                                    Our WhatsApp Number: <span className="text-primary font-bold">{whatsAppNumber}</span>
                                </p>
                                <ol className="list-decimal list-inside text-left space-y-2 text-muted-foreground bg-muted p-4 rounded-md">
                                    <li>Send a <span className="font-semibold text-foreground">photo</span> of the issue.</li>
                                    <li>Add a short <span className="font-semibold text-foreground">description</span> in the message.</li>
                                    <li>(Optional) Share your <span className="font-semibold text-foreground">location</span> for accuracy.</li>
                                </ol>
                            </div>
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
