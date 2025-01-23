const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { format } = require('date-fns');

const app = express();

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

// Path to save the signatures
const filePath = path.join(__dirname, 'signatures.txt');

// API endpoint to handle form submissions
app.post('/api/signatures', (req, res) => {
    const name = req.body.name;
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');

    const logEntry = `Name: ${name}, Timestamp: ${timestamp}\n`;

    // Append the entry to the signatures.txt file
    fs.appendFile(filePath, logEntry, (err) => {
        if (err) {
            console.error('Error saving signature:', err);
            return res.status(500).json({ error: 'Failed to save signature' });
        }

        console.log('Signature saved:', logEntry);
        res.status(200).json({ message: 'Signature saved successfully!' });
    });
});

// Start the server
const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
