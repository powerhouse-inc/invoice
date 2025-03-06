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
        
        console.log("Mapped invoice data:", invoiceData);

        return { invoiceData };
    } catch (error) {
        console.error("Error in uploadPdfAndGetJson:", error); // Add error logging
        throw error; // Re-throw to handle in the API route
    }
}

function parseDate(dateStr: string): string {
    try {
        console.log(`Attempting to parse date: ${dateStr}`);
        
        // Normalize the date string
        const normalizedDateStr = dateStr.trim().toUpperCase();
        
        // Handle month name format with ordinal suffixes (e.g., "MARCH 31ST, 2025")
        const monthNameOrdinalRegex = /^([A-Z]+)\s+(\d{1,2})(ST|ND|RD|TH)?,?\s+(\d{4})$/;
        const monthNameOrdinalMatch = normalizedDateStr.match(monthNameOrdinalRegex);
        
        if (monthNameOrdinalMatch) {
            const monthName = monthNameOrdinalMatch[1];
            const day = monthNameOrdinalMatch[2].padStart(2, '0');
            const year = monthNameOrdinalMatch[4];
            
            // Map month names to numbers
            const monthMap: Record<string, string> = {
                'JANUARY': '01', 'JAN': '01',
                'FEBRUARY': '02', 'FEB': '02',
                'MARCH': '03', 'MAR': '03',
                'APRIL': '04', 'APR': '04',
                'MAY': '05',
                'JUNE': '06', 'JUN': '06',
                'JULY': '07', 'JUL': '07',
                'AUGUST': '08', 'AUG': '08',
                'SEPTEMBER': '09', 'SEP': '09',
                'OCTOBER': '10', 'OCT': '10',
                'NOVEMBER': '11', 'NOV': '11',
                'DECEMBER': '12', 'DEC': '12'
            };
            
            const monthNum = monthMap[monthName];
            if (!monthNum) {
                throw new Error(`Unknown month name: ${monthName}`);
            }
            
            // Return in ISO format (YYYY-MM-DD)
            return `${year}-${monthNum}-${day}`;
        }
        
        // Handle month name format without ordinals (e.g., "MARCH 05, 2025")
        const monthNameRegex = /^([A-Z]+)\s+(\d{1,2}),?\s+(\d{4})$/;
        const monthNameMatch = normalizedDateStr.match(monthNameRegex);
        
        if (monthNameMatch) {
            const monthName = monthNameMatch[1];
            const day = monthNameMatch[2].padStart(2, '0');
            const year = monthNameMatch[3];
            
            // Map month names to numbers
            const monthMap: Record<string, string> = {
                'JANUARY': '01', 'JAN': '01',
                'FEBRUARY': '02', 'FEB': '02',
                'MARCH': '03', 'MAR': '03',
                'APRIL': '04', 'APR': '04',
                'MAY': '05',
                'JUNE': '06', 'JUN': '06',
                'JULY': '07', 'JUL': '07',
                'AUGUST': '08', 'AUG': '08',
                'SEPTEMBER': '09', 'SEP': '09',
                'OCTOBER': '10', 'OCT': '10',
                'NOVEMBER': '11', 'NOV': '11',
                'DECEMBER': '12', 'DEC': '12'
            };
            
            const monthNum = monthMap[monthName];
            if (!monthNum) {
                throw new Error(`Unknown month name: ${monthName}`);
            }
            
            // Return in ISO format (YYYY-MM-DD)
            return `${year}-${monthNum}-${day}`;
        }
        
        // Handle existing formats
        // MM/DD/YYYY or DD/MM/YYYY
        const slashRegex = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
        const slashMatch = normalizedDateStr.match(slashRegex);
        
        if (slashMatch) {
            // Assume MM/DD/YYYY format for simplicity
            // You might need to adjust this based on your locale expectations
            const month = slashMatch[1].padStart(2, '0');
            const day = slashMatch[2].padStart(2, '0');
            const year = slashMatch[3];
            
            // Validate month and day
            if (parseInt(month) > 12) {
                // If month > 12, it's likely DD/MM/YYYY format
                return `${year}-${day}-${month}`;
            } else {
                return `${year}-${month}-${day}`;
            }
        }
        
        // Handle YYYY-MM-DD format
        const isoRegex = /^(\d{4})-(\d{1,2})-(\d{1,2})$/;
        const isoMatch = normalizedDateStr.match(isoRegex);
        
        if (isoMatch) {
            const year = isoMatch[1];
            const month = isoMatch[2].padStart(2, '0');
            const day = isoMatch[3].padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // Handle MM-DD-YYYY or DD-MM-YYYY format
        const dashRegex = /^(\d{1,2})-(\d{1,2})-(\d{4})$/;
        const dashMatch = normalizedDateStr.match(dashRegex);
        
        if (dashMatch) {
            // Assume MM-DD-YYYY format for simplicity
            const month = dashMatch[1].padStart(2, '0');
            const day = dashMatch[2].padStart(2, '0');
            const year = dashMatch[3];
            
            // Validate month and day
            if (parseInt(month) > 12) {
                // If month > 12, it's likely DD-MM-YYYY format
                return `${year}-${day}-${month}`;
            } else {
                return `${year}-${month}-${day}`;
            }
        }
        
        // If we get here, the date format is not recognized
        throw new Error(`Invalid date format: ${dateStr}`);
    } catch (error) {
        console.error(`Error parsing date '${dateStr}':`, error);
        
        // Return a fallback date or re-throw the error
        // For now, we'll re-throw to maintain the existing behavior
        throw error;
    }
}

function convertCurrencySymbolToCode(symbol: string): string {
    const currencyMap: { [key: string]: string } = {
        '$': 'USD',
        '£': 'GBP',
        '€': 'EUR',
        // Add more symbols as needed
    };

    return currencyMap[symbol.trim()] || symbol;
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
            case 'supplier_bank_details':
                entity.children?.forEach(child => {
                    const bank = invoiceData.issuer!.paymentRouting!.bank!;
                    switch(child.type) {
                        case 'supplier_bank_details/bank_name':
                            bank.name = child.mentionText;
                            break;
                        case 'supplier_bank_details/bank_iban':
                            bank.accountNum = child.mentionText;
                            break;
                        case 'supplier_bank_details/aba_bic_swift_number':
                            bank.SWIFT = child.mentionText;
                            break;
                        case 'supplier_bank_details/bank_account_type':
                            bank.accountType = child.mentionText as 'CHECKING' | 'SAVINGS';
                            break;
                        case 'supplier_bank_details/beneficiary_name':
                            bank.beneficiary = child.mentionText;
                            break;
                    }
                });
                break;

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
                invoiceData.dateIssued = parseDate(entity.mentionText);
                break;
            
            case 'due_date':
                invoiceData.dateDue = parseDate(entity.mentionText);
                break;

            case 'currency':
                invoiceData.currency = convertCurrencySymbolToCode(entity.mentionText);
                break;
                
            case 'supplier_name':
                invoiceData.issuer!.name = entity.mentionText;
                break;
            
            case 'supplier_email':
                if (!invoiceData.issuer!.contactInfo) {
                    invoiceData.issuer!.contactInfo = { email: null, tel: null };
                }
                invoiceData.issuer!.contactInfo.email = entity.mentionText;
                break;

            case 'supplier_address':
                const addressLines = entity.mentionText.split('\n');
                const streetAddress = addressLines[0];
                
                let city = '', stateProvince = '', postalCode = '', country = '';
                if (addressLines[1]) {
                    const cityStateMatch = addressLines[1].match(/([^,]+),\s*(\w+)\s+(\d+)/);
                    if (cityStateMatch) {
                        city = cityStateMatch[1].trim();
                        stateProvince = cityStateMatch[2].trim();
                        postalCode = cityStateMatch[3].trim();
                    }
                }
                if (addressLines[2]) {
                    country = addressLines[2].trim();
                }

                invoiceData.issuer!.address = {
                    streetAddress,
                    city,
                    stateProvince,
                    postalCode,
                    country,
                    extendedAddress: null
                };
                invoiceData.issuer!.country = country;
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
                )?.mentionText || '1';
                
                const unitPrice = entity.children?.find(child => 
                    child.type === 'line_item/unit_price'
                )?.mentionText || '0';

                const parsedQuantity = parseFloat(quantity.replace(/,/g, ''));
                const parsedUnitPrice = parseFloat(unitPrice.replace(/,/g, ''));
                
                const description = entity.children?.find(child => 
                    child.type === 'line_item/description'
                )?.mentionText || '';
                
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
                break;

            case 'payer_name':
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

            case 'payer_address':
                const payerAddressLines = entity.mentionText.split('\n');
                
                // Initialize variables
                let payerStreetAddress = '';
                let payerExtendedAddress = '';
                let payerCity = '';
                let payerPostalCode = '';
                let payerCountry = '';
                let payerStateProvince = '';

                // Handle the specific format:
                // "The North Atrium\n3rd Floor, unit 02.\nAS. Fortuna Streets/MC.Briones Sts. Guizo\nMandaue City 6014 Cebu Philippines"
                if (payerAddressLines.length > 0) {
                    payerStreetAddress = payerAddressLines[0]; // "The North Atrium"
                    
                    if (payerAddressLines[1]) {
                        payerExtendedAddress = payerAddressLines[1]; // "3rd Floor, unit 02."
                    }

                    if (payerAddressLines[2]) {
                        payerStateProvince = payerAddressLines[2]; // "AS. Fortuna Streets/MC.Briones Sts. Guizo"
                    }

                    if (payerAddressLines[3]) {
                        // Parse "Mandaue City 6014 Cebu Philippines"
                        const lastLine = payerAddressLines[3];
                        const cityMatch = lastLine.match(/^(.*?)\s+(\d{4})\s+(.*)$/);
                        if (cityMatch) {
                            payerCity = cityMatch[1];         // "Mandaue City"
                            payerPostalCode = cityMatch[2];   // "6014"
                            payerCountry = cityMatch[3];      // "Cebu Philippines"
                        } else {
                            // Fallback if the pattern doesn't match
                            payerCity = lastLine;
                        }
                    }
                }

                invoiceData.payer!.address = {
                    streetAddress: payerStreetAddress,
                    extendedAddress: payerExtendedAddress,
                    city: payerCity,
                    postalCode: payerPostalCode,
                    country: payerCountry,
                    stateProvince: payerStateProvince
                };
                invoiceData.payer!.country = payerCountry;
                break;
            
            case 'payer_email':
                if (!invoiceData.payer!.contactInfo) {
                    invoiceData.payer!.contactInfo = { email: null, tel: null };
                }
                invoiceData.payer!.contactInfo.email = entity.mentionText;
                break;

            case 'payer_tax_id':
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
