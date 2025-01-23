const express = require('express');
const bodyParser = require('body-parser');
const { format, utcToZonedTime } = require('date-fns-tz');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage for announcements (will reset when the server restarts)
let announcements = [];

// Timezone configuration (Replace with your specific timezone)
const TIME_ZONE = 'America/New_York';

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
                        }

                        h1 {
                            color: #003366;
                        }

                        .announcement {
                            background-color: #fff;
                            border: 1px solid #ddd;
                            padding: 20px;
                            margin: 10px 0;
                            border-radius: 8px;
                            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                        }

                        .announcement p {
                            font-size: 18px;
                        }

                        button {
                            background-color: #003366;
                            color: white;
                            padding: 10px 20px;
                            font-size: 16px;
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
