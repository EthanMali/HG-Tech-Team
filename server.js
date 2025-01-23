const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Path to save the signatures
const filePath = path.join(__dirname, 'signatures.json');

// Initialize signatures storage
let signatures = [];
if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    if (fileData) {
        signatures = JSON.parse(fileData);
    }
}

// Serve static files (e.g., your HTML form)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to handle form submissions
app.post('/api/signatures', (req, res) => {
    const name = req.body.name;
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const entry = { name, timestamp };
    signatures.push(entry);

    // Save to signatures.json file
    fs.writeFile(filePath, JSON.stringify(signatures, null, 2), (err) => {
        if (err) {
            console.error('Error saving signature:', err);
            return res.status(500).json({ error: 'Failed to save signature' });
        }

        console.log('Signature saved:', entry);

        // Respond with a styled "Thank You" page
        res.send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Thank You</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        text-align: center;
                        background-color: #f4f4f9;
                        color: #333;
                        margin: 0;
                        padding: 20px;
                    }
                    h1 {
                        color: #003366;
                        margin-bottom: 20px;
                    }
                    p {
                        font-size: 18px;
                        margin-bottom: 30px;
                    }
                    a {
                        display: inline-block;
                        text-decoration: none;
                        color: white;
                        background-color: #003366;
                        padding: 10px 20px;
                        border-radius: 5px;
                        font-size: 16px;
                        transition: background-color 0.3s;
                    }
                    a:hover {
                        background-color: #0055aa;
                    }
                </style>
            </head>
            <body>
                <h1>Thank You!</h1>
                <p>Your acknowledgment has been submitted successfully.</p>
                <a href="/">Back to Home</a>
            </body>
            </html>
        `);
    });
});

// API endpoint to retrieve all signatures
app.get('/api/signatures', (req, res) => {
    res.json(signatures);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
