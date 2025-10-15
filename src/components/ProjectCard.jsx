// src/components/ProjectCard.jsx

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';

const ProjectCard = ({ title, description, link, external }) => {
  return (
    <motion.a
      href={link}
      target={external ? '_blank' : '_self'}
      rel={external ? 'noopener noreferrer' : ''}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="block"
    >
      <Card className="bg-[#1e1e1e] text-white border border-[#2a2a2a] rounded-xl overflow-hidden shadow-lg transition-transform duration-300 hover:scale-[1.02] hover:shadow-2xl hover:border-[#00ff88]">
        <CardHeader>
          <CardTitle className="flex justify-between items-center text-[#00ff88]">
            <span>{title}</span>
            <ArrowUpRight className="h-6 w-6 text-[#888888] transition-all duration-300 group-hover:text-[#00ff88]" />
          </CardTitle>
          <CardDescription className="text-[#a0a0a0]">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Content here */}
        </CardContent>
      </Card>
    </motion.a>
  );
};

export default ProjectCard;