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
                        <p>A print server is a small application that runs on the same local network as your POS terminal. Since web browsers cannot directly access your USB or network printers for security reasons, this server acts as a secure bridge.</p>
                        <p>The POS application sends a print request to your local server, and the server then sends the job to the physical printer.</p>
                    </Section>

                    <Section title="2. The Most Important Debugging Tool: Developer Console">
                        <p>If you have problems, the <strong>browser's developer console</strong> is your best friend. Press <strong>F12</strong> (or Cmd+Opt+I on Mac) to open it.</p>
                        <p>Look at the <strong>"Console"</strong> and <strong>"Network"</strong> tabs. Errors related to CORS or connectivity will appear here in red with detailed explanations that are much more helpful than the simple "Test Failed" message.</p>
                    </Section>

                    <Section title="3. Example Server (Node.js)">
                        <p>Here is a robust example using Node.js and Express. This server correctly handles CORS, accepts large print jobs, and includes the required endpoints.</p>
                        <p>To run this, save it as `server.js`, run `npm install express cors`, and then run `node server.js` in your terminal.</p>
                        <CodeBlock>{`const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3000; // You can change this port if needed

// --- MIDDLEWARE SETUP ---

// 1. Enable CORS (Cross-Origin Resource Sharing)
// This is the MOST IMPORTANT step. It allows the web-based POS
// to send requests to this local server. Without this, browsers
// will block the print requests for security reasons.
app.use(cors());

// 2. Increase Request Body Size Limit
// Print jobs, especially with images, can be large. This increases
// the limit to prevent "payload too large" errors.
app.use(express.json({ limit: '10mb' }));

// --- API ENDPOINTS ---

// GET /health: A simple check to see if the server is alive.
// The POS uses this to confirm it can reach the server.
app.get('/health', (req, res) => {
  console.log('Health check received');
  res.json({ status: "ok" });
});

// POST /print: The endpoint that receives and processes print jobs.
app.post('/print', (req, res) => {
  try {
    const { printer, data } = req.body;

    if (!printer || data === undefined) {
      return res.status(400).json({ success: false, error: "Missing 'printer' or 'data' field." });
    }

    console.log(\`Received print job for printer: "\${printer}"\`);
    
    // The 'data' is a Base64 encoded string of the HTML receipt.
    // We decode it back to a regular string here.
    const decodedHtml = Buffer.from(data, 'base64').toString('utf8');
    
    // =======================================================
    // YOUR ACTUAL PRINTER LOGIC GOES HERE.
    // This part depends on your specific printer hardware and libraries.
    // Examples: node-thermal-printer, puppeteer, etc.
    // =======================================================
    console.log(\`Simulating print for '\${printer}'. Job size: \${decodedHtml.length} chars.\`);
    // For demonstration, we'll just log the HTML.
    // console.log(decodedHtml);
    
    // Respond to the POS to confirm the job was received.
    res.json({ success: true, message: \`Job for '\${printer}' sent successfully (simulated).\` });
  } catch (error) {
    console.error("!!! SERVER ERROR ON /print ENDPOINT:", error);
    res.status(500).json({ success: false, error: "An internal server error occurred. Check server logs." });
  }
});

// --- START THE SERVER ---
app.listen(PORT, '0.0.0.0', () => {
  console.log(\`Print server is listening on http://localhost:\${PORT}\`);
  console.log('IMPORTANT: In the POS Device Settings, use your computer\\'s network IP address, not "localhost".');
  console.log('Example: http://192.168.1.101:3000');
});
`}</CodeBlock>
                    </Section>

                    <Section title="4. Troubleshooting Common Errors">
                        <div className="bg-destructive/10 border-l-4 border-destructive text-destructive-foreground p-4 rounded-md mb-4">
                            <h4 className="font-bold">If the 'Test' button shows: "CORS Error"</h4>
                            <p className="text-sm mt-1">This is the most common issue. It means your server isn't allowing the POS to connect.</p>
                            <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                                <li><strong>Solution:</strong> Ensure your server code includes CORS middleware, like <strong><code>app.use(cors());</code></strong> in the Node.js example. This is critical.</li>
                                <li>Check the F12 Developer Console for the exact CORS error message.</li>
                                <li>Make sure you are not accessing a secure (https://) POS with an insecure (http://) print server. This is "mixed content" and is blocked by browsers.</li>
                            </ul>
                        </div>

                         <div className="bg-yellow-500/10 border-l-4 border-yellow-500 text-yellow-300 p-4 rounded-md mb-4">
                            <h4 className="font-bold">If the 'Test' button shows: "Unreachable"</h4>
                            <p className="text-sm mt-1">This means the POS could not find your server at the specified URL.</p>
                            <ul className="text-sm mt-2 list-disc list-inside space-y-1">
                                <li>Is your server running? Check the terminal where you ran <code>node server.js</code>.</li>
                                <li>Did you use the correct IP address? If the POS is on a different device (like a tablet), you <strong>must use the computer's network IP</strong> (e.g., <code>http://192.168.1.105:3000</code>), not <code>localhost</code>.</li>
                                <li>Is a firewall blocking the port (e.g., 3000)? Try temporarily disabling it to check.</li>
                                <li>Can you open the health URL (e.g., <code>http://192.168.1.105:3000/health</code>) in your browser directly?</li>
                            </ul>
                        </div>

                        <div className="bg-orange-500/10 border-l-4 border-orange-500 text-orange-400 p-4 rounded-md my-4">
                            <h4 className="font-bold">If you see a "500 Server Error"</h4>
                            <p className="text-sm mt-1">This means your server received the request but crashed while processing it. The problem is inside your server's code.</p>
                            <p className="text-sm mt-2"><strong>Solution:</strong> Look at the terminal window where your server is running (where you typed `node server.js`). A detailed error message and a "stack trace" will be printed there, pointing to the line of code that failed.</p>
                        </div>
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