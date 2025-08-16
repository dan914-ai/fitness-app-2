// Debug utility to find text node issues
// Add this to any screen where you're getting the error

export const DebugWrapper = ({ children, label = 'Unknown' }) => {
  if (__DEV__) {
    React.Children.forEach(children, (child, index) => {
      if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
        console.error(`🚨 TEXT NODE FOUND in ${label}[${index}]:`, typeof child, child);
      }
    });
  }
  return children;
};

// Usage:
// <View>
//   <DebugWrapper label="HomeScreen-routineCard">
//     {your content here}
//   </DebugWrapper>
// </View>