import { LoginForm } from '@/components/auth/login-form';
import { SignupForm } from '@/components/auth/signup-form';
import { AppLogo } from '@/components/icons/app-logo';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function LoginPage() {
  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-2 text-primary">
        <AppLogo className="h-8 w-8" />
        <h1 className="text-4xl font-bold font-headline">Civic Connect</h1>
      </div>
      <p className="text-muted-foreground max-w-sm text-center">
        Report issues, track progress, and help improve your city. Create an
        account or log in to get started.
      </p>
      <Tabs defaultValue="login" className="w-[400px]">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Log In</TabsTrigger>
          <TabsTrigger value="signup">Sign Up</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card className="border-none shadow-none">
            <CardContent className="p-2 pt-6">
              <LoginForm />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="signup">
          <Card className="border-none shadow-none">
            <CardContent className="p-2 pt-6">
              <SignupForm />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
