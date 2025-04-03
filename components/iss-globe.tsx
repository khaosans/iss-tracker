"use client"

import React, { ReactNode } from 'react';

interface ISSGlobeProps {
  children?: ReactNode;
}

const ISSGlobe: React.FC<ISSGlobeProps> = ({ children }) => {
  return (
    <div data-testid="iss-globe">
      {/* Your ISSGlobe component content here */}
      {children || 'ISSGlobe Component'}
    </div>
  );
};

export default ISSGlobe;

