import { Status } from "../../../document-models/invoice/index.js";
import { EthereumAddress as EthereumAddressScalar } from "@powerhousedao/scalars";

// Types for validation
export type ValidationSeverity = 'error' | 'warning' | 'none';

export type ValidationResult = {
    isValid: boolean;
    message: string;
    severity: ValidationSeverity;
};

export type ValidationRule = {
    field: string;
    validate: (value: any, context?: any) => ValidationResult;
    appliesTo: {
        currencies: Array<string | 'ALL'>;
        statusTransitions: {
            from: Status[];
            to: Status[];
        };
    };
};

export type ValidationContext = {
    currency: string;
    currentStatus: Status;
    targetStatus: Status;
};

// Validation rules registry
const validationRules: ValidationRule[] = [];

// Helper function to validate Ethereum address
function isValidEthereumAddress(address: string): boolean {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
}

// Invoice number validation rule
export const invoiceNumberRule: ValidationRule = {
    field: 'invoiceNo',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Invoice number is required',
                severity: 'warning'
            };
        }
        return {
            isValid: true,
            message: '',
            severity: 'none'
        };
    },
    appliesTo: {
        currencies: ['ALL'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

// Ethereum address validation rule
export const ethereumAddressRule: ValidationRule = {
    field: 'address',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Wallet address is required',
                severity: 'error'
            };
        }
        if (!isValidEthereumAddress(value)) {
            return {
                isValid: false,
                message: 'Invalid Ethereum address format',
                severity: 'warning'
            };
        }
        return {
            isValid: true,
            message: '',
            severity: 'none'
        };
    },
    appliesTo: {
        currencies: ['USDS'],  // Only apply for USDS currency
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

// Register both rules
validationRules.push(invoiceNumberRule);
validationRules.push(ethereumAddressRule);

// Helper to check if a rule applies to the current context
function ruleAppliesToContext(rule: ValidationRule, context: ValidationContext): boolean {
    const { currencies, statusTransitions } = rule.appliesTo;
    const currencyMatches = currencies.includes('ALL') || currencies.includes(context.currency);
    const statusMatches = statusTransitions.from.includes(context.currentStatus) &&
        statusTransitions.to.includes(context.targetStatus);

    return currencyMatches && statusMatches;
}

// Main validation function
export function validateField(
    field: string,
    value: any,
    context: ValidationContext
): ValidationResult | null {
    const applicableRules = validationRules.filter(
        rule => rule.field === field && ruleAppliesToContext(rule, context)
    );

    if (applicableRules.length === 0) {
        return null;
    }

    // Run all applicable rules and return the first failure or the last success
    let lastResult: ValidationResult | null = null;

    for (const rule of applicableRules) {
        const result = rule.validate(value);
        if (!result.isValid) {
            return result; // Return first failure
        }
        lastResult = result;
    }

    return lastResult;
}

// Validate all fields for a status transition
export function validateStatusTransition(
    fields: Record<string, any>,
    context: ValidationContext
): Record<string, ValidationResult> {
    const results: Record<string, ValidationResult> = {};

    validationRules.forEach(rule => {
        if (ruleAppliesToContext(rule, context)) {
            const result = rule.validate(fields[rule.field]);
            if (!result.isValid) {
                results[rule.field] = result;
            }
        }
    });

    return results;
}

// Add a new validation rule
export function addValidationRule(rule: ValidationRule): void {
    validationRules.push(rule);
}

// Remove a validation rule
export function removeValidationRule(field: string): void {
    const index = validationRules.findIndex(rule => rule.field === field);
    if (index !== -1) {
        validationRules.splice(index, 1);
    }
} 