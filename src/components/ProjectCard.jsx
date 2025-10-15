import React from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

const ProjectCard = ({ project, index }) => {
  const navigate = useNavigate();

  const handleViewProject = () => {
    if (project.internal) {
      navigate(project.link);
    } else {
      window.open(project.link, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      whileHover={{ y: -8 }}
      className="bg-[#1e1e1e] rounded-xl p-6 border border-[#2a2a2a] hover:border-[#00ff88]/30 transition-all duration-300 shadow-lg hover:shadow-[#00ff88]/10"
    >
      <div className="flex flex-col justify-between h-full">
        <div className="space-y-4">
            <h3 className="text-xl font-bold text-white">
                {project.title}
            </h3>
            <p className="text-[#b0b0b0] text-sm leading-relaxed">
                {project.description}
            </p>
        </div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mt-6"
        >
          <Button
            onClick={handleViewProject}
            className="w-full bg-[#00ff88] hover:bg-[#00dd77] text-[#121212] font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {project.internal ? 'Open App' : 'View Project'}
            {project.internal ? <ArrowRight className="ml-2 h-4 w-4" /> : <ExternalLink className="ml-2 h-4 w-4" />}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;