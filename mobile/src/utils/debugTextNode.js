import React from 'react';

export function wrapWithDebug(Component, name) {
  return function DebugWrapper(props) {
    React.useEffect(() => {
      // Debug logging removed for production
    }, []);
    
    try {
      return <Component {...props} />;
    } catch (error) {
      // Error logging removed for production
      throw error;
    }
  };
}

export function debugChildren(children, componentName) {
  React.Children.forEach(children, (child, index) => {
    if (typeof child === 'string' || typeof child === 'number') {
      if (child.toString().includes('.')) {
        // Debug logging removed for production
      }
    }
  });
  return children;
}