const express = require('express');
const bodyParser = require('body-parser');
const { format, utcToZonedTime } = require('date-fns-tz');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage for signatures and announcements (will reset when the server restarts)
let signatures = [];
let announcements = [];

// Timezone configuration (Replace with your specific timezone)
const TIME_ZONE = 'America/New_York';

// Serve static files (e.g., HTML form in `public` folder)
app.use(express.static('public'));

// API endpoint to handle form submissions (signatures)
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

// API endpoint to retrieve all signatures
app.get('/api/signatures', (req, res) => {
    res.json(signatures);
});

// API endpoint to get all announcements
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

    const newAnnouncement = { message, timestamp };
    announcements.push(newAnnouncement);

    res.status(201).json(newAnnouncement);
});

// Serve the Admin Panel to create announcements
app.get('/admin', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Admin Panel</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }

                    h1 {
                        color: #003366;
                    }

                    form {
                        background-color: #fff;
                        padding: 20px;
                        border-radius: 8px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }

                    label {
                        display: block;
                        margin-bottom: 10px;
                        font-size: 16px;
                    }

                    textarea {
                        width: 100%;
                        padding: 10px;
                        font-size: 16px;
                        margin-bottom: 20px;
                        border: 1px solid #ddd;
                        border-radius: 4px;
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

                    .announcement {
                        background-color: #fff;
                        border: 1px solid #ddd;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 8px;
                        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                    }

                    .announcement h3 {
                        margin-top: 0;
                        color: #003366;
                    }

                    .announcement p {
                        color: #333;
                    }
                </style>
            </head>
            <body>
                <h1>Create New Announcement</h1>
                <form id="announcementForm">
                    <label for="announcement">Write Announcement:</label>
                    <textarea id="announcement" rows="5" placeholder="Write your announcement here..."></textarea>
                    <button type="submit">Submit Announcement</button>
                </form>

                <h3>Existing Announcements</h3>
                <div>
                    ${announcements
                        .map((announcement) => {
                            return `
                                <div class="announcement">
                                    <h3>Announcement: ${announcement.timestamp}</h3>
                                    <p>${announcement.message}</p>
                                </div>
                            `;
                        })
                        .join('')}
                </div>

                <script>
                    document.getElementById('announcementForm').addEventListener('submit', async (event) => {
                        event.preventDefault();
                        const announcementMessage = document.getElementById('announcement').value;

                        const response = await fetch('/api/announcements', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ message: announcementMessage }),
                        });

                        if (response.ok) {
                            alert('Announcement submitted successfully!');
                            document.getElementById('announcement').value = '';  // Reset form
                            location.reload();  // Reload the page to show updated announcements
                        } else {
                            alert('Failed to submit announcement.');
                        }
                    });
                </script>
            </body>
        </html>
    `);
});

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
