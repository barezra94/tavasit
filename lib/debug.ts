// Debug utilities for the Tavasit calculator

export const DEBUG_MODE = process.env.NODE_ENV === 'development';

export const debugLog = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.log(`🔍 [DEBUG] ${message}`, data || '');
  }
};

export const debugError = (message: string, error?: any) => {
  if (DEBUG_MODE) {
    console.error(`❌ [DEBUG ERROR] ${message}`, error || '');
  }
};

export const debugWarn = (message: string, data?: any) => {
  if (DEBUG_MODE) {
    console.warn(`⚠️ [DEBUG WARN] ${message}`, data || '');
  }
};

export const debugGroup = (label: string, fn: () => void) => {
  if (DEBUG_MODE) {
    console.group(`🔍 [DEBUG GROUP] ${label}`);
    fn();
    console.groupEnd();
  }
};

export const debugTime = (label: string) => {
  if (DEBUG_MODE) {
    console.time(`⏱️ [DEBUG TIME] ${label}`);
  }
};

export const debugTimeEnd = (label: string) => {
  if (DEBUG_MODE) {
    console.timeEnd(`⏱️ [DEBUG TIME] ${label}`);
  }
};

// Helper to log component state changes
export const logStateChange = (componentName: string, stateName: string, oldValue: any, newValue: any) => {
  if (DEBUG_MODE) {
    console.log(`🔄 [STATE CHANGE] ${componentName}.${stateName}:`, {
      old: oldValue,
      new: newValue,
      changed: oldValue !== newValue
    });
  }
};

// Helper to log form data validation
export const logFormValidation = (formData: any, errors: any) => {
  if (DEBUG_MODE) {
    console.log(`✅ [FORM VALIDATION]`, {
      formData,
      errors,
      isValid: Object.keys(errors).length === 0
    });
  }
}; 