
"use client";

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, Loader2, Send, Sparkles, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { chat } from '@/ai/flows/chat-flow';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

const formSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
});

type Message = {
  role: 'user' | 'model';
  content: string;
};

const samplePrompts = [
    "What are temporary fixes for a large pothole?",
    "How can I safely remove graffiti from a wall?",
    "What are some natural ways to deal with pests in a park?",
    "Suggest ways to improve visibility at a dangerous intersection."
];

export function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      message: '',
    },
  });

  useEffect(() => {
    // Scroll to the bottom when messages change
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (messageText: string) => {
    const userMessage: Message = { role: 'user', content: messageText };
    setMessages((prev) => [...prev, userMessage]);
    setIsThinking(true);
    form.reset();

    try {
      // We only send the last few messages to keep the context relevant
      const chatHistory = messages.slice(-6).map(m => ({
          role: m.role,
          content: m.content
      }));

      const result = await chat({
        history: chatHistory,
        message: messageText,
      });

      const modelMessage: Message = { role: 'model', content: result.response };
      setMessages((prev) => [...prev, modelMessage]);

    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get a response from the chatbot. Please try again.',
      });
       // Remove the user's message optimistic UI if the API call fails
      setMessages(prev => prev.filter(msg => msg.content !== messageText));
    } finally {
      setIsThinking(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    await handleSendMessage(values.message);
  };

  return (
    <Card className="h-[70vh] flex flex-col">
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Bot /> Community Assistant
            </CardTitle>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                    {messages.length === 0 && (
                        <div className="text-center text-muted-foreground pt-8 px-4">
                             <div className="inline-flex items-center bg-chart-4/20 text-yellow-700 font-semibold px-3 py-1 rounded-full text-sm mb-4">
                                <Sparkles className="mr-2 h-4 w-4" />
                                Ask for remedies
                            </div>
                            <p className="mb-6">
                                I'm an AI assistant for Civic Connect. How can I help you find solutions for civic issues?
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-left">
                                {samplePrompts.map((prompt, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleSendMessage(prompt)}
                                        disabled={isThinking}
                                        className="text-sm p-3 border rounded-lg hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {prompt}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                    {messages.map((message, index) => (
                    <div
                        key={index}
                        className={cn(
                        'flex items-start gap-3',
                        message.role === 'user' ? 'justify-end' : 'justify-start'
                        )}
                    >
                        {message.role === 'model' && (
                        <Avatar className="h-8 w-8 border">
                            <AvatarFallback className='bg-primary/10'><Bot className="h-5 w-5 text-primary"/></AvatarFallback>
                        </Avatar>
                        )}
                        <div
                        className={cn(
                            'max-w-md rounded-lg px-4 py-2 text-sm lg:max-w-lg prose',
                            message.role === 'user'
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        )}
                        >
                          <ReactMarkdown
                            components={{
                              p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                              ul: ({ node, ...props }) => <ul className="list-disc list-inside space-y-1" {...props} />,
                              ol: ({ node, ...props }) => <ol className="list-decimal list-inside space-y-1" {...props} />,
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                        </div>
                        {message.role === 'user' && (
                        <Avatar className="h-8 w-8">
                            <AvatarFallback><User className="h-5 w-5"/></AvatarFallback>
                        </Avatar>
                        )}
                    </div>
                    ))}
                    {isThinking && (
                        <div className="flex items-start gap-3 justify-start">
                            <Avatar className="h-8 w-8 border">
                                <AvatarFallback className='bg-primary/10'><Bot className="h-5 w-5 text-primary"/></AvatarFallback>
                            </Avatar>
                            <div className="bg-muted rounded-lg px-4 py-3">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </CardContent>
        <CardFooter className="border-t pt-6">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="flex w-full items-center space-x-2">
                    <FormField
                        control={form.control}
                        name="message"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                                <FormControl>
                                    <Input placeholder="Ask for community improvement ideas..." {...field} autoComplete="off" disabled={isThinking}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                    <Button type="submit" size="icon" disabled={isThinking}>
                        <Send className="h-5 w-5" />
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </Form>
        </CardFooter>
    </Card>
  );
}
