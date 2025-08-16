import { Alert, Platform } from 'react-native';
import networkService from './network.service';

export interface ErrorContext {
  operation: string;
  screen?: string;
  data?: any;
  timestamp: Date;
  networkState?: any;
  backendState?: any;
}

export interface ErrorHandlingOptions {
  showToUser?: boolean;
  allowRetry?: boolean;
  fallbackData?: any;
  customMessage?: string;
  logToAnalytics?: boolean;
}

export interface RetryOptions {
  maxRetries?: number;
  retryDelay?: number;
  backoffMultiplier?: number;
  customRetryCondition?: (error: Error, attempt: number) => boolean;
}

class ErrorService {
  private errorLog: Array<{ error: Error; context: ErrorContext; handled: boolean }> = [];
  private maxLogSize = 100;

  // Main error handling method
  async handleError(
    error: Error,
    context: ErrorContext,
    options: ErrorHandlingOptions = {}
  ): Promise<void> {
    const {
      showToUser = true,
      allowRetry = false,
      customMessage,
      logToAnalytics = true,
    } = options;

    // Log the error
    this.logError(error, context);

    // Determine error type and appropriate message
    const errorInfo = this.categorizeError(error, context);
    
    // Log to analytics if enabled
    if (logToAnalytics) {
      this.logToAnalytics(error, context, errorInfo);
    }

    // Show user-friendly message if requested
    if (showToUser) {
      const message = customMessage || this.getUserFriendlyMessage(errorInfo);
      await this.showErrorToUser(message, errorInfo, allowRetry, context);
    }
  }

  private logError(error: Error, context: ErrorContext): void {
    const logEntry = {
      error,
      context: {
        ...context,
        networkState: networkService.getCurrentNetworkState(),
        backendState: networkService.getCurrentBackendState(),
      },
      handled: true,
    };

    this.errorLog.push(logEntry);
    
    // Keep log size manageable
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog.shift();
    }

    // Console log for debugging
    console.error(`[${context.operation}] Error:`, error);
    console.error('Context:', context);
  }

  private categorizeError(error: Error, context: ErrorContext): {
    type: 'network' | 'backend' | 'validation' | 'storage' | 'unknown';
    severity: 'low' | 'medium' | 'high' | 'critical';
    isRetryable: boolean;
    suggestedAction: string;
  } {
    const message = error.message.toLowerCase();
    const networkState = networkService.getCurrentNetworkState();
    const backendState = networkService.getCurrentBackendState();

    // Network-related errors
    if (message.includes('network') || 
        message.includes('timeout') || 
        message.includes('fetch') ||
        !networkState?.isConnected) {
      return {
        type: 'network',
        severity: 'medium',
        isRetryable: true,
        suggestedAction: 'check_connection',
      };
    }

    // Backend unavailable
    if (!backendState.isBackendAvailable || 
        message.includes('500') || 
        message.includes('502') || 
        message.includes('503')) {
      return {
        type: 'backend',
        severity: 'high',
        isRetryable: true,
        suggestedAction: 'retry_later',
      };
    }

    // Validation errors
    if (message.includes('validation') || 
        message.includes('invalid') || 
        message.includes('required') ||
        message.includes('400')) {
      return {
        type: 'validation',
        severity: 'low',
        isRetryable: false,
        suggestedAction: 'check_input',
      };
    }

    // Storage errors
    if (message.includes('storage') || 
        message.includes('asyncstorage') || 
        context.operation.includes('storage')) {
      return {
        type: 'storage',
        severity: 'medium',
        isRetryable: true,
        suggestedAction: 'retry',
      };
    }

    // Default
    return {
      type: 'unknown',
      severity: 'medium',
      isRetryable: true,
      suggestedAction: 'retry',
    };
  }

  private getUserFriendlyMessage(errorInfo: {
    type: string;
    severity: string;
    suggestedAction: string;
  }): string {
    const messages = {
      network: {
        check_connection: '인터넷 연결을 확인해주세요. 네트워크에 연결되어 있는지 확인 후 다시 시도해주세요.',
      },
      backend: {
        retry_later: '서버에 일시적인 문제가 있습니다. 잠시 후 다시 시도해주세요.',
      },
      validation: {
        check_input: '입력한 정보를 확인해주세요. 필수 항목이 빠지거나 잘못된 형식일 수 있습니다.',
      },
      storage: {
        retry: '데이터 저장 중 문제가 발생했습니다. 다시 시도해주세요.',
      },
      unknown: {
        retry: '예상치 못한 오류가 발생했습니다. 다시 시도해주세요.',
      },
    };

    const messageGroup = messages[errorInfo.type as keyof typeof messages];
    return messageGroup?.[errorInfo.suggestedAction as keyof typeof messageGroup] || 
           messages.unknown.retry;
  }

  private async showErrorToUser(
    message: string,
    errorInfo: any,
    allowRetry: boolean,
    context: ErrorContext
  ): Promise<void> {
    if (Platform.OS === 'web') {
      // For web, we'd show a toast or modal
      console.error('Error for user:', message);
      return;
    }

    const buttons: any[] = [];
    
    if (allowRetry && errorInfo.isRetryable) {
      buttons.push({
        text: '다시 시도',
        onPress: () => this.retryOperation(context),
      });
    }

    buttons.push({
      text: '확인',
      style: 'cancel',
    });

    // Add help button for certain error types
    if (errorInfo.type === 'network') {
      buttons.push({
        text: '도움말',
        onPress: () => this.showNetworkHelp(),
      });
    }

    Alert.alert(
      this.getErrorTitle(errorInfo.type),
      message,
      buttons
    );
  }

  private getErrorTitle(errorType: string): string {
    const titles = {
      network: '연결 오류',
      backend: '서버 오류',
      validation: '입력 오류',
      storage: '저장 오류',
      unknown: '오류',
    };
    return titles[errorType as keyof typeof titles] || titles.unknown;
  }

  private async retryOperation(context: ErrorContext): Promise<void> {
    // This would trigger a retry of the original operation
    // In practice, you'd emit an event or call a callback
    
    // For now, just force a backend check
    await networkService.forceBackendCheck();
  }

  private showNetworkHelp(): void {
    const helpMessage = `네트워크 연결 문제 해결 방법:

1. WiFi 또는 모바일 데이터가 켜져 있는지 확인
2. 비행기 모드가 꺼져 있는지 확인  
3. 라우터나 모뎀 재시작 시도
4. 다른 앱에서 인터넷이 작동하는지 확인
5. 문제가 지속되면 네트워크 관리자에게 문의`;

    Alert.alert('네트워크 문제 해결', helpMessage);
  }

  private logToAnalytics(error: Error, context: ErrorContext, errorInfo: any): void {
    // In a real app, you'd send this to your analytics service
    const analyticsData = {
      error_type: errorInfo.type,
      error_severity: errorInfo.severity,
      error_message: error.message,
      operation: context.operation,
      screen: context.screen,
      network_connected: networkService.isOnline(),
      backend_available: networkService.isBackendAvailable(),
      timestamp: context.timestamp.toISOString(),
    };
    
  }

  // Retry wrapper for operations
  async withRetry<T>(
    operation: () => Promise<T>,
    context: ErrorContext,
    retryOptions: RetryOptions = {}
  ): Promise<T> {
    const {
      maxRetries = 3,
      retryDelay = 1000,
      backoffMultiplier = 2,
      customRetryCondition,
    } = retryOptions;

    let lastError: Error;
    
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        
        // Don't retry on last attempt
        if (attempt === maxRetries) {
          break;
        }

        // Check if we should retry
        const shouldRetry = customRetryCondition 
          ? customRetryCondition(lastError, attempt)
          : this.shouldRetryError(lastError);

        if (!shouldRetry) {
          break;
        }

        // Wait before retrying
        const delay = retryDelay * Math.pow(backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
      }
    }

    // If we get here, all retries failed
    throw lastError!;
  }

  private shouldRetryError(error: Error): boolean {
    const message = error.message.toLowerCase();
    
    // Retry network and temporary server errors
    return message.includes('network') ||
           message.includes('timeout') ||
           message.includes('fetch') ||
           message.includes('500') ||
           message.includes('502') ||
           message.includes('503');
  }

  // Utility methods
  getErrorHistory(): Array<{ error: Error; context: ErrorContext; handled: boolean }> {
    return [...this.errorLog];
  }

  clearErrorHistory(): void {
    this.errorLog = [];
  }

  getErrorStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const stats = {
      total: this.errorLog.length,
      byType: {} as Record<string, number>,
      bySeverity: {} as Record<string, number>,
    };

    this.errorLog.forEach(entry => {
      const errorInfo = this.categorizeError(entry.error, entry.context);
      stats.byType[errorInfo.type] = (stats.byType[errorInfo.type] || 0) + 1;
      stats.bySeverity[errorInfo.severity] = (stats.bySeverity[errorInfo.severity] || 0) + 1;
    });

    return stats;
  }
}

export const errorService = new ErrorService();
export default errorService;