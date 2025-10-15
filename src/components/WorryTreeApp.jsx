import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';
import { db } from '@/firebase';

const WorryTreeApp = ({ currentUser }) => {
  const [worries, setWorries] = useState([]);
  const [currentWorry, setCurrentWorry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  
  // New state variables for the CBT flow and tabs
  const [step, setStep] = useState(1); // 1: Initial input, 2: Actionable question, 3: "Right now?" question, 4: Action or Let go, 5: Schedule it
  const [worryType, setWorryType] = useState(null); // 'actionable' or 'non-actionable'
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'completed'

  // New state for scheduled worries
  const [scheduledSolution, setScheduledSolution] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  // Load worries from Firestore on component mount or user change
  useEffect(() => {
    const fetchWorries = async () => {
      if (!currentUser) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        const q = query(collection(db, 'worries'), where('userId', '==', currentUser.uid));
        const querySnapshot = await getDocs(q);
        const fetchedWorries = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setWorries(fetchedWorries);
      } catch (e) {
        console.error("Error fetching worries: ", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorries();
  }, [currentUser]);

  // Function to save the final worry to the database
  const saveWorry = async (worryText, type, solution = null, scheduledDateTime = null) => {
    setIsAdding(true);
    try {
      const docRef = await addDoc(collection(db, 'worries'), {
        text: worryText,
        type: type,
        solution: solution,
        scheduledDateTime: scheduledDateTime,
        userId: currentUser.uid,
        createdAt: new Date(),
        status: 'pending', // Set initial status
      });
      setWorries([...worries, { id: docRef.id, text: worryText, type: type, solution: solution, scheduledDateTime: scheduledDateTime, status: 'pending' }]);
      resetFlow();
    } catch (e) {
      console.error("Error adding worry: ", e);
    } finally {
      setIsAdding(false);
    }
  };

  const deleteWorry = async (id) => {
    try {
      await deleteDoc(doc(db, 'worries', id));
      setWorries(worries.filter((worry) => worry.id !== id));
    } catch (e) {
      console.error("Error deleting worry: ", e);
    }
  };

  const completeWorry = async (id) => {
    try {
      const worryRef = doc(db, 'worries', id);
      await updateDoc(worryRef, { status: 'completed' });
      setWorries(worries.map(worry => worry.id === id ? { ...worry, status: 'completed' } : worry));
    } catch (e) {
      console.error("Error completing worry: ", e);
    }
  };

  const handleScheduleWorry = () => {
    if (scheduledSolution.trim() !== '' && scheduledDate !== '' && scheduledTime !== '') {
      const scheduledDateTime = new Date(`${scheduledDate}T${scheduledTime}`);
      saveWorry(currentWorry, 'scheduled', scheduledSolution, scheduledDateTime);
    }
  };
  
  const resetFlow = () => {
    setCurrentWorry('');
    setStep(1);
    setWorryType(null);
    setScheduledSolution('');
    setScheduledDate('');
    setScheduledTime('');
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
            Write down your worries to deal with them later.
          </p>
        </div>

        {step === 1 && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Add a New Worry</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); if (currentWorry.trim() !== '') setStep(2); }} className="flex space-x-2">
                <Input
                  type="text"
                  value={currentWorry}
                  onChange={(e) => setCurrentWorry(e.target.value)}
                  placeholder="Write your worry here..."
                  className="flex-1 bg-[#121212] text-white border-none focus:ring-1 focus:ring-[#00ff88]"
                />
                <Button type="submit" className="bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]">
                  <Plus className="h-5 w-5 mr-2" /> Add
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === 2 && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Is this a worry you can do something about?</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-2">
              <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => { setWorryType('actionable'); setStep(3); }}>Yes</Button>
              <Button className="flex-1 bg-red-500 hover:bg-red-600" onClick={() => { setWorryType('non-actionable'); setStep(4); }}>No</Button>
            </CardContent>
          </Card>
        )}

        {step === 3 && worryType === 'actionable' && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Can you take action right now?</CardTitle>
            </CardHeader>
            <CardContent className="flex space-x-2">
              <Button className="flex-1 bg-green-500 hover:bg-green-600" onClick={() => setStep(5)}>Yes, Now</Button>
              <Button className="flex-1 bg-blue-500 hover:bg-blue-600" onClick={() => setStep(6)}>No, Later</Button>
            </CardContent>
          </Card>
        )}
        
        {step === 4 && worryType === 'non-actionable' && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Let it go.</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#a0a0a0] mb-4">
                This is a worry you can't do anything about. There is no solution.
              </p>
              <Button onClick={() => saveWorry(currentWorry, worryType)} className="w-full bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]">
                <CheckCircle className="h-5 w-5 mr-2" />
                Done
              </Button>
            </CardContent>
          </Card>
        )}

        {step === 5 && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">What will you do?</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => {
                e.preventDefault();
                const solution = e.target.solution.value;
                if (solution.trim() !== '') {
                  saveWorry(currentWorry, worryType, solution);
                }
              }} className="flex space-x-2">
                <Input
                  type="text"
                  name="solution"
                  placeholder="Plan your action..."
                  className="flex-1 bg-[#121212] text-white border-none focus:ring-1 focus:ring-[#00ff88]"
                />
                <Button type="submit" disabled={isAdding} className="bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]">
                  {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Save"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
        
        {step === 6 && (
          <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
            <CardHeader>
              <CardTitle className="text-white">Schedule It</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-[#a0a0a0] mb-4 text-sm">
                Set a specific date and/or time to deal with this. Once scheduled, let the worry go until then.
              </p>
              <div className="flex space-x-2">
                <Input type="date" className="flex-1" value={scheduledDate} onChange={(e) => setScheduledDate(e.target.value)}/>
                <Input type="time" className="flex-1" value={scheduledTime} onChange={(e) => setScheduledTime(e.target.value)}/>
              </div>
              <Input
                type="text"
                name="solution"
                placeholder="e.g., Call the bank"
                className="w-full mt-4"
                value={scheduledSolution}
                onChange={(e) => setScheduledSolution(e.target.value)}
              />
              <Button className="w-full mt-4 bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]" onClick={handleScheduleWorry}>
                Okay, I've Scheduled It
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center space-x-2">
              <Button
                variant="ghost"
                onClick={() => setActiveTab('pending')}
                className={`flex-1 text-center ${activeTab === 'pending' ? 'text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-[#a0a0a0] border-b-2 border-transparent'}`}
              >
                Your Worries
              </Button>
              <Button
                variant="ghost"
                onClick={() => setActiveTab('completed')}
                className={`flex-1 text-center ${activeTab === 'completed' ? 'text-[#00ff88] border-b-2 border-[#00ff88]' : 'text-[#a0a0a0] border-b-2 border-transparent'}`}
              >
                Completed
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {activeTab === 'pending' && (
              pendingWorries.length === 0 ? (
                <p className="text-[#a0a0a0] text-center">No pending worries. Add one above!</p>
              ) : (
                <ul className="space-y-4">
                  {pendingWorries.map((worry) => (
                    <motion.li
                      key={worry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg shadow-sm transition-all duration-200 hover:bg-[#3a3a3a]"
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
                            ) : (
                              <>
                                <XCircle className="h-4 w-4 mr-2 text-red-500" />
                                <p className="text-red-500">Non-actionable</p>
                              </>
                            )}
                          </div>
                        )}
                        {worry.solution && (
                          <p className="text-[#888] text-xs mt-1">
                            Action: {worry.solution}
                          </p>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => completeWorry(worry.id)}
                          className="text-[#a0a0a0] hover:text-green-500 transition-colors duration-200"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteWorry(worry.id)}
                          className="text-[#a0a0a0] hover:text-red-500 transition-colors duration-200"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.li>
                  ))}
                </ul>
              )
            )}

            {activeTab === 'completed' && (
              completedWorries.length === 0 ? (
                <p className="text-[#a0a0a0] text-center">No completed worries yet. Great job!</p>
              ) : (
                <ul className="space-y-4">
                  {completedWorries.map((worry) => (
                    <motion.li
                      key={worry.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg shadow-sm transition-all duration-200 hover:bg-[#3a3a3a] opacity-60"
                    >
                      <div className="flex-1 space-y-1">
                        <span className="text-white line-through">{worry.text}</span>
                        {worry.solution && (
                          <p className="text-[#888] text-xs mt-1">
                            Action: {worry.solution}
                          </p>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteWorry(worry.id)}
                        className="text-[#a0a0a0] hover:text-red-500 transition-colors duration-200"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </motion.li>
                  ))}
                </ul>
              )
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WorryTreeApp;