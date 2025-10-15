import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from "date-fns";
import { ArrowLeft, BrainCircuit, Zap, Leaf, Trash2, CalendarClock, Wind, Calendar as CalendarIcon, ChevronsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      type: 'spring',
      stiffness: 100,
      damping: 15,
    },
  },
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.3 } },
};

const WorryHistoryList = ({ worries, deleteWorry }) => {
    return (
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="mt-6"
        >
            <div className="flex items-center justify-center gap-2 mb-4">
                <ChevronsDown className="h-5 w-5 text-gray-400" />
                <h3 className="text-lg font-semibold text-white text-center">Your Worry History</h3>
            </div>
            <ul className="space-y-3 max-h-60 overflow-y-auto pr-2">
                <AnimatePresence>
                    {worries.map((w) => (
                        <motion.li
                            key={w.id}
                            layout
                            initial={{ opacity: 0, x: -30 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 50, transition: { duration: 0.2 } }}
                            className="bg-black/20 border border-transparent hover:border-gray-700 p-3 rounded-md flex items-start gap-3 transition-all"
                        >
                            <div className="flex-shrink-0 mt-1">
                                {w.type === 'action' ? (
                                    <Zap className="h-5 w-5 text-yellow-400" />
                                ) : w.type === 'letGo' ? (
                                    <Leaf className="h-5 w-5 text-green-400" />
                                ) : (
                                    <CalendarClock className="h-5 w-5 text-blue-400" />
                                )}
                            </div>
                            <div className="flex-grow">
                                <p className="font-semibold text-white">{w.text}</p>
                                <p className="text-sm text-[#b0b0b0] mt-1 italic">Outcome: {w.outcome}</p>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => deleteWorry(w.id)} className="text-[#888] hover:text-red-500 h-8 w-8 flex-shrink-0">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </motion.li>
                    ))}
                </AnimatePresence>
            </ul>
        </motion.div>
    );
};

const WorryTreeApp = () => {
  const [step, setStep] = useState('start');
  const [worry, setWorry] = useState('');
  const [action, setAction] = useState('');
  const [scheduledDate, setScheduledDate] = useState();
  const [scheduledTime, setScheduledTime] = useState('');
  const [scheduledAction, setScheduledAction] = useState('');
  const [worries, setWorries] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedWorries = localStorage.getItem('worries');
      if (storedWorries) {
        setWorries(JSON.parse(storedWorries));
      }
    } catch (error) {
      console.error("Failed to parse worries from localStorage", error);
      setWorries([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('worries', JSON.stringify(worries));
  }, [worries]);
  
  const handleFinish = (outcomeType, outcomeText) => {
    const newWorry = {
        id: Date.now(),
        text: worry,
        outcome: outcomeText,
        type: outcomeType,
    };
    setWorries([newWorry, ...worries]);
    setWorry('');
    setAction('');
    setScheduledDate();
    setScheduledTime('');
    setScheduledAction('');
    setStep('start');
    toast({
        title: "Worry Processed",
        description: "Your worry has been logged.",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
    });
  };
  
  const deleteWorry = (id) => {
    setWorries(worries.filter((w) => w.id !== id));
    toast({
        title: "Worry Removed",
        description: "The worry has been deleted from your list.",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
    });
  };

  const resetCurrentWorry = () => {
    setWorry('');
    setAction('');
    setScheduledDate();
    setScheduledTime('');
    setScheduledAction('');
    setStep('start');
  };

  const handleScheduleFinish = () => {
    let outcome = 'Scheduled for later.';
    if (scheduledDate || scheduledTime) {
      const datePart = scheduledDate ? `for ${format(scheduledDate, "PPP")}` : '';
      const timePart = scheduledTime ? `at ${scheduledTime}` : '';
      outcome = `Scheduled ${datePart} ${timePart}.`;
    }
    if (scheduledAction) {
        outcome += ` Action: ${scheduledAction}`;
    }
    handleFinish('scheduled', outcome);
  };

  const renderStep = () => {
    switch (step) {
      case 'start':
        return (
          <motion.div key="start" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
            <Label htmlFor="worry-input" className="text-white">What are you worrying about?</Label>
            <Input
              id="worry-input"
              type="text"
              value={worry}
              onChange={(e) => setWorry(e.target.value)}
              placeholder="e.g., I have a big presentation tomorrow..."
              className="mt-2 mb-4"
            />
            <Button onClick={() => setStep('actionable')} disabled={!worry} className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-black font-semibold">
              Continue
            </Button>
            {worries.length > 0 && <WorryHistoryList worries={worries} deleteWorry={deleteWorry} />}
          </motion.div>
        );
      case 'actionable':
        return (
          <motion.div key="actionable" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <p className="text-white mb-4 text-center">Is this a worry you can do something about?</p>
            <div className="flex gap-4">
              <Button onClick={() => setStep('timing')} className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold">
                Yes
              </Button>
              <Button onClick={() => setStep('letGoPrompt')} className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold">
                No
              </Button>
            </div>
          </motion.div>
        );
      case 'letGoPrompt':
        return (
          <motion.div key="letGoPrompt" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center w-full">
            <Wind className="h-10 w-10 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-white mb-2">Let It Go</h3>
            <p className="text-[#b0b0b0] mb-6">Some things are outside of our control. By acknowledging this, you can free your mind from the burden of this worry.</p>
            <Button onClick={() => handleFinish('letGo', 'Acknowledged and let go.')} className="w-full bg-green-500 hover:bg-green-600">
              I Understand
            </Button>
          </motion.div>
        );
      case 'timing':
        return (
          <motion.div key="timing" variants={containerVariants} initial="hidden" animate="visible" exit="exit">
            <p className="text-white mb-4 text-center">Can you take action right now?</p>
            <div className="flex gap-4">
              <Button onClick={() => setStep('planNow')} className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-black font-semibold">
                Yes, Now
              </Button>
              <Button onClick={() => setStep('planLater')} className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold">
                No, Later
              </Button>
            </div>
          </motion.div>
        );
      case 'planNow':
        return (
          <motion.div key="planNow" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="w-full">
            <Label htmlFor="action-input" className="text-white">What is one small step you can take right now?</Label>
            <Input
              id="action-input"
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="e.g., Review my notes for 15 minutes..."
              className="mt-2 mb-4"
            />
             <div className="flex gap-4">
                <Button onClick={() => handleFinish('action', action)} disabled={!action} className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-black font-semibold">
                    Create Action Plan
                </Button>
                 <Button onClick={resetCurrentWorry} variant="outline" className="w-full">
                    Cancel
                </Button>
            </div>
          </motion.div>
        );
      case 'planLater':
        return (
            <motion.div key="planLater" variants={containerVariants} initial="hidden" animate="visible" exit="exit" className="text-center w-full">
                <CalendarClock className="h-10 w-10 text-blue-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Schedule It</h3>
                <p className="text-[#b0b0b0] mb-4">Set a specific date and/or time to deal with this. Once scheduled, let the worry go until then.</p>
                <div className="flex flex-col gap-4 mb-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="w-full text-left">
                            <Label htmlFor="schedule-date" className="text-white/70 text-xs">Date</Label>
                            <Popover>
                                <PopoverTrigger asChild>
                                    <Button
                                    variant={"outline"}
                                    className={cn(
                                        "w-full justify-start text-left font-normal mt-1",
                                        !scheduledDate && "text-muted-foreground"
                                    )}
                                    >
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {scheduledDate ? format(scheduledDate, "PPP") : <span>Pick a date</span>}
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border-[#2a2a2a]">
                                    <Calendar
                                    mode="single"
                                    selected={scheduledDate}
                                    onSelect={setScheduledDate}
                                    initialFocus
                                    />
                                </PopoverContent>
                            </Popover>
                        </div>
                        <div className="w-full text-left">
                            <Label htmlFor="schedule-time" className="text-white/70 text-xs">Time</Label>
                            <Input id="schedule-time" type="time" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)} className="mt-1" />
                        </div>
                    </div>
                    <div className="w-full text-left">
                        <Label htmlFor="scheduled-action" className="text-white/70 text-xs">Action to take</Label>
                         <Input
                            id="scheduled-action"
                            type="text"
                            value={scheduledAction}
                            onChange={(e) => setScheduledAction(e.target.value)}
                            placeholder="e.g., Call the bank"
                            className="mt-1"
                        />
                    </div>
                </div>
                <Button onClick={handleScheduleFinish} className="w-full mt-2" disabled={!scheduledDate && !scheduledTime && !scheduledAction}>
                    Okay, I've Scheduled It
                </Button>
            </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#121212]">
       <div className="max-w-md mx-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
            <Button onClick={() => navigate('/')} variant="ghost" className="mb-6 text-[#e0e0e0] hover:text-white hover:bg-[#2a2a2a]">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
            </Button>
        </motion.div>

        <Card className="w-full mb-8">
            <CardHeader>
            <div className="flex justify-center items-center gap-3">
                <BrainCircuit className="h-8 w-8 text-[#00ff88]" />
                <CardTitle className="text-3xl text-center">The Worry Tree</CardTitle>
            </div>
            <CardDescription className="text-center pt-2">A CBT tool to navigate your thoughts.</CardDescription>
            </CardHeader>
            <CardContent>
              <AnimatePresence mode="wait">
                {renderStep()}
              </AnimatePresence>
            </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WorryTreeApp;