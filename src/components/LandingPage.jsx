import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User, Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';

const LandingPage = ({ onLogin }) => {
  const { toast } = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const loginSuccess = onLogin(username, password);

    if (loginSuccess) {
      toast({
        title: "Login Successful!",
        description: "Welcome back! Redirecting to your projects...",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
      });
    } else {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: "Invalid username or password. Please try again.",
        className: "bg-[#1e1e1e] text-white border-red-500",
      });
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

            <form onSubmit={handleFormSubmit} className="space-y-6 text-left">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium text-[#c0c0c0]">Username</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#666]" />
                  <Input 
                    type="text" 
                    id="username" 
                    placeholder="rickdudziak" 
                    required 
                    className="pl-10"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
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
                  className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#121212] font-semibold px-8 py-6 text-lg rounded-lg transition-all duration-300 shadow-lg hover:shadow-[#00ff88]/20"
                >
                  Login
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </motion.div>
            </form>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default LandingPage;