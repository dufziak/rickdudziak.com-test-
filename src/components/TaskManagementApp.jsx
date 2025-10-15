import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, CheckCircle2, Circle, Plus, Trash2, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

const TaskItem = ({ task, onToggle, onDelete, index }) => {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -50 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-center space-x-4 bg-[#2a2a2a]/50 p-3 rounded-lg border border-transparent hover:border-[#00ff88]/30"
    >
      <Checkbox
        id={`task-${task.id}`}
        checked={task.completed}
        onCheckedChange={() => onToggle(task.id)}
        className="h-6 w-6"
      />
      <label
        htmlFor={`task-${task.id}`}
        className={`flex-1 text-sm font-medium cursor-pointer ${task.completed ? 'line-through text-[#888]' : 'text-white'}`}
      >
        {task.text}
      </label>
      <Button variant="ghost" size="icon" onClick={() => onDelete(task.id)} className="text-[#888] hover:text-red-500 h-8 w-8">
        <Trash2 className="h-4 w-4" />
      </Button>
    </motion.li>
  );
};

const TaskManagementApp = () => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedTasks = localStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
      }
    } catch (error) {
      console.error("Failed to parse tasks from localStorage", error);
      setTasks([]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleAddTask = (e) => {
    e.preventDefault();
    if (newTask.trim() === '') {
      toast({
        title: "Oops!",
        description: "Task cannot be empty.",
        variant: "destructive",
        className: "bg-red-800 text-white border-red-600",
      });
      return;
    }
    const newTaskItem = {
      id: Date.now(),
      text: newTask,
      completed: false,
    };
    setTasks([newTaskItem, ...tasks]);
    setNewTask('');
    toast({
        title: "Success!",
        description: "New task has been added.",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
      });
  };

  const toggleTask = (id) => {
    setTasks(
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const deleteTask = (id) => {
    setTasks(tasks.filter((task) => task.id !== id));
    toast({
        title: "Task Removed",
        description: "The task has been successfully deleted.",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
      });
  };
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;

  return (
    <div className="min-h-screen p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-[#121212] via-[#1a1a1a] to-[#121212]">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <Button onClick={() => navigate('/')} variant="ghost" className="mb-6 text-[#e0e0e0] hover:text-white hover:bg-[#2a2a2a]">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Projects
        </Button>
      </motion.div>

      <main className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center items-center gap-3">
                <ListTodo className="h-8 w-8 text-[#00ff88]" />
                <CardTitle className="text-3xl">Task Manager</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddTask} className="flex gap-2 mb-6">
                <Input
                  type="text"
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a new task..."
                  className="flex-grow"
                />
                <Button type="submit" className="bg-[#00ff88] hover:bg-[#00dd77] text-[#121212] font-semibold">
                  <Plus className="h-4 w-4 mr-2" /> Add
                </Button>
              </form>

              <div className="flex justify-around mb-6 text-sm">
                  <div className="flex items-center gap-2 text-yellow-400">
                      <Circle className="h-4 w-4"/>
                      <span>{pendingTasks} Pending</span>
                  </div>
                  <div className="flex items-center gap-2 text-green-400">
                      <CheckCircle2 className="h-4 w-4"/>
                      <span>{completedTasks} Completed</span>
                  </div>
              </div>
              
              <AnimatePresence>
                {tasks.length > 0 ? (
                  <ul className="space-y-3">
                    {tasks.map((task, index) => (
                      <TaskItem key={task.id} task={task} onToggle={toggleTask} onDelete={deleteTask} index={index}/>
                    ))}
                  </ul>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-10 text-[#888]"
                  >
                    <p>No tasks yet. Add one to get started!</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        </motion.div>
      </main>
    </div>
  );
};

export default TaskManagementApp;