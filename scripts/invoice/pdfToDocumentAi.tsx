import { DocumentProcessorServiceClient } from '@google-cloud/documentai';
import { GoogleAuth } from 'google-auth-library';
import {
    InvoiceState,
    InvoiceAction,
    actions,
  } from "../../document-models/invoice";
import crypto from 'crypto';

interface DocumentAIEntity {
    type: string;
    mentionText: string;
    confidence: number;
    children: DocumentAIEntity[];
}

interface ParsedAddress {
    streetAddress: string;
    extendedAddress: string | null;
    city: string;
    postalCode: string;
    stateProvince: string;
    country: string;
}

export async function uploadPdfAndGetJson(inputDoc: any) {
    try {
        console.log("Starting PDF upload and processing"); // Log when processing starts

        const projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        const location = process.env.GOOGLE_CLOUD_LOCATION;
        const processorId = process.env.GOOGLE_CLOUD_PROCESSOR_ID;

        console.log("Initializing Document AI client..."); // New log
        const auth = new GoogleAuth({
            keyFile: process.env.GOOGLE_CLOUD_KEY_FILE,
            scopes: 'https://www.googleapis.com/auth/cloud-platform',
        });
        const client = new DocumentProcessorServiceClient({ auth });

        console.log("Preparing document request..."); // New log
        const document = { content: inputDoc, mimeType: 'application/pdf' };
        const request = {
            name: `projects/${projectId}/locations/${location}/processors/${processorId}`,
            rawDocument: document,
        };

        console.log("Sending request to Document AI..."); // New log
        const [result]: any = await client.processDocument(request);
        console.log("PDF processed successfully"); // Original log

        // Extract useful sections from the JSON data using recursive function
        const extractEntities = (entities: any[]): DocumentAIEntity[] => {
            return entities.flatMap(entity => {
                const extracted = {
                    type: entity.type,
                    mentionText: entity.mentionText,
                    confidence: entity.confidence,
                    children: [] as DocumentAIEntity[]
                };

                if (entity.properties && entity.properties.length > 0) {
                    extracted.children = extractEntities(entity.properties);
                }

                return extracted;
            });
        };

        const entities = extractEntities(result.document.entities);
        console.log("Entities:", JSON.stringify(entities, null, 2));

        // Map the entities to invoice format
        const invoiceData = mapDocumentAiToInvoice(entities);
        
        console.log("Mapped invoice data:", JSON.stringify(invoiceData, null, 2));

        return { invoiceData };
    } catch (error) {
        console.error("Error in uploadPdfAndGetJson:", error); // Add error logging
        throw error; // Re-throw to handle in the API route
    }
}

function parseDate(dateStr: string): string | null {
    try {
        if (!dateStr || typeof dateStr !== 'string') {
            console.error(`Invalid date input: ${dateStr}`);
            return null;
        }

        // Remove any leading/trailing whitespace and convert to uppercase for consistency
        dateStr = dateStr.trim().toUpperCase();
        // Remove ordinal indicators (TH, ST, ND, RD)
        dateStr = dateStr.replace(/(\d+)(ST|ND|RD|TH)/g, '$1');
        
        let date: Date | null = null;
        
        // Handle YYYY-MM-DD format
        if (dateStr.match(/^\d{4}-\d{1,2}-\d{1,2}$/)) {
            const [year, month, day] = dateStr.split('-');
            date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        }
        // Handle DD/MMM/YYYY format (e.g., "02/JAN/2025")
        else if (dateStr.match(/^\d{1,2}\/[A-Z]{3}\/\d{4}$/)) {
            const [day, month, year] = dateStr.split('/');
            const monthMap: {[key: string]: string} = {
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
                'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
                'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            date = new Date(`${year}-${monthMap[month]}-${day.padStart(2, '0')}`);
        }
        // Handle DD-MMM-YYYY format (e.g., "02-JAN-2025")
        else if (dateStr.match(/^\d{1,2}-[A-Z]{3}-\d{4}$/)) {
            const [day, month, year] = dateStr.split('-');
            const monthMap: {[key: string]: string} = {
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
                'MAY': '05', 'JUN': '06', 'JUL': '07', 'AUG': '08',
                'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            date = new Date(`${year}-${monthMap[month]}-${day.padStart(2, '0')}`);
        }
        // Handle MM/DD/YYYY format
        else if (dateStr.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
            const [month, day, year] = dateStr.split('/');
            date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        }
        // Handle DD.MM.YYYY format (European)
        else if (dateStr.match(/^\d{1,2}\.\d{1,2}\.\d{4}$/)) {
            const [day, month, year] = dateStr.split('.');
            date = new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`);
        }
        // Handle "MONTH DAY, YEAR" format (e.g., "MARCH 5, 2025")
        else if (dateStr.match(/^[A-Z]+ \d{1,2},? \d{4}$/)) {
            const monthMap: {[key: string]: string} = {
                'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
                'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
                'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12',
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
                'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            
            // Extract month, day, and year
            const parts = dateStr.replace(',', '').split(' ');
            const month = parts[0];
            const day = parts[1];
            const year = parts[2];
            
            if (!monthMap[month]) {
                console.error(`Unknown month: ${month} in date: ${dateStr}`);
                throw new Error(`Unknown month: ${month} in date: ${dateStr}`);
            }
            
            date = new Date(`${year}-${monthMap[month]}-${day.padStart(2, '0')}`);
        }
        // Handle "DAY MONTH YEAR" format (e.g., "5 MARCH 2025")
        else if (dateStr.match(/^\d{1,2} [A-Z]+ \d{4}$/)) {
            const monthMap: {[key: string]: string} = {
                'JANUARY': '01', 'FEBRUARY': '02', 'MARCH': '03', 'APRIL': '04',
                'MAY': '05', 'JUNE': '06', 'JULY': '07', 'AUGUST': '08',
                'SEPTEMBER': '09', 'OCTOBER': '10', 'NOVEMBER': '11', 'DECEMBER': '12',
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04',
                'JUN': '06', 'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12'
            };
            
            const parts = dateStr.split(' ');
            const day = parts[0];
            const month = parts[1];
            const year = parts[2];
            
            if (!monthMap[month]) {
                console.error(`Unknown month: ${month} in date: ${dateStr}`);
                throw new Error(`Unknown month: ${month} in date: ${dateStr}`);
            }
            
            date = new Date(`${year}-${monthMap[month]}-${day.padStart(2, '0')}`);
        }
        
        if (!date || isNaN(date.getTime())) {
            console.error(`Failed to parse date: ${dateStr}`);
            // Fallback: try to use the JavaScript Date parser directly
            const fallbackDate = new Date(dateStr);
            if (!isNaN(fallbackDate.getTime())) {
                console.log(`Fallback date parsing succeeded for: ${dateStr}`);
                return fallbackDate.toISOString().split('T')[0];
            }
            throw new Error(`Invalid date format: ${dateStr}`);
        }
        
        // Return in YYYY-MM-DD format
        const formattedDate = date.toISOString().split('T')[0];
        return formattedDate;
    } catch (error) {
        console.error(`Error parsing date '${dateStr}':`, error);
        
        // If all else fails, return null instead of today's date
        console.log(`Unable to parse date: ${dateStr}, returning null`);
        return null;
    }
}

function convertCurrencySymbolToCode(symbol: string): string {
    if (!symbol || typeof symbol !== 'string') {
        console.error(`Invalid currency input: ${symbol}`);
        return 'USD'; // Default to USD
    }

    console.log(`Converting currency symbol/name: "${symbol}"`);
    
    // Clean up the input - remove whitespace and normalize
    const cleanSymbol = symbol.trim().toUpperCase();
    
    // Map of currency symbols and names to ISO codes
    const currencyMap: { [key: string]: string } = {
        // Symbols
        '$': 'USD',
        '£': 'GBP',
        '€': 'EUR',
        '¥': 'JPY',
        '₽': 'RUB',
        '₩': 'KRW',
        '₿': 'BTC',
        'CHF': 'CHF',
        
        // Names and codes - USD
        'USD': 'USD',
        'DOLLAR': 'USD',
        'DOLLARS': 'USD',
        'US DOLLAR': 'USD',
        'US DOLLARS': 'USD',
        'U.S. DOLLAR': 'USD',
        'U.S. DOLLARS': 'USD',
        'UNITED STATES DOLLAR': 'USD',
        
        // Names and codes - EUR
        'EUR': 'EUR',
        'EURO': 'EUR',
        'EUROS': 'EUR',
        'EUROPEAN EURO': 'EUR',
        
        // Names and codes - GBP
        'GBP': 'GBP',
        'POUND': 'GBP',
        'POUNDS': 'GBP',
        'POUND STERLING': 'GBP',
        'BRITISH POUND': 'GBP',
        'UK POUND': 'GBP',
        
        // Names and codes - JPY
        'JPY': 'JPY',
        'YEN': 'JPY',
        'JAPANESE YEN': 'JPY',
        
        // Other common currencies
        'CAD': 'CAD',
        'CANADIAN DOLLAR': 'CAD',
        'CANADIAN DOLLARS': 'CAD',
        
    };

    // Check if the symbol is in our map
    if (currencyMap[cleanSymbol]) {
        console.log(`Mapped currency "${symbol}" to "${currencyMap[cleanSymbol]}"`);
        return currencyMap[cleanSymbol];
    }
    
    // Check if it's a 3-letter currency code
    if (cleanSymbol.length === 3 && /^[A-Z]{3}$/.test(cleanSymbol)) {
        console.log(`Using 3-letter currency code as is: "${cleanSymbol}"`);
        return cleanSymbol;
    }
    
    // Special case for "EURO" which should be "EUR"
    if (cleanSymbol === 'EURO' || cleanSymbol === 'EUROS') {
        console.log(`Converting "${cleanSymbol}" to "EUR"`);
        return 'EUR';
    }
    
    console.log(`Unknown currency symbol/name: "${symbol}", defaulting to "USD"`);
    return 'USD';  // Default to USD for unknown currencies
}

function normalizeChainName(chainName: string): string {
    // Convert to lowercase for case-insensitive comparison
    const lowercaseName = chainName.toLowerCase();
    
    // Map of known chain names (lowercase) to their standardized versions
    const chainNameMap: { [key: string]: string } = {
        'base': 'Base',
        // Add more chain mappings as needed
        'ethereum': 'Ethereum',
        'polygon': 'Polygon',
        'arbitrum': 'Arbitrum',
        'optimism': 'Optimism',
        'avalanche': 'Avalanche'
    };
    
    // Return the standardized name if found, otherwise return the original
    return chainNameMap[lowercaseName] || chainName;
}

function normalizeAccountType(accountType: string): 'CHECKING' | 'SAVINGS' {
    // Convert to lowercase for case-insensitive comparison
    const lowercaseType = accountType.toLowerCase().trim();
    
    // Map of account type variations to standardized versions
    const accountTypeMap: { [key: string]: 'CHECKING' | 'SAVINGS' } = {
        'checking': 'CHECKING',
        'check': 'CHECKING',
        'chk': 'CHECKING',
        'current': 'CHECKING',  // Some countries call checking accounts "current accounts"
        'savings': 'SAVINGS',
        'saving': 'SAVINGS',
        'save': 'SAVINGS',
        'sav': 'SAVINGS'
    };
    
    // Return the standardized type if found, otherwise default to CHECKING
    return accountTypeMap[lowercaseType] || 'CHECKING';
}

function parseAddress(addressText: string): ParsedAddress {
    const addressLines = addressText.split(/[,\n]/).map(line => {
        // Remove common label prefixes and clean whitespace
        return line.trim()
            .replace(/^(street|address):\s*/i, '')
            .replace(/^zip:\s*/i, '')
            .replace(/^postal( code)?:\s*/i, '')
            .replace(/^city:\s*/i, '')
            .replace(/^state:\s*/i, '')
            .replace(/^province:\s*/i, '')
            .replace(/^country:\s*/i, '');
    }).filter(Boolean);

    const addressData = {
        streetAddress: '',
        extendedAddress: '',
        city: '',
        postalCode: '',
        stateProvince: '',
        country: ''
    };

    // Helper function to identify US state codes
    const isUSState = (str: string) => {
        const states = new Set(['AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS',
            'KY','LA','ME','MD','MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND',
            'OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY']);
        return states.has(str.toUpperCase());
    };

    // Helper function to check if string might be a country
    const isLikelyCountry = (str: string) => {
        const commonCountries = new Set([
            'portugal', 'philippines', 'germany', 'deutschland', 'usa', 'united states', 'us', 'canada', 'uk', 
            'united kingdom', 'australia', 'switzerland', 'france', 'spain', 'italy', 'netherlands', 'chile'
        ]);
        return commonCountries.has(str.toLowerCase());
    };

    // Helper to check for extended postal codes
    const extractPostalCode = (str: string) => {
        const patterns = [
            /\b\d{4}[-\s]?\d{3}\b/, // Portuguese format: 1234-567
            /\b\d{5}(?:-\d{4})?\b/, // US format
            /\b[A-Z]{1,2}\d[A-Z\d]?\s*\d[A-Z]{2}\b/i, // UK format
            /\b\d{4,6}\b/ // Generic format
        ];
        
        for (const pattern of patterns) {
            const match = str.match(pattern);
            if (match) return match[0];
        }
        return null;
    };

    // Process lines in reverse to identify country and city first
    for (let i = addressLines.length - 1; i >= 0; i--) {
        let line = addressLines[i].trim();
        if (!line) continue;

        // Split the line into parts
        const parts = line.split(/[\s,]+/);
        
        // Check for country first
        if (isLikelyCountry(line)) {
            addressData.country = line;
            continue;
        }

        // Extract postal code
        const postalCode = extractPostalCode(line);
        if (postalCode) {
            addressData.postalCode = postalCode;
            line = line.replace(postalCode, '').trim();
            
            // If there's text before or after the postal code, it might be the city
            if (line && !addressData.city) {
                addressData.city = line;
            }
            continue;
        }

        // Check for city names
        if (!addressData.city && !/^\d+/.test(line)) {
            if (line.toLowerCase().includes('city')) {
                const cityMatch = line.match(/(.+?)\s*city\s*(.*)/i);
                if (cityMatch) {
                    addressData.city = `${cityMatch[1]} City`.trim();
                    if (cityMatch[2] && !addressData.stateProvince) {
                        addressData.stateProvince = cityMatch[2].trim();
                    }
                }
            } else {
                addressData.city = line;
            }
            continue;
        }

        // Combine first two lines for street address if they don't look like a city or country
        if (i <= 1) {
            if (!addressData.streetAddress) {
                addressData.streetAddress = line;
            } else {
                addressData.streetAddress = `${addressData.streetAddress}, ${line}`;
            }
        }
    }

    // Clean up data
    const cleanupField = (str: string) => {
        if (!str) return '';
        return str
            .replace(/,+$/, '')
            .replace(/\s+/g, ' ')
            .trim();
    };

    return {
        streetAddress: cleanupField(addressData.streetAddress),
        extendedAddress: addressData.extendedAddress ? cleanupField(addressData.extendedAddress) : null,
        city: cleanupField(addressData.city),
        postalCode: cleanupField(addressData.postalCode),
        stateProvince: cleanupField(addressData.stateProvince),
        country: cleanupField(addressData.country)
    };
}

function mapDocumentAiToInvoice(
    entities: DocumentAIEntity[], 
    existingInvoice?: Partial<InvoiceState>
): Partial<InvoiceState> {
    const invoiceData: Partial<InvoiceState> = existingInvoice || {
        lineItems: []
    };

    // 1. Initialize base issuer structure if it doesn't exist
    if (!invoiceData.issuer) {
        invoiceData.issuer = {
            name: null,
            address: null,
            contactInfo: {
                email: null,
                tel: null
            },
            country: null,
            id: null,
            paymentRouting: null
        };
    }

    // 2. Initialize base payer structure if it doesn't exist
    if (!invoiceData.payer) {
        invoiceData.payer = {
            name: null,
            address: null,
            contactInfo: {
                email: null,
                tel: null
            },
            country: null,
            id: null,
            paymentRouting: null
        };
    }

    // 3. Initialize payment routing structure once if needed
    if (!invoiceData.issuer.paymentRouting) {
        invoiceData.issuer.paymentRouting = {
            bank: {
                name: "",
                accountNum: "",
                ABA: "",
                BIC: "",
                SWIFT: "",
                accountType: "CHECKING",
                beneficiary: "",
                memo: "",
                address: {
                    streetAddress: "",
                    city: "",
                    stateProvince: "",
                    postalCode: "",
                    country: "",
                    extendedAddress: ""
                },
                intermediaryBank: null
            },
            wallet: {
                address: "",
                chainId: "",
                chainName: "",
                rpc: ""
            }
        };
    }

    // 4. Process all entities and update the single payment routing object
    entities.forEach(entity => {
        switch(entity.type) {
            // Handle new schema format for bank details
            case 'supplier_bank_name':
                invoiceData.issuer!.paymentRouting!.bank!.name = entity.mentionText;
                break;
                
            case 'supplier_bank_account_type':
                invoiceData.issuer!.paymentRouting!.bank!.accountType = normalizeAccountType(entity.mentionText);
                break;
                
            case 'supplier_bank_bic':
            case 'supplier_bank_swift':
                const bankCode = entity.mentionText.replace(/^[:.\s]+/, '').trim(); // Remove leading colons and spaces
                if (invoiceData.issuer?.paymentRouting?.bank) {
                    if (entity.type === 'supplier_bank_bic') {
                        invoiceData.issuer.paymentRouting.bank.BIC = bankCode;
                    } else {
                        invoiceData.issuer.paymentRouting.bank.SWIFT = bankCode;
                    }
                }
                break;
                
            case 'supplier_bank_address':
                const bankAddress = parseAddress(entity.mentionText);
                if (invoiceData.issuer?.paymentRouting?.bank) {
                    invoiceData.issuer.paymentRouting.bank.address = bankAddress;
                }
                break;

            // Handle existing cases for crypto details
            case 'crypto_account_details':
                entity.children?.forEach(child => {
                    const wallet = invoiceData.issuer!.paymentRouting!.wallet!;
                    switch(child.type) {
                        case 'crypto_account_details/account_address':
                            let address = child.mentionText;
                            if (address.startsWith('Ox')) {
                                address = '0x' + address.slice(2);
                            }
                            wallet.address = address;
                            break;
                        case 'crypto_account_details/chain_name':
                            wallet.chainName = normalizeChainName(child.mentionText);
                            break;
                        case 'crypto_account_details/chain_id':
                            wallet.chainId = child.mentionText;
                            break;
                    }
                });
                break;

            case 'supplier_iban':
                invoiceData.issuer!.paymentRouting!.bank!.accountNum = entity.mentionText;
                break;

            case 'invoice_id':
                invoiceData.invoiceNo = entity.mentionText;
                break;
                
            case 'invoice_date':
                invoiceData.dateIssued = parseDate(entity.mentionText) || undefined;
                break;
            
            case 'due_date':
                invoiceData.dateDue = parseDate(entity.mentionText) || undefined;
                break;

            case 'currency':
                const currencyCode = convertCurrencySymbolToCode(entity.mentionText);
                console.log(`Setting invoice currency to: ${currencyCode} (from ${entity.mentionText})`);
                invoiceData.currency = currencyCode;
                
                // Also update currency in line items if they exist
                if (invoiceData.lineItems && invoiceData.lineItems.length > 0) {
                    invoiceData.lineItems = invoiceData.lineItems.map(item => ({
                        ...item,
                        currency: currencyCode
                    }));
                    console.log(`Updated currency in ${invoiceData.lineItems.length} line items to ${currencyCode}`);
                }
                break;
                
            case 'supplier_name':
                invoiceData.issuer!.name = entity.mentionText;
                
                // Set beneficiary name to supplier name only if no remit_to_name was found
                if (invoiceData.issuer?.paymentRouting?.bank && !invoiceData.issuer.paymentRouting.bank.beneficiary) {
                    invoiceData.issuer.paymentRouting.bank.beneficiary = entity.mentionText;
                }
                break;
            
            case 'remit_to_name':
                // Set the bank beneficiary name (this will override any supplier name that was set)
                if (invoiceData.issuer?.paymentRouting?.bank) {
                    invoiceData.issuer.paymentRouting.bank.beneficiary = entity.mentionText;
                }
                
                // If supplier name is not set, use remit_to_name as a fallback
                if (!invoiceData.issuer!.name) {
                    invoiceData.issuer!.name = entity.mentionText;
                }
                break;
                
            case 'supplier_email':
                if (!invoiceData.issuer!.contactInfo) {
                    invoiceData.issuer!.contactInfo = { email: null, tel: null };
                }
                invoiceData.issuer!.contactInfo.email = entity.mentionText;
                break;

            case 'supplier_address':
                const supplierAddress = parseAddress(entity.mentionText);
                invoiceData.issuer!.address = supplierAddress;
                if (supplierAddress.country) {
                    invoiceData.issuer!.country = supplierAddress.country;
                }
                break;

            case 'supplier_tax_id':
                invoiceData.issuer!.id = {
                    taxId: entity.mentionText
                };
                break;

            case 'supplier_phone':
                if (!invoiceData.issuer!.contactInfo) {
                    invoiceData.issuer!.contactInfo = { email: null, tel: null };
                }
                invoiceData.issuer!.contactInfo.tel = entity.mentionText;
                break;
            
            case 'line_item':
                const quantity = entity.children?.find(child => 
                    child.type === 'line_item/quantity'
                )?.mentionText || '';
                
                const unitPrice = entity.children?.find(child => 
                    child.type === 'line_item/unit_price'
                )?.mentionText || '';

                const description = entity.children?.find(child => 
                    child.type === 'line_item/description'
                )?.mentionText || '';
                
                // Only add line item if all required fields are present and valid
                if (description && quantity && unitPrice) {
                    const parsedQuantity = parseFloat(quantity.replace(/,/g, ''));
                    const parsedUnitPrice = parseFloat(unitPrice.replace(/,/g, ''));
                    
                    // Additional check to ensure parsed values are valid numbers
                    if (!isNaN(parsedQuantity) && !isNaN(parsedUnitPrice)) {
                        invoiceData.lineItems = invoiceData.lineItems || [];
                        invoiceData.lineItems.push({
                            description,
                            quantity: parsedQuantity,
                            unitPriceTaxExcl: parsedUnitPrice,
                            unitPriceTaxIncl: parsedUnitPrice,
                            totalPriceTaxExcl: parsedQuantity * parsedUnitPrice,
                            totalPriceTaxIncl: parsedQuantity * parsedUnitPrice,
                            currency: invoiceData.currency || 'USD',
                            id: crypto.randomUUID(),
                            taxPercent: 0
                        });
                    }
                }
                break;

            // Handle receiver (payer) information
            case 'receiver_name':
                if (!invoiceData.payer) {
                    invoiceData.payer = {
                        name: entity.mentionText,
                        address: null,
                        contactInfo: { email: null, tel: null },
                        country: null,
                        id: null,
                        paymentRouting: null
                    };
                } else {
                    invoiceData.payer.name = entity.mentionText;
                }
                break;

            case 'receiver_address':
                const receiverAddress = parseAddress(entity.mentionText);
                invoiceData.payer!.address = receiverAddress;
                if (receiverAddress.country) {
                    invoiceData.payer!.country = receiverAddress.country;
                }
                break;
            
            case 'receiver_email':
                if (!invoiceData.payer!.contactInfo) {
                    invoiceData.payer!.contactInfo = { email: null, tel: null };
                }
                invoiceData.payer!.contactInfo.email = entity.mentionText;
                break;

            case 'receiver_tax_id':
                if (!invoiceData.payer!.id) {
                    invoiceData.payer!.id = {
                        taxId: entity.mentionText
                    };
                } else {
                    invoiceData.payer!.id = {
                        taxId: entity.mentionText
                    };
                }
                break;

            case 'total_amount':
                const totalAmount = parseFloat(entity.mentionText.replace(/,/g, ''));
                invoiceData.totalPriceTaxExcl = totalAmount;
                invoiceData.totalPriceTaxIncl = totalAmount; // Assuming no tax for now
                break;

            case 'vat':
                const taxRate = parseFloat(entity.mentionText) || 0;
                // Apply tax rate to line items
                if (invoiceData.lineItems) {
                    invoiceData.lineItems = invoiceData.lineItems.map(item => ({
                        ...item,
                        taxPercent: taxRate
                    }));
                }
                break;
        }
    });

    return invoiceData;
}
