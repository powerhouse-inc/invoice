import axios from 'axios';

const API_URL = 'https://api.request.finance/invoices';
const API_KEY = process.env.REQUEST_FINANCE_API_KEY; // Store in .env file

export const requestDirectPayment = async (invoiceData: any) => {
    console.log('Getting a request to create an invoice', invoiceData.invoiceNumber);
    try {
        // First API call to create the invoice
        const response = await axios.post(API_URL, invoiceData, {
            headers: {
                "Authorization": `${API_KEY}`,
                'Content-Type': 'application/json',
                'X-Network': 'mainnet',
            },
        });

        console.log('Server: Invoice created successfully:', response.data.id);

        try {
            // Second API call to make it on-chain
            const onChainResponse = await axios.post(
                `https://api.request.finance/invoices/${response.data.id}`,
                {},
                {
                    headers: {
                        'Authorization': `${API_KEY}`,
                        'Content-Type': 'application/json',
                        'X-Network': 'mainnet',
                    },
                }
            );
            console.log('Server: Invoice made on-chain successfully:', onChainResponse.data.invoiceLinks);

            // Send only one response
            return onChainResponse.data;
        } catch (error) {
            console.error('Server: Error making invoice on-chain:', error);
            return error;
        }

    } catch (error: any) {
        console.error('Error creating invoice: error.response', error.response.data);
        return error.response.data;
    }


};
