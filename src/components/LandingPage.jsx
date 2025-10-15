import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, Lock, Loader2, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/firebase';

const LandingPage = () => {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your projects...",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: `Error: ${error.code}`,
        className: "bg-[#1e1e1e] text-white border-red-500",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUp = async () => {
    setIsSigningUp(true);
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      await signInWithEmailAndPassword(auth, email, password);
      
      toast({
        title: "Account Created!",
        description: "Your new account has been created and you are now logged in. Redirecting to your projects...",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Sign-up Failed",
        description: `Error: ${error.code}`,
        className: "bg-[#1e1e1e] text-white border-red-500",
      });
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-grid-[#1a1a1a]/[0.2]">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-md w-full"
      >
        <div className="bg-[#1e1e1e] rounded-xl p-8 sm:p-12 shadow-2xl border border-[#2a2a2a]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-center space-y-8"
          >
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                Member Login
              </h1>
              <p className="text-[#a0a0a0]">
                Access your projects dashboard.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-[#c0c0c0]">Email</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666]" />
                  <Input 
                    type="email" 
                    id="email" 
                    placeholder="name@example.com" 
                    required 
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-[#c0c0c0]">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666]" />
                  <Input 
                    type="password" 
                    id="password"
                    placeholder="••••••••"
                    required 
                    className="pl-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>
              
              <motion.div
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="pt-4"
              >
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#121212] font-semibold px-8 py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#00ff88]/20"
                >
                  {isLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <>
                      Login
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </motion.div>
            </form>
            
            {/* New section for Sign-up */}
            <div className="flex items-center space-x-2 justify-center mt-4">
              <span className="text-sm text-[#a0a0a0]">Don't have an account?</span>
              <Button
                variant="link"
                onClick={handleSignUp}
                disabled={isSigningUp}
                className="text-[#00ff88] hover:text-[#00dd77] px-0"
              >
                {isSigningUp ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-2" />
                    Sign up
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;