import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';

const GRAPHQL_ENDPOINT = 'https://switchboard-dev.powerhouse.xyz/d/teeps';

async function fetchGraphQL(query: string, variables: any = {}) {
  const response = await fetch(GRAPHQL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query, variables })
  });

  const { data, errors } = await response.json();
  if (errors) throw new Error(JSON.stringify(errors));
  return data;
}

async function fetchInvoiceDocuments(): Promise<any[]> {
  const allDocsQuery = `
    query Query {
      documents
    }
  `;

  const singleDocQuery = `
    query Query($documentId: String!) {
      document(id: $documentId) {
        stateJSON
      }
    }
  `;

  const docIdsResponse = await fetchGraphQL(allDocsQuery);
  const documentIds = docIdsResponse.documents;

  const results: any[] = [];

  for (const id of documentIds) {
    const stateResp = await fetchGraphQL(singleDocQuery, { documentId: id });
    const stateJSON = stateResp.document.stateJSON;
    results.push({
      id,
      state: stateJSON,
      stateJSON
    });
  }

  return results;
}

function transformInvoicesToXeroCSV(invoices: any[]): string {
  const headers = [
    'Narration',
    'Date',
    'Description',
    'AccountCode',
    'TaxRate',
    'Amount',
    'TrackingName1',
    'TrackingOption1',
    'TrackingName2',
    'TrackingOption2'
  ];

  const rows: string[][] = [];

  invoices.forEach((invoice) => {
    const state = invoice.state;
    const items = state.lineItems || [];
    const date = state.dateIssued || '';
    const narration = `${state.issuer?.name || 'Supplier'}, invoice ${state.invoiceNo || ''}`;

    const total = Number(state.totalPriceTaxIncl || 0);
    if (total) {
      rows.push([
        narration,
        date,
        'Accounts Payable',
        '802',
        'Tax Exempt (0%)',
        `-${total.toFixed(2)}`,
        '', '', '', ''
      ]);
    }

    items.forEach((item: any) => {
        console.log(item)
      rows.push([
        narration,
        date,
        item.description || 'Service Item',
        item.accountCode?.toString() || '',
        'Tax Exempt (0%)',
        (item.totalPriceTaxIncl || 0).toFixed(2),
        '', '', '', ''
      ]);
    });
  });

  const csvLines = [headers.join(',')].concat(rows.map(row => row.map(value => `"${value}"`).join(',')));
  return csvLines.join('\n');
}

async function exportInvoicesToXeroCSV() {
  try {
    const invoices = await fetchInvoiceDocuments();
    const csvData = transformInvoicesToXeroCSV(invoices);
    const outputPath = path.join(__dirname, 'xero-invoice-import.csv');

    fs.writeFileSync(outputPath, csvData);
    console.log(`CSV export complete: ${outputPath}`);
  } catch (error) {
    console.error('Failed to export invoices:', error);
  }
}

exportInvoicesToXeroCSV();
