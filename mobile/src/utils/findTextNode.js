import React from 'react';

// Helper to find text nodes in development
export function findTextNodes(element, path = 'root') {
  if (!__DEV__) return;
  
  React.Children.forEach(element?.props?.children, (child, index) => {
    const currentPath = `${path}[${index}]`;
    
    if (typeof child === 'string' || typeof child === 'number') {
      console.error(`🚨 TEXT NODE FOUND at ${currentPath}:`, JSON.stringify(child));
      console.trace('Stack trace for text node');
    }
    
    if (React.isValidElement(child)) {
      findTextNodes(child, `${currentPath}.${child.type.name || child.type}`);
    }
  });
}

// Wrap any component to debug text nodes
export function DebugTextNodes({ children, name = 'Unknown' }) {
  if (__DEV__) {
    React.useEffect(() => {
      findTextNodes({ props: { children } }, name);
    }, [children, name]);
  }
  
  return children;
}