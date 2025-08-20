
import React from 'react';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';

interface PrintServerGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-900 text-white p-4 rounded-md overflow-x-auto text-sm font-mono my-2">
        <code>{children}</code>
    </pre>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-6">
        <h3 className="text-xl font-bold text-foreground mb-2">{title}</h3>
        <div className="text-muted-foreground space-y-2">{children}</div>
    </div>
);

const PrintServerGuideModal: React.FC<PrintServerGuideModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-4xl h-[90vh]">
            <ModalHeader>
                <ModalTitle>Print Server Integration Guide</ModalTitle>
            </ModalHeader>
            <ModalContent>
                <div className="space-y-6">
                    <Section title="1. What is a Print Server?">
                        <p>A print server is a small application that runs on the same computer as your POS terminal. Since web browsers cannot directly access your USB or network printers for security reasons, this server acts as a secure bridge.</p>
                        <p>The POS application sends a print request to your local server, and the server then sends the job to the physical printer.</p>
                    </Section>

                    <Section title="2. API Requirements">
                        <p>Your print server must expose a few simple HTTP endpoints for the POS to work correctly. The base URL is configured in <strong>Settings &gt; Devices</strong>.</p>
                        
                        <h4 className="font-semibold text-foreground pt-2">GET /api/health</h4>
                        <p>A simple endpoint to check if the server is running.</p>
                        <CodeBlock>{`// Successful Response (200 OK)
{
  "success": true,
  "message": "Print server is running"
}`}</CodeBlock>

                        <h4 className="font-semibold text-foreground pt-2">GET /api/printers</h4>
                        <p>Returns a list of printer names available to the server.</p>
                        <CodeBlock>{`// Successful Response (200 OK)
{
  "success": true,
  "printers": ["Kitchen Printer", "Bar Printer", "Receipt Printer"]
}`}</CodeBlock>

                        <h4 className="font-semibold text-foreground pt-2">POST /api/print/silent</h4>
                        <p>The main endpoint for receiving and printing jobs.</p>
                        <CodeBlock>{`// Request Body
{
  "data": "<BASE64_ENCODED_HTML_STRING>",
  "options": {
    "printer": "Kitchen Printer" // Name of the target printer
  }
}

// Successful Response (200 OK)
{
  "success": true,
  "message": "Job sent to printer: Kitchen Printer"
}

// Error Response (e.g., 400 or 500)
{
  "success": false,
  "error": "Printer 'Kitchen Printer' not found or offline."
}`}</CodeBlock>
                    </Section>
                    
                     <Section title="3. Example Server (Node.js)">
                        <p>Here is a basic example using Node.js and the <code className="bg-muted px-1 rounded">node-thermal-printer</code> library. You can adapt this to any language or printing library.</p>
                        <CodeBlock>{`const express = require('express');
const bodyParser = require('body-parser');
const { ThermalPrinter, PrinterTypes } = require('node-thermal-printer');

const app = express();
app.use(bodyParser.json({ limit: '10mb' }));

// Example: Define your printers
const printers = {
  "Receipt Printer": {
    type: PrinterTypes.EPSON,
    interface: 'tcp://192.168.1.123'
  },
  "Kitchen Printer": {
    type: PrinterTypes.STAR,
    interface: 'tcp://192.168.1.124'
  }
};

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: "Print server is running" });
});

app.get('/api/printers', (req, res) => {
  res.json({ success: true, printers: Object.keys(printers) });
});

app.post('/api/print/silent', async (req, res) => {
  const { data, options } = req.body;
  const printerConfig = printers[options.printer];

  if (!printerConfig) {
    return res.status(400).json({ success: false, error: \`Printer '\${options.printer}' not found.\` });
  }

  const printer = new ThermalPrinter(printerConfig);

  try {
    const isConnected = await printer.isPrinterConnected();
    if (!isConnected) throw new Error('Printer not connected.');

    // The POS sends HTML, but for this library we convert to text/commands
    // A real implementation might use puppeteer to render HTML to an image
    // For simplicity, we'll assume text can be extracted.
    const decodedHtml = Buffer.from(data, 'base64').toString('utf8');
    // Basic text extraction (you would need a better parser)
    const textContent = decodedHtml.replace(/<[^>]+>/g, '\\n');
    
    printer.println(textContent);
    printer.cut();
    
    await printer.execute();
    res.json({ success: true, message: \`Job sent to printer: \${options.printer}\` });

  } catch (error) {
    console.error("Print Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(\`Print server listening on port \${PORT}\`);
});
`}</CodeBlock>
                    </Section>
                </div>
            </ModalContent>
            <ModalFooter>
                <Button onClick={onClose}>Close</Button>
            </ModalFooter>
        </Modal>
    );
};

export default PrintServerGuideModal;