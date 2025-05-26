import { ValidationRule } from "./validationManager.js";

// Helper function to validate Ethereum address
function isValidEthereumAddress(address: string): boolean {
    const ethereumAddressRegex = /^0x[a-fA-F0-9]{40}$/;
    return ethereumAddressRegex.test(address);
}

function isValidIBAN(iban: string): boolean {
    const ibanRegex = /^([A-Z]{2}[0-9]{2})(?=(?:[A-Z0-9]){9,30}$)((?:[A-Z0-9]{3,5}){2,7})([A-Z0-9]{1,3})?$/;
    return ibanRegex.test(iban);
}

function isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
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
        currencies: ['USDS', 'DAI'],  // Only apply for crypto currencies
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const currencyRule: ValidationRule = {
    field: 'currency',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Currency is required',
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

export const countryRule: ValidationRule = {
    field: 'country',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Country is required',
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
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const accountNumberRule: ValidationRule = {
    field: 'accountNum',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Account number is required',
                severity: 'warning'
            };
        }
        if (!isValidIBAN(value)) {
            return {
                isValid: false,
                message: 'Invalid IBAN format - Remove spaces and/or dashes',
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
        currencies: ['EUR', 'GBP'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const bicNumberRule: ValidationRule = {
    field: 'bicNumber',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'BIC number is required',
                severity: 'warning'
            };
        }
        if (value) {
            const bicRegex = /^[a-zA-Z]{6}[a-zA-Z0-9]{2}([a-zA-Z0-9]{3})?$/i;
            if (!bicRegex.test(value)) {
                return {
                    isValid: false,
                    message: 'Invalid BIC number format',
                    severity: 'warning'
                };
            }
        }
        return {
            isValid: true,
            message: '',
            severity: 'none'
        };

    },
    appliesTo: {
        currencies: ['EUR', 'GBP'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const bankNameRule: ValidationRule = {
    field: 'bankName',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Bank name is required',
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
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const issuerStreetAddressRule: ValidationRule = {
    field: 'streetAddress',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Street address is required',
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
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const issuerCityRule: ValidationRule = {
    field: 'city',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'City is required',
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
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const issuerPostalCodeRule: ValidationRule = {
    field: 'postalCode',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Postal code is required',
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
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const payerEmailRule: ValidationRule = {
    field: 'email',
    validate: (value: string) => {
        if (!value || value.trim() === '') {
            return {
                isValid: false,
                message: 'Email is required',
                severity: 'warning'
            };
        }
        if (!isValidEmail(value)) {
            return {
                isValid: false,
                message: 'Invalid email format',
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
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF'],
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

export const lineItemRule: ValidationRule = {
    field: 'lineItem',
    validate: (value: string) => {
        if (value.length === 0) {
            return {
                isValid: false,
                message: 'Line item is required - Add at least one line item',
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
        currencies: ['USD', 'EUR', 'GBP', 'JPY', 'CNY', 'CHF'], 
        statusTransitions: {
            from: ['DRAFT'],
            to: ['ISSUED']
        }
    }
};

