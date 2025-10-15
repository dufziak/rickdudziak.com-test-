import React from 'react';
import { motion } from 'framer-motion';
import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProjectCard from '@/components/ProjectCard';
import { useToast } from '@/components/ui/use-toast';
import { auth } from '@/firebase'; // Import Firebase auth

const ProjectsPage = () => {
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out.",
        className: "bg-[#1e1e1e] text-white border-[#00ff88]",
      });
    } catch (e) {
      console.error('Error logging out:', e);
    }
  };

  const projects = [
    {
      id: 7,
      title: 'The Worry Tree',
      description: 'A CBT-based tool to help you process worries and find actionable solutions or let them go.',
      link: '/worry-tree',
      internal: true,
    },
     {
      id: 1,
      title: 'E-Commerce Platform',
      description: 'A modern, responsive online shopping experience with seamless checkout and inventory management.',
      link: 'https://github.com/rickdudziak/ecommerce'
    },
    {
      id: 2,
      title: 'Task Management App',
      description: 'Intuitive productivity tool with real-time collaboration features and smart notifications.',
      link: '/tasks',
      internal: true,
    },
    {
      id: 3,
      title: 'Portfolio CMS',
      description: 'Custom content management system built for creative professionals to showcase their work.',
      link: 'https://github.com/rickdudziak/portfolio-cms'
    },
    {
      id: 4,
      title: 'Weather Dashboard',
      description: 'Real-time weather tracking application with beautiful data visualizations and forecasts.',
      link: '/weather',
      internal: true,
    },
    {
      id: 5,
      title: 'Social Media Analytics',
      description: 'Comprehensive analytics platform for tracking engagement metrics across multiple channels.',
      link: 'https://github.com/rickdudziak/social-analytics'
    },
    {
      id: 6,
      title: 'Fitness Tracker',
      description: 'Personal health and fitness monitoring app with workout plans and progress tracking.',
      link: 'https://github.com/rickdudziak/fitness-tracker'
    }
  ];

  return (
    <div className="min-h-screen">
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="bg-[#1e1e1e] border-b border-[#2a2a2a] sticky top-0 z-50 backdrop-blur-sm bg-opacity-95"
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
             <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#00ff88] to-[#00cc6a] flex items-center justify-center text-[#121212] font-bold">
              RD
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Projects</h1>
              <p className="text-sm text-[#888888]">Rick Dudziak</p>
            </div>
          </div>
          
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-[#e0e0e0] hover:text-white hover:bg-[#2a2a2a] rounded-lg flex items-center space-x-2"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </motion.header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {projects.map((project, index) => (
            <ProjectCard
              key={project.id}
              title={project.title}
              description={project.description}
              link={project.link}
              externalLink={project.link}
            />
          ))}
        </motion.div>
      </main>
    </div>
  );
};

export default ProjectsPage;