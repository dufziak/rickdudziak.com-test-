import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Plus, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const FitnessTrackerApp = () => {
  const [workouts, setWorkouts] = useState([]);
  const [newWorkout, setNewWorkout] = useState('');

  useEffect(() => {
    // Load workouts from local storage on component mount
    const storedWorkouts = JSON.parse(localStorage.getItem('workouts')) || [];
    setWorkouts(storedWorkouts);
  }, []);

  useEffect(() => {
    // Save workouts to local storage whenever the list changes
    localStorage.setItem('workouts', JSON.stringify(workouts));
  }, [workouts]);

  const addWorkout = (e) => {
    e.preventDefault();
    if (newWorkout.trim() !== '') {
      const newWorkouts = [...workouts, { id: Date.now(), text: newWorkout }];
      setWorkouts(newWorkouts);
      setNewWorkout('');
    }
  };

  const deleteWorkout = (id) => {
    const updatedWorkouts = workouts.filter(workout => workout.id !== id);
    setWorkouts(updatedWorkouts);
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
            Fitness Tracker
          </h1>
          <p className="text-[#a0a0a0] mt-2">
            Log your workouts and track your progress.
          </p>
        </div>

        <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Add a New Workout</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={addWorkout} className="flex space-x-2">
              <Input
                type="text"
                value={newWorkout}
                onChange={(e) => setNewWorkout(e.target.value)}
                placeholder="e.g., 30-minute run"
                className="flex-1 bg-[#121212] text-white border-none focus:ring-1 focus:ring-[#00ff88]"
              />
              <Button type="submit" className="bg-[#00ff88] text-[#121212] hover:bg-[#00dd77]">
                <Plus className="h-5 w-5 mr-2" />
                Add
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-[#1e1e1e] border border-[#2a2a2a] shadow-lg">
          <CardHeader>
            <CardTitle className="text-white">Your Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            {workouts.length === 0 ? (
              <p className="text-[#a0a0a0] text-center">No workouts logged yet. Add one above!</p>
            ) : (
              <ul className="space-y-4">
                {workouts.map((workout) => (
                  <motion.li
                    key={workout.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="flex items-center justify-between p-4 bg-[#2a2a2a] rounded-lg shadow-sm transition-all duration-200 hover:bg-[#3a3a3a]"
                  >
                    <span className="text-white">{workout.text}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteWorkout(workout.id)}
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

export default FitnessTrackerApp;