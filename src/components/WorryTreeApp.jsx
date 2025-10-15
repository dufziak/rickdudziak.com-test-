import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/firebase';

const WorryTreeApp = ({ currentUser }) => {
  const [worries, setWorries] = useState([]);
  const [currentWorry, setCurrentWorry] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

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

  const addWorry = async (e) => {
    e.preventDefault();
    if (currentWorry.trim() === '') return;
    setIsAdding(true);
    try {
      const docRef = await addDoc(collection(db, 'worries'), {
        text: currentWorry,
        userId: currentUser.uid,
        createdAt: new Date(),
      });
      setWorries([...worries, { id: docRef.id, text: currentWorry }]);
      setCurrentWorry('');
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

        <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Add a New Worry</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addWorry} className="flex space-x-2">
              <Input
                type="text"
                value={currentWorry}
                onChange={(e) => setCurrentWorry(e.target.value)}
                placeholder="Write your worry here..."
                className="flex-1 bg-[#121212] text-white border-none focus:ring-1 focus:ring-[#00ff88]"
              />
              <Button type="submit" disabled={isAdding} className="bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]">
                {isAdding ? <Loader2 className="h-5 w-5 animate-spin" /> : "Add"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Your Worries</CardTitle>
          </CardHeader>
          <CardContent>
            {worries.length === 0 ? (
              <p className="text-[#a0a0a0] text-center">No worries saved. Add one above!</p>
            ) : (
              <ul className="space-y-4">
                {worries.map((worry) => (
                  <motion.li
                    key={worry.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg shadow-sm transition-all duration-200 hover:bg-[#3a3a3a]"
                  >
                    <span className="text-white">{worry.text}</span>
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
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default WorryTreeApp;