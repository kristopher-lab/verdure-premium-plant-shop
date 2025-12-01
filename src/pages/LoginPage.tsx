import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { toast, Toaster } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { post } from '@/lib/api-client';
import type { User } from '@shared/types';
import { useCartActions } from '@/hooks/use-cart';
import { Leaf, ChevronLeft } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
const loginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters.' }),
});
export default function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { login } = useCartActions();
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: 'test@example.com', password: '' },
  });
  const onSubmit = async (values: z.infer<typeof loginSchema>) => {
    try {
      const { user } = await post<{ user: User, token: string }>('/api/auth/login', values);
      if (user) {
        const guestCartId = localStorage.getItem('verdure-cart-id');
        login(user.id);
        if (guestCartId) {
          await post('/api/cart/merge', { userId: user.id, guestCartId });
          localStorage.removeItem('verdure-cart-id');
        }
        toast.success(`Welcome back, ${user.name || 'plant lover'}!`);
        queryClient.invalidateQueries({ queryKey: ['cart'] });
        navigate('/');
      }
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
    }
  };
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60" role="navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2">
              <Leaf className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-bold font-display text-primary">Verdure</h1>
            </Link>
            <Button asChild variant="ghost" aria-label="Return to main page">
              <Link to="/"><ChevronLeft className="h-4 w-4 mr-2" /> Back to Home</Link>
            </Button>
          </div>
        </div>
      </header>
      <main className="flex-grow flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="py-8 md:py-10 lg:py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            >
              <Card className="mx-auto max-w-sm">
                <CardHeader>
                  <CardTitle className="text-2xl">Login</CardTitle>
                  <CardDescription>Enter your email below to login to your account</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4" aria-label="Login form">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="m@example.com" {...field} aria-label="Email address input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input type="password" {...field} aria-label="Password input" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting} aria-label="Sign in to account">
                        {form.formState.isSubmitting ? 'Logging in...' : 'Login'}
                      </Button>
                    </form>
                  </Form>
                  <div className="mt-4 text-center text-sm">
                    Don't have an account?{' '}
                    <Link to="#" className="underline">
                      Sign up
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
      <Toaster richColors closeButton />
    </div>
  );
}