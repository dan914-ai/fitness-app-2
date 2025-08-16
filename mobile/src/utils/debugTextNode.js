import React from 'react';

export function wrapWithDebug(Component, name) {
  return function DebugWrapper(props) {
    React.useEffect(() => {
      console.log(`[DEBUG] ${name} rendered`);
    }, []);
    
    try {
      return <Component {...props} />;
    } catch (error) {
      console.error(`[DEBUG] Error in ${name}:`, error);
      throw error;
    }
  };
}

export function debugChildren(children, componentName) {
  React.Children.forEach(children, (child, index) => {
    if (typeof child === 'string' || typeof child === 'number') {
      if (child.toString().includes('.')) {
        console.error(`[DEBUG] Found text with period in ${componentName}[${index}]:`, child);
      }
    }
  });
  return children;
}