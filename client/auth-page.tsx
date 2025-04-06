import { useEffect } from "react";
import { useLocation } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Helmet } from "react-helmet-async";

// Login form schema
const loginSchema = z.object({
  username: z.string().min(1, "Username is required"),
  password: z.string().min(1, "Password is required"),
});

// Registration form schema
const registerSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["buyer", "seller"]),
  name: z.string().min(1, "Name is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

export default function AuthPage() {
  const [location, setLocation] = useLocation();
  const { user, loginMutation, registerMutation } = useAuth();
  
  // Get signup parameter from URL
  const params = new URLSearchParams(location.includes('?') ? location.split('?')[1] : '');
  const signupParam = params.get('signup');
  const initialTab = signupParam ? "register" : "login";

  // If already logged in, redirect to home page
  useEffect(() => {
    if (user) {
      setLocation("/");
    }
  }, [user, setLocation]);

  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  // Registration form
  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: signupParam === "seller" ? "seller" : "buyer",
      name: "",
    },
  });

  // Handle login form submission
  const onLoginSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  // Handle registration form submission
  const onRegisterSubmit = (data: RegisterFormValues) => {
    registerMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <Helmet>
        <title>Login or Register | VintoHub</title>
      </Helmet>
      
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-8">
        {/* Auth form column */}
        <div className="flex flex-col justify-center">
          <Tabs defaultValue={initialTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Sign Up</TabsTrigger>
            </TabsList>

            {/* Login Form */}
            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
                  <CardDescription>
                    Enter your credentials to access your account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username or Email</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="Enter your username or email" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Enter your password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={loginMutation.isPending}
                      >
                        {loginMutation.isPending ? "Logging in..." : "Login"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Don't have an account?{" "}
                    <button 
                      type="button" 
                      className="text-primary-600 hover:underline"
                      onClick={() => { 
                        const el = document.querySelector('[data-state="inactive"][data-value="register"]');
                        if (el && 'click' in el) (el as HTMLElement).click();
                      }}
                    >
                      Sign up
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>

            {/* Registration Form */}
            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle className="text-2xl font-bold">Create an account</CardTitle>
                  <CardDescription>
                    Join VintoHub to browse, buy, or sell unique products
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter your name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="username"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Username</FormLabel>
                            <FormControl>
                              <Input placeholder="Choose a username" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input 
                                type="email" 
                                placeholder="Enter your email" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input 
                                type="password" 
                                placeholder="Create a password" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Account Type</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select account type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="buyer">Buyer</SelectItem>
                                <SelectItem value="seller">Seller</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button 
                        type="submit" 
                        className="w-full" 
                        disabled={registerMutation.isPending}
                      >
                        {registerMutation.isPending ? "Creating account..." : "Create Account"}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
                <CardFooter className="flex justify-center border-t pt-4">
                  <p className="text-sm text-gray-500">
                    Already have an account?{" "}
                    <button 
                      type="button" 
                      className="text-primary-600 hover:underline"
                      onClick={() => { 
                        const el = document.querySelector('[data-state="inactive"][data-value="login"]');
                        if (el && 'click' in el) (el as HTMLElement).click();
                      }}
                    >
                      Login
                    </button>
                  </p>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Hero column */}
        <div className="hidden md:flex flex-col bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-8 text-white shadow-xl justify-center">
          <div className="max-w-md mx-auto">
            <h1 className="text-3xl font-bold font-poppins mb-4">VintoHub</h1>
            <p className="text-xl mb-6 font-medium">Thrift. Craft. Repeat.</p>
            <div className="space-y-6">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-tshirt"></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Thrifted Treasures</h3>
                  <p className="text-sm text-white/80">Find unique pre-loved items that tell a story</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-paint-brush"></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Handcrafted Goods</h3>
                  <p className="text-sm text-white/80">Shop unique items made with love and creativity</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 rounded-full h-10 w-10 flex items-center justify-center flex-shrink-0">
                  <i className="fas fa-store"></i>
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Sell Your Creations</h3>
                  <p className="text-sm text-white/80">Start your shop and share your passion with the world</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
