// Debug helper for authentication issues
export function debugAuthError(error: any, context: string) {
  
  if (error?.message) {
    if (error.message.includes('Email not confirmed')) {
    } else if (error.message.includes('invalid')) {
    } else if (error.message.includes('Invalid login credentials')) {
    }
  }
  
}

export function debugLoginAttempt(email: string, password: string) {
}