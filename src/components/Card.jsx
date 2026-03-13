import React from 'react';

const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`glass rounded-lg ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`border-b border-border-divider px-5 py-4 ${className}`}>
      {children}
    </div>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`px-5 py-4 ${className}`}>
      {children}
    </div>
  );
};

const CardFooter = ({ children, className = '' }) => {
  return (
    <div className={`border-t border-border-divider px-5 py-4 ${className}`}>
      {children}
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter };
export default Card;
