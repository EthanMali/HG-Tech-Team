const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const { format } = require('date-fns'); // For formatting the date and time

const app = express();

// Middleware to parse incoming requests
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());  // To handle JSON requests

// Path to store the signatures file on Render's persistent disk
const filePath = '/mnt/data/signatures.txt'; // Ensure this path exists in Render environment

// Route to handle signature submission (POST /api/signatures)
app.post('/api/signatures', (req, res) => {
    const name = req.body.signature;
    if (!name) {
        return res.status(400).json({ error: 'Name is required.' });
    }

    // Format the current date and time into a human-readable format
    const timestamp = format(new Date(), 'MMMM dd, yyyy, hh:mm a'); // Example: "January 22, 2025, 10:20 AM"
    
    const log = `${timestamp}: ${name}\n`;

    // Append the signature and timestamp to the file
    fs.appendFile(filePath, log, (err) => {
        if (err) {
            console.error('Failed to save signature:', err);
            return res.status(500).json({ error: 'Error saving signature.' });
        }
        console.log('Signature saved:', log);
        return res.status(200).json({ message: 'Signature submitted successfully!' });
    });
});

// Route to retrieve all signatures (GET /api/signatures)
app.get('/api/signatures', (req, res) => {
    // Read the signature file
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Failed to read signatures:', err);
            return res.status(500).json({ error: 'Error retrieving signatures.' });
        }

        // Process the data into an array of signature objects with timestamp and name
        const signatures = data.split('\n').filter(line => line).map(line => {
            const [timestamp, name] = line.split(': ');
            return { timestamp, name };
        });

        return res.status(200).json({ signatures });
    });
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
