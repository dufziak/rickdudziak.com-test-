import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'react-toastify'; 
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'; 
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'; 
import { Calendar } from '@/components/ui/calendar'; 
import { format } from 'date-fns'; 
import { Trash2, ArrowLeft, Loader2, CheckCircle, XCircle, ArrowRight, Clock, Calendar as CalendarIcon } from 'lucide-react'; 
import { Link } from 'react-router-dom';
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/firebase';
import { cn } from '@/lib/utils';

// Helper component for displaying detail rows in the modal
const DetailRow = ({ title, value, className }) => (
    <div className={cn("flex flex-col space-y-0.5", className)}>
        <span className="text-sm font-medium text-[#a0a0a0]">{title}:</span>
        <span className="text-white break-words">{value || '—'}</span>
    </div>
);

// NEW HELPER FUNCTION to parse the structured solution string
const parseActionSolution = (solutionString) => {
    if (!solutionString || typeof solutionString !== 'string') return { what: null, how: null };

    const whatMatch = solutionString.match(/\[WHAT\]: (.*?) \|/);
    const howMatch = solutionString.match(/\[HOW\]: (.*)/);

    // If it was a simple Step 6 (Act Now) action, it won't have the tags
    if (!solutionString.includes('[WHAT]:')) {
        return { what: solutionString, how: 'N/A (Immediate Action)' };
    }

    let what = whatMatch && whatMatch[1] ? whatMatch[1].trim() : '—';
    let how = howMatch && howMatch[1] ? howMatch[1].trim() : '—';

    // Clean up "Not specified" placeholder
    if (how === 'Not specified') how = '—';

    return { what, how };
};

const WorryTreeApp = ({ currentUser }) => {
  const [worries, setWorries] = useState([]);
  const [currentWorry, setCurrentWorry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  const [step, setStep] = useState(1);
  const [worryType, setWorryType] = useState(null);
  const [activeTab, setActiveTab] = useState('pending');

  // ACTION PLANNING STATE
  const [scheduledAction, setScheduledAction] = useState(''); 
  const [scheduledMethod, setScheduledMethod] = useState(''); 
  const [scheduledDate, setScheduledDate] = useState(''); 
  
  // COGNITIVE RESTRUCTURING STATE
  const [worryEvidence, setWorryEvidence] = useState('');
  const [worryReframe, setWorryReframe] = useState('');

  // DELETE DIALOG STATE
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [worryToDelete, setWorryToDelete] = useState(null);

  // OUTCOME EVALUATION STATE
  const [isReviewingWorry, setIsReviewingWorry] = useState(false);
  const [worryToReview, setWorryToReview] = useState(null);
  const [reviewEffectiveness, setReviewEffectiveness] = useState(5); 
  const [reviewLesson, setReviewLesson] = useState('');

  // NEW STATE FOR DETAILS MODAL
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedWorryForDetails, setSelectedWorryForDetails] = useState(null);

  useEffect(() => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const worriesCollection = collection(db, 'worries');
    const q = query(worriesCollection, where('userId', '==', currentUser.uid));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const fetchedWorries = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setWorries(fetchedWorries);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching real-time worries: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const saveWorry = async (worryText, type, evidence, reframe, solution = null, scheduledDateTime = null) => {
    setIsAdding(true);
    try {
      await addDoc(collection(db, 'worries'), {
        text: worryText,
        type: type,
        evidence: evidence,
        reframe: reframe,
        solution: solution,
        scheduledDateTime: scheduledDateTime,
        userId: currentUser.uid,
        createdAt: new Date(),
        status: 'pending',
      });
      resetFlow();
    } catch (e) {
      console.error("Error adding worry: ", e);
      toast.error("Failed to save worry.");
    } finally {
      setIsAdding(false);
    }
  };

  const confirmDeleteWorry = async (id, worryText) => {
    try {
      await deleteDoc(doc(db, 'worries', id));
      
      setWorryToDelete(null);
      setIsDeleteDialogOpen(false);

      toast.error(`The worry "${worryText}" has been removed.`, { toastId: 'delete-success' });
    } catch (e) {
      console.error("Error deleting worry: ", e);
      toast.error('There was an error deleting your worry.');
    }
  };

  const openDeleteDialog = (worry) => {
      setWorryToDelete(worry);
      setIsDeleteDialogOpen(true);
  };
  
  // OUTCOME EVALUATION: Open Modal
  const openReviewModal = (worry) => {
    setWorryToReview(worry);
    setIsReviewingWorry(true);
    setReviewEffectiveness(5); 
    setReviewLesson('');
  };

  // NEW: Open Details Modal
  const openWorryDetails = (worry) => {
    setSelectedWorryForDetails(worry);
    setIsDetailsModalOpen(true);
  };

  // OUTCOME EVALUATION: Submit Review
  const submitWorryReview = async () => {
    if (!worryToReview) return;

    try {
        const worryRef = doc(db, 'worries', worryToReview.id);
        
        await updateDoc(worryRef, { 
            status: 'completed',
            effectivenessRating: reviewEffectiveness,
            lessonLearned: reviewLesson,
            completedAt: new Date(),
        });

        setIsReviewingWorry(false);
        setWorryToReview(null);
        
        toast.success("Worry reviewed and completed! Great job learning from this experience.");

    } catch (e) {
        console.error("Error completing worry review: ", e);
        toast.error("Failed to save the review and complete the worry.");
    }
  };

  // UPDATED: Logic removed scheduledTime validation and uses date-only for Date object construction
  const handleScheduleWorry = () => {
    // Validate required fields: Action (What) and Date (When)
    if (scheduledAction.trim() !== '' && scheduledDate !== '') {
        
      // Combine structured plan into a single solution string for storage
      const finalSolution = `[WHAT]: ${scheduledAction} | [HOW]: ${scheduledMethod || 'Not specified'}`; 
      
      // Use date string to create Date object (defaults to midnight UTC for that date)
      const scheduledDateTime = new Date(scheduledDate); 
      
      saveWorry(currentWorry, worryType, worryEvidence, worryReframe, finalSolution, scheduledDateTime);
      
      toast.info(`Worry Scheduled! It's filed for ${new Date(scheduledDateTime).toLocaleDateString()}.`);

    } else {
        // Updated warning text
        toast.warn('Please provide the action and date to schedule your worry.');
    }
  };
  
  // UPDATED: resetFlow no longer clears scheduledTime
  const resetFlow = () => {
    setCurrentWorry('');
    setStep(1);
    setWorryType(null);
    setScheduledAction('');
    setScheduledMethod('');
    setScheduledDate('');
    setWorryEvidence('');
    setWorryReframe('');
  };

  const handleBackStep = () => {
    setStep(prevStep => prevStep - 1);
  };
  
  const pendingWorries = worries.filter(worry => worry.status === 'pending');
  const completedWorries = worries.filter(worry => worry.status === 'completed');

  if (isLoading) {
    return (
        <div className="min-h-screen bg-[#121212] flex items-center justify-center">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] animate-spin"></div>
        </div>
    );
  }
  
  // Helper function to handle date selection from the Calendar component
  const handleDateSelect = (dateObject) => {
    if (dateObject) {
      // Set the state as a YYYY-MM-DD string required for the ISO date construction
      setScheduledDate(format(dateObject, 'yyyy-MM-dd')); 
    } else {
      setScheduledDate('');
    }
  };

  return (
    <div className="min-h-screen p-8 relative overflow-hidden">
      <div className="absolute top-8 left-8">
        <Link to="/">
          <Button className="bg-transparent text-[#00ff88] hover:bg-[#1a1a1a] border border-[#333] transition-colors duration-300">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="max-w-xl mx-auto space-y-8"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-[#00ff88]">
            Worry Tree
          </h1>
          <p className="text-[#a0a0a0] mt-2">
            A cognitive behavioral therapy tool to help you manage your worries.
          </p>
        </div>

        {/* Step 1: Input Worry */}
        {step === 1 && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">What's on your mind?</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2">
                <Input
                  type="text"
                  value={currentWorry}
                  onChange={(e) => setCurrentWorry(e.target.value)}
                  placeholder="Write your worry here..."
                  className="flex-1 bg-[#121212] text-white border-none focus:ring-1 focus:ring-[#00ff88]"
                />
                <Button onClick={() => setStep(2)} disabled={!currentWorry.trim()} className="rounded-full bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]">
                  Next <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Start of multi-step flow (Steps 2-7) */}
        {step > 1 && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center mb-2 text-sm text-gray-400">
                {step > 1 && (
                  <motion.button 
                    onClick={handleBackStep}
                    className="flex items-center text-green-400 hover:text-green-500 transition-colors"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                  >
                    <ArrowLeft size={16} className="mr-1" /> Back
                  </motion.button>
                )}
                <span>Step {step - 1} of 6</span> 
              </div>
              {step === 2 && <CardTitle className="text-white">Challenge the Thought</CardTitle>}
              {step === 3 && <CardTitle className="text-white">Is this a worry you can do something about?</CardTitle>}
              {step === 4 && worryType === 'actionable' && <CardTitle className="text-white">Can you take action right now?</CardTitle>}
              {step === 5 && worryType === 'let-it-go' && <CardTitle className="text-white">Acknowledge and Release</CardTitle>}
              {step === 6 && <CardTitle className="text-white">What will you do?</CardTitle>}
              {step === 7 && <CardTitle className="text-white">Schedule It</CardTitle>}
            </CardHeader>
            <CardContent>

              {/* Step 2: Cognitive Restructuring (Evidence and Reframe) */}
              {step === 2 && (
                <div className="space-y-4">
                  <textarea
                    value={worryEvidence}
                    onChange={(e) => setWorryEvidence(e.target.value)}
                    placeholder="List the facts that support your worry, and the facts that disprove it. (Focus on reality, not just feelings.)"
                    className="w-full min-h-[80px] p-2 bg-[#121212] text-white border border-[#333] rounded focus:ring-1 focus:ring-[#00ff88]"
                  />
                  <textarea
                    value={worryReframe}
                    onChange={(e) => setWorryReframe(e.target.value)}
                    placeholder="Write a balanced, realistic alternative thought to replace your original worry."
                    className="w-full min-h-[80px] p-2 bg-[#121212] text-white border border-[#333] rounded focus:ring-1 focus:ring-[#00ff88]"
                  />
                  <Button 
                    onClick={() => setStep(3)} 
                    disabled={!worryEvidence.trim() || !worryReframe.trim()} 
                    className="w-full rounded-full bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]"
                  >
                    Next: Categorize Worry <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              )}

              {/* Step 3: Actionable? */}
              {step === 3 && (
                <div className="flex space-x-2">
                  <Button className="flex-1 rounded-full bg-green-500 hover:bg-green-600" onClick={() => { setWorryType('actionable'); setStep(4); }}>Yes, I can act</Button>
                  <Button className="flex-1 rounded-full bg-red-500 hover:bg-red-600" onClick={() => { setWorryType('let-it-go'); setStep(5); }}>No, I can't</Button>
                </div>
              )}
              
              {/* Step 4: Act Now? */}
              {step === 4 && worryType === 'actionable' && (
                <div className="flex space-x-2">
                  <Button className="flex-1 rounded-full bg-green-500 hover:bg-green-600" onClick={() => setStep(6)}>Yes, Now</Button>
                  <Button className="flex-1 rounded-full bg-blue-500 hover:bg-blue-600" onClick={() => setStep(7)}>No, Later</Button>
                </div>
              )}

              {/* Step 5: Let it Go (Non-actionable) */}
              {step === 5 && worryType === 'let-it-go' && (
                <>
                  <p className="text-[#a0a0a0] mb-4">
                    If you can't do anything about a worry, it's best to acknowledge it and let it go. Focus on your new balanced thought (Reframe).
                  </p>
                  <Button 
                    onClick={() => {
                      saveWorry(currentWorry, worryType, worryEvidence, worryReframe);
                      toast.info("Worry released! Acknowledged and filed away."); 
                    }} 
                    className="w-full rounded-full bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]"
                  >
                    <CheckCircle className="h-5 w-5 mr-2" />
                    I'm Ready to Let It Go
                  </Button>
                </>
              )}
              
              {/* Step 6: Action Plan (Act Now) */}
              {step === 6 && (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const solution = e.target.solution.value;
                  if (solution.trim() !== '') {
                    saveWorry(currentWorry, worryType, worryEvidence, worryReframe, solution);
                    toast.success("Action plan saved! Time to execute.");
                  } else {
                    toast.warn("Please enter a plan before saving.");
                  }
                }} className="flex space-x-2">
                  <Input
                    type="text"
                    name="solution"
                    placeholder="Plan your action..."
                    className="flex-1 bg-[#121212] text-white border-none focus:ring-1 focus:ring-[#00ff88]"
                  />
                  <Button type="submit" disabled={isAdding} className="rounded-full bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]">
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save"}
                  </Button>
                </form>
              )}
              
              {/* Step 7: Schedule It (Structured Action Planning) */}
              {step === 7 && (
                <>
                  <p className="text-[#a0a0a0] mb-4 text-sm">
                    Set a specific date for your action. This planning ensures clarity and commitment.
                  </p>

                  {/* 1. WHAT WILL YOU DO? */}
                  <Input
                      type="text"
                      name="scheduledAction"
                      placeholder="What will you do? (e.g., Email the supervisor)"
                      className="w-full mt-4"
                      value={scheduledAction}
                      onChange={(e) => setScheduledAction(e.target.value)}
                  />

                  {/* 2. WHEN WILL YOU DO IT? */}
                  <div className="mt-4">
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal bg-[#121212] text-white border border-[#333] hover:bg-[#222]",
                                !scheduledDate && "text-gray-400"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {scheduledDate ? (
                                format(new Date(scheduledDate), "PPP")
                            ) : (
                                <span>Pick a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0 bg-[#1e1e1e] border border-[#2a2a2a]">
                          <Calendar
                            mode="single"
                            selected={scheduledDate ? new Date(scheduledDate) : undefined}
                            onSelect={handleDateSelect}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                  </div>

                  {/* 3. HOW WILL YOU DO IT? */}
                  <Input
                      type="text"
                      name="scheduledMethod"
                      placeholder="How will you do it? (e.g., From the coffee shop, first thing in the morning)"
                      className="w-full mt-4"
                      value={scheduledMethod}
                      onChange={(e) => setScheduledMethod(e.target.value)}
                  />

                  <Button 
                    className="w-full rounded-full mt-4 bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]" 
                    onClick={handleScheduleWorry}
                    disabled={isAdding}
                  >
                    {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Okay, I've Scheduled It"}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        )}
        
        {/* Worry List Tabs */}
        <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('pending')}
                className={`flex-1 text-center rounded-t-lg ${activeTab === 'pending' ? 'text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-[#a0a0a0] border-b-2 border-transparent'}`}
              >
                Your Worries
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('completed')}
                className={`flex-1 text-center rounded-t-lg ${activeTab === 'completed' ? 'text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-[#a0a0a0] border-b-2 border-transparent'}`}
              >
                Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'pending' && (
              <motion.div
                key="pending-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {pendingWorries.length === 0 ? (
                  <p className="text-[#a0a0a0] text-center">No pending worries. Add one above!</p>
                ) : (
                  <ul className="space-y-4 max-h-96 overflow-y-auto overflow-x-hidden">
                    <AnimatePresence>
                      {pendingWorries.map((worry) => (
                        <motion.li
                          key={worry.id}
                          onClick={() => openWorryDetails(worry)}
                          className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg shadow-sm transition-all duration-200 hover:bg-[#3a3a3a] cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: -50, transition: { duration: 0.3 } }}
                          transition={{ duration: 0.4 }}
                          layout
                        >
                          <div className="flex-1 space-y-1">
                            <span className="text-white">{worry.text}</span>
                            {worry.type && (
                              <div className="flex items-center text-sm text-[#a0a0a0]">
                                {worry.type === 'actionable' ? (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                                    <p className="text-green-500">Actionable</p>
                                  </>
                                ) : worry.type === 'let-it-go' ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                    <p className="text-red-500">Let it go</p>
                                  </>
                                ) : (
                                  <>
                                    <Clock className="h-4 w-4 mr-2 text-blue-500" />
                                    <p className="text-blue-500">Scheduled</p>
                                  </>
                                )}
                              </div>
                            )}
                            {/* UPDATED: Display structured Action Plan */}
                            {worry.solution && (
                                <div className="text-[#888] text-xs mt-1 space-y-0.5">
                                    <p>What: **{parseActionSolution(worry.solution).what}**</p>
                                    <p>How: {parseActionSolution(worry.solution).how}</p>
                                </div>
                            )}
                             {worry.scheduledDateTime && (
                                <p className="text-[#888] text-xs mt-1">
                                  Scheduled for: {new Date(worry.scheduledDateTime.seconds * 1000).toLocaleDateString()}
                                </p>
                              )}
                          </div>
                          <div className="flex space-x-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {e.stopPropagation(); openReviewModal(worry)}}
                              className="text-[#a0a0a0] hover:text-green-500 transition-colors duration-200"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {e.stopPropagation(); openDeleteDialog(worry)}}
                              className="text-[#a0a0a0] hover:text-red-500 transition-colors duration-200"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </motion.div>
            )}

            {activeTab === 'completed' && (
              <motion.div
                key="completed-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {completedWorries.length === 0 ? (
                  <p className="text-[#a0a0a0] text-center">You haven't completed any worries yet. You're capable of great things!</p>
                ) : (
                  <ul className="space-y-4">
                    <AnimatePresence>
                      {completedWorries.map((worry) => (
                        <motion.li
                          key={worry.id}
                          onClick={() => openWorryDetails(worry)}
                          className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg shadow-sm transition-all duration-200 hover:bg-[#3a3a3a] opacity-60 cursor-pointer"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, x: 50, transition: { duration: 0.3 } }}
                          transition={{ duration: 0.4 }}
                          layout
                        >
                          <div className="flex-1 space-y-1">
                            <span className="text-white line-through">{worry.text}</span>
                            {worry.solution && (
                                <div className="text-[#888] text-xs mt-1 space-y-0.5">
                                    <p>What: **{parseActionSolution(worry.solution).what}**</p>
                                    <p>How: {parseActionSolution(worry.solution).how}</p>
                                </div>
                            )}
                            {worry.lessonLearned && (
                                <p className="text-[#00ff88] text-xs mt-1">
                                    Learned: {worry.lessonLearned} (Rating: {worry.effectivenessRating}/5)
                                </p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {e.stopPropagation(); openDeleteDialog(worry)}}
                            className="text-[#a0a0a0] hover:text-red-500 transition-colors duration-200"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                  </ul>
                )}
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* WORRY DETAILS MODAL */}
      {isDetailsModalOpen && selectedWorryForDetails && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          >
              <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-lg p-6 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-2xl space-y-6 overflow-y-auto max-h-[90vh]"
              >
                  <h2 className="text-2xl font-bold text-[#00ff88]">Worry Details</h2>
                  
                  <div className="space-y-4">
                      <DetailRow title="Worry" value={selectedWorryForDetails.text} className="text-lg font-semibold" />
                      <DetailRow title="Status" value={selectedWorryForDetails.status.charAt(0).toUpperCase() + selectedWorryForDetails.status.slice(1)} />
                      <DetailRow title="Category" value={selectedWorryForDetails.type === 'actionable' ? 'Actionable' : 'Non-Actionable (Let It Go)'} />
                      
                      <h3 className="text-lg font-semibold text-white pt-3 border-t border-[#333]">Cognitive Restructuring</h3>
                      <DetailRow title="Evidence/Facts Check" value={selectedWorryForDetails.evidence} />
                      <DetailRow title="Balanced Reframe" value={selectedWorryForDetails.reframe} />

                      {selectedWorryForDetails.solution && (
                          <div className="pt-3 border-t border-[#333]">
                              <h3 className="text-lg font-semibold text-white">Action Plan</h3>
                              <DetailRow title="What (Action)" value={parseActionSolution(selectedWorryForDetails.solution).what} />
                              <DetailRow title="How (Method)" value={parseActionSolution(selectedWorryForDetails.solution).how} />
                          </div>
                      )}

                      {selectedWorryForDetails.scheduledDateTime && (
                          <DetailRow 
                              title="Scheduled For" 
                              // FIX APPLIED HERE: Used toLocaleDateString() to remove time
                              value={new Date(selectedWorryForDetails.scheduledDateTime.seconds * 1000).toLocaleDateString()} 
                          />
                      )}

                      {selectedWorryForDetails.status === 'completed' && (
                          <div className="pt-3 border-t border-[#333] space-y-2">
                              <h3 className="text-lg font-semibold text-[#00ff88]">Outcome Evaluation</h3>
                              <DetailRow title="Effectiveness Rating" value={`${selectedWorryForDetails.effectivenessRating || 'N/A'}/5`} />
                              <DetailRow title="Lesson Learned" value={selectedWorryForDetails.lessonLearned} />
                              {selectedWorryForDetails.completedAt && (
                                  <DetailRow title="Completed On" value={new Date(selectedWorryForDetails.completedAt.seconds * 1000).toLocaleDateString()} />
                              )}
                          </div>
                      )}
                  </div>
                  
                  <div className="flex justify-end">
                      <Button 
                          onClick={() => {
                            setIsDetailsModalOpen(false);
                            setSelectedWorryForDetails(null);
                          }}
                          className="bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]"
                      >
                          Close
                      </Button>
                  </div>
              </motion.div>
          </motion.div>
      )}


      {/* OUTCOME EVALUATION MODAL */}
      {isReviewingWorry && (
          <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70"
          >
              <motion.div
                  initial={{ scale: 0.9, y: 20 }}
                  animate={{ scale: 1, y: 0 }}
                  className="w-full max-w-lg p-6 bg-[#1e1e1e] border border-[#2a2a2a] rounded-lg shadow-2xl space-y-4"
              >
                  <h2 className="text-xl font-bold text-[#00ff88]">Review Outcome</h2>
                  <p className="text-white">Worry: <span className="font-semibold">{worryToReview?.text}</span></p>

                  <div className="space-y-2">
                      <label className="text-sm font-medium text-[#a0a0a0]">How effective was your plan?</label>
                      <Input
                          type="range"
                          min="1"
                          max="5"
                          step="1"
                          value={reviewEffectiveness}
                          onChange={(e) => setReviewEffectiveness(Number(e.target.value))}
                          className="w-full h-2 bg-[#333] rounded-lg appearance-none cursor-pointer range-lg"
                      />
                      <div className="flex justify-between text-xs text-[#a0a0a0]">
                          <span>1 (Not at all)</span>
                          <span>{reviewEffectiveness} / 5</span>
                          <span>5 (Completely)</span>
                      </div>
                  </div>

                  <div className="space-y-2">
                      <label htmlFor="lesson" className="text-sm font-medium text-[#a0a0a0]">What did you learn from this experience? (CBT Lesson)</label>
                      <textarea
                          id="lesson"
                          value={reviewLesson}
                          onChange={(e) => setReviewLesson(e.target.value)}
                          placeholder="E.g., 'The worry didn't come true,' or 'I am capable of dealing with this.'"
                          className="w-full min-h-[80px] p-2 bg-[#121212] text-white border border-[#333] rounded focus:ring-1 focus:ring-[#00ff88]"
                      />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                      <Button 
                          variant="ghost" 
                          onClick={() => setIsReviewingWorry(false)}
                          className="text-white hover:bg-[#3a3a3a]"
                      >
                          Cancel
                      </Button>
                      <Button 
                          onClick={submitWorryReview}
                          disabled={!reviewLesson.trim()}
                          className="bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]"
                      >
                          Complete & Save Review
                      </Button>
                  </div>
              </motion.div>
          </motion.div>
      )}


      {/* ALERT DIALOG COMPONENT FOR DELETION CONFIRMATION */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-[#1e1e1e] border border-[#2a2a2a] text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-500">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-[#a0a0a0]">
              Are you sure you want to delete this worry? This action cannot be undone.
              <span className="block mt-2 font-bold text-white"> 
                Worry: "{worryToDelete?.text}"
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-transparent text-white border-none hover:bg-[#333]">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => worryToDelete && confirmDeleteWorry(worryToDelete.id, worryToDelete.text)}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!worryToDelete}
            >
              Delete Worry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default WorryTreeApp;