import { useState, useEffect } from 'react';

const TimeAgo = ({ date, className }) => {
  const [timeAgo, setTimeAgo] = useState('');

  useEffect(() => {
    const calculateTimeAgo = () => {
      const seconds = Math.floor((new Date() - new Date(date)) / 1000);
      
      let interval = seconds / 31536000; // years
      if (interval > 1) {
        return Math.floor(interval) + 'y';
      }
      
      interval = seconds / 2592000; // months
      if (interval > 1) {
        return Math.floor(interval) + 'mo';
      }
      
      interval = seconds / 86400; // days
      if (interval > 1) {
        return Math.floor(interval) + 'd';
      }
      
      interval = seconds / 3600; // hours
      if (interval > 1) {
        return Math.floor(interval) + 'h';
      }
      
      interval = seconds / 60; // minutes
      if (interval > 1) {
        return Math.floor(interval) + 'm';
      }
      
      return Math.floor(seconds) + 's';
    };

    setTimeAgo(calculateTimeAgo());
    
    const timer = setInterval(() => {
      setTimeAgo(calculateTimeAgo());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, [date]);

  return <span className={className}>{timeAgo}</span>;
};

export default TimeAgo;
