const express = require('express');
const bodyParser = require('body-parser');
const { format, utcToZonedTime } = require('date-fns-tz');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage for announcements and policy signings (will reset when the server restarts)
let announcements = [];
let policySignatures = [];

// Timezone configuration (Replace with your specific timezone)
const TIME_ZONE = 'America/Chicago';

// Serve static files (e.g., HTML form in `public` folder)
app.use(express.static('public'));

// API endpoint to retrieve all announcements
app.get('/api/announcements', (req, res) => {
    res.json(announcements);
});

// API endpoint to add a new announcement (admin)
app.post('/api/announcements', (req, res) => {
    const message = req.body.message;

    if (!message) {
        return res.status(400).json({ error: 'Announcement message is required' });
    }

    const zonedDate = utcToZonedTime(new Date(), TIME_ZONE);
    const timestamp = format(zonedDate, 'yyyy-MM-dd hh:mm:ss a', { timeZone: TIME_ZONE });

    const newAnnouncement = { id: announcements.length, message, timestamp };
    announcements.push(newAnnouncement);

    // Respond with the Thank You page
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
                <h1>Thank You!</h1>
                <p>Your announcement has been successfully submitted.</p>
                <button onclick="window.location.href='/'">Go Back Home</button>
            </body>
        </html>
    `);
});

// API endpoint to delete an announcement
app.delete('/api/announcements/:id', (req, res) => {
    const id = req.params.id;
    const index = announcements.findIndex(a => a.id == id);
    
    if (index !== -1) {
        announcements.splice(index, 1);  // Remove the announcement from the array
        res.status(200).json({ message: 'Announcement deleted successfully' });
    } else {
        res.status(404).json({ error: 'Announcement not found' });
    }
});



// API endpoint to retrieve all policy signings
app.get('/api/signatures', (req, res) => {
    res.json(policySignatures);
});

// API endpoint for signing policies
app.post('/api/signatures', (req, res) => {
    const { name, checked } = req.body;

    if (!name || checked !== true) {
        return res.status(400).json({ error: 'You must agree to the policy by checking the box.' });
    }

    const zonedDate = utcToZonedTime(new Date(), TIME_ZONE);
    const timestamp = format(zonedDate, 'yyyy-MM-dd hh:mm:ss a', { timeZone: TIME_ZONE });

    const signature = { id: policySignatures.length, name, timestamp, checked };
    policySignatures.push(signature);

    // Respond with a Thank You page after signing the policy
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


// Dynamic route to display a full announcement
app.get('/announcement/:id', (req, res) => {
    const id = req.params.id;

    if (announcements[id]) {
        res.send(`
            <html>
                <head>
                    <title>Announcement Details</title>
                    <style>
                        body {
                            font-family: Arial, sans-serif;
                            padding: 20px;
                            background-color: #f9f9f9;
                        }

                        h1 {
                            color: #003366;
                            font-size: 2em;
                            text-align: center;
                        }

                        .announcement {
                            background-color: #fff;
                            border: 1px solid #ddd;
                            padding: 20px;
                            margin: 20px auto;
                            max-width: 800px;
                            border-radius: 8px;
                            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                            text-align: center;
                        }

                        .announcement p {
                            font-size: 1.2em;
                            line-height: 1.6;
                            color: #333;
                        }

                        button {
                            background-color: #003366;
                            color: white;
                            padding: 10px 20px;
                            font-size: 16px;
                            border: none;
                            border-radius: 5px;
                            cursor: pointer;
                            transition: background-color 0.3s;
                        }

                        button:hover {
                            background-color: #0055a5;
                        }
                    </style>
                </head>
                <body>
                    <h1>Announcement</h1>
                    <div class="announcement">
                        <p>${announcements[id].message}</p>
                    </div>
                    <button onclick="window.location.href='/'">Back to Home</button>
                </body>
            </html>
        `);
    } else {
        res.status(404).send('Announcement not found');
    }
});

// Serve the external admin.html page directly
app.get('/admin', (req, res) => {
    res.sendFile(__dirname + '/public/admin.html'); // Ensure this is the correct path to your external admin.html
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
