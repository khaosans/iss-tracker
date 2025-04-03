"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { LocationFact } from '@/lib/types';

interface LocationFactProps {
  fact: LocationFact | null;
  isVisible: boolean;
  style?: React.CSSProperties;
  onTypingComplete?: () => void;
  minDisplayTime?: number;
}

export default function LocationFactDisplay({ 
  fact, 
  isVisible, 
  style,
  onTypingComplete,
  minDisplayTime = 8000 // 8 seconds minimum display time after typing completes
}: LocationFactProps) {
  const [displayedText, setDisplayedText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textRef = useRef<string>('');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const displayTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Reset and start typing animation when a new fact appears
  useEffect(() => {
    // Clear any existing timers first
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    
    if (displayTimerRef.current) {
      clearTimeout(displayTimerRef.current);
      displayTimerRef.current = null;
    }
    
    // Only proceed if we have a fact with text and it should be visible
    if (fact && fact.fact && typeof fact.fact === 'string' && isVisible) {
      // Validate all string fields before proceeding
      const validatedFact = {
        fact: fact.fact.trim(),
        region: fact.region?.trim() || '',
        source: fact.source?.trim() || ''
      };
      
      // Store the validated text in the ref
      textRef.current = validatedFact.fact;
      setDisplayedText('');
      setIsTyping(true);
    } else {
      setIsTyping(false);
      setDisplayedText(''); // Reset displayed text when fact is null or not visible
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (displayTimerRef.current) {
        clearTimeout(displayTimerRef.current);
        displayTimerRef.current = null;
      }
    };
  }, [fact, isVisible]);
  
  // Handle the typing animation effect
  useEffect(() => {
    // Early return if not typing or no valid text to type
    if (!isTyping || !textRef.current) return;
    
    const currentIndex = displayedText.length;
    
    // Continue typing if there are more characters to display
    if (currentIndex < textRef.current.length) {
      timerRef.current = setTimeout(() => {
        // Ensure textRef.current is a valid string before using substring
        if (typeof textRef.current === 'string') {
          setDisplayedText(textRef.current.substring(0, currentIndex + 1));
        }
      }, 30); // Speed of typing animation
    } else {
      // Finished typing
      setIsTyping(false);
      
      // Notify parent that typing is complete
      if (onTypingComplete) {
        // Set minimum display time before allowing another fact update
        displayTimerRef.current = setTimeout(() => {
          onTypingComplete();
        }, minDisplayTime);
      }
    }
    
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [displayedText, isTyping, onTypingComplete, minDisplayTime]);
  
  return (
    <motion.div 
      className="fact-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      style={{
        position: 'absolute',
        bottom: '80px',
        left: '20px',
        maxWidth: '400px',
        padding: '16px',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        borderRadius: '12px',
        color: 'white',
        backdropFilter: 'blur(4px)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        zIndex: 1000,
        fontFamily: 'system-ui, sans-serif',
        ...style,
      }}
    >
      <div className="fact-region" style={{ fontWeight: 'bold', marginBottom: '8px', color: '#4ade80' }}>
        {fact?.region || ''}
      </div>
      <div className="fact-content">
        {displayedText}
        {isTyping && <span className="cursor">|</span>}
      </div>
      {fact?.source && (
        <div className="fact-source" style={{ marginTop: '8px', fontSize: '0.8rem', opacity: 0.7 }}>
          Source: {fact?.source || ''}
        </div>
      )}
    </motion.div>
  );
}