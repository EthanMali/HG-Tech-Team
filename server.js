const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');
const { format, utcToZonedTime } = require('date-fns-tz');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Path to save the signatures
const filePath = '/mnt/data/signatures.json'; // Adjust this path if you're not using Render or persistent disks

// Initialize signatures storage
let signatures = [];
if (fs.existsSync(filePath)) {
    const fileData = fs.readFileSync(filePath, 'utf8');
    if (fileData) {
        signatures = JSON.parse(fileData);
    }
}

// Timezone configuration (Replace with your specific timezone)
const TIME_ZONE = 'America/New_York';

// Serve static files (e.g., HTML form in `public` folder)
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to handle form submissions
app.post('/api/signatures', (req, res) => {
    const name = req.body.name;

    // Convert the current date to the desired timezone
    const zonedDate = utcToZonedTime(new Date(), TIME_ZONE);

    // Format the date in 12-hour format
    const timestamp = format(zonedDate, 'yyyy-MM-dd hh:mm:ss a', { timeZone: TIME_ZONE });

    if (!name) {
        return res.status(400).json({ error: 'Name is required' });
    }

    const entry = { name, timestamp };
    signatures.push(entry);

    // Save the signatures to the file
    fs.writeFile(filePath, JSON.stringify(signatures, null, 2), (err) => {
        if (err) {
            console.error('Error saving signature:', err);
            return res.status(500).json({ error: 'Failed to save signature' });
        }

        console.log('Signature saved:', entry);

        // Respond with a Thank You page and a button to return home
        res.send(`
            <html>
                <head>
                    <title>Thank You</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            text-align: center;
                            padding: 50px;
                            background-color: #f4f4f9;
                        }
                        h1 {
                            color: #003366;
                        }
                        button {
                            padding: 10px 20px;
                            font-size: 16px;
                            background-color: #003366;
                            color: white;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                        }
                        button:hover {
                            background-color: #0055a5;
                        }
                    </style>
                </head>
                <body>
                    <h1>Thank You, ${name}!</h1>
                    <p>Your acknowledgment has been recorded.</p>
                    <button onclick="window.location.href='/'">Go Back Home</button>
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
