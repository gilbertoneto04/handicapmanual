import React, { useState, useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

const DomainWarning: React.FC = () => {
  useEffect(() => {
    // Check if the hostname is the old vercel domain
    if (window.location.hostname === 'handicapmanual.vercel.app') {
      // Force a clean redirect without preserving query parameters
      window.location.replace('https://handicap.com.br');
    }
  }, []);

  return null;
};

export default DomainWarning;
