const express = require('express');
const bodyParser = require('body-parser');
const { format, utcToZonedTime } = require('date-fns-tz');

const app = express();

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// In-memory storage for signatures (will reset when the server restarts)
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

    const newAnnouncement = { message, timestamp };
    announcements.push(newAnnouncement);

    res.status(201).json(newAnnouncement);
});

// API endpoint to delete an announcement
app.delete('/api/announcements/:id', (req, res) => {
    const id = req.params.id;
    if (announcements[id]) {
        announcements.splice(id, 1);  // Remove the announcement from the array
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

app.get('/admin', (req, res) => {
    res.send(`
        <html>
            <head>
                <title>Admin Panel</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        padding: 20px;
                        background-color: #f4f4f9;
                    }

                    h1 {
                        color: #003366;
                    }

                    form {
                        background-color: #f9f9f9;
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
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                    }

                    .delete-button {
                        background-color: red;
                        padding: 5px 10px;
                        border: none;
                        color: white;
                        cursor: pointer;
                        font-size: 14px;
                        border-radius: 5px;
                    }

                    .delete-button:hover {
                        background-color: darkred;
                    }
                </style>
            </head>
            <body>
                <h1>Create New Announcement</h1>
                <form id="announcementForm">
                    <label for="announcement">Write Announcement:</label>
                    <textarea id="announcement" rows="5"></textarea>
                    <button type="submit">Submit Announcement</button>
                </form>

                <h2>Existing Announcements</h2>
                <div id="existingAnnouncements"></div>

                <script>
                    // Fetch Existing Announcements to display on the Admin Panel
                    async function fetchAnnouncements() {
                        const response = await fetch('/api/announcements');
                        const announcements = await response.json();
                        const existingAnnouncementsDiv = document.getElementById('existingAnnouncements');

                        if (announcements.length > 0) {
                            existingAnnouncementsDiv.innerHTML = announcements
                                .map((announcement, index) => {
                                    return `
                                        <div class="announcement">
                                            <p>${announcement.message}</p>
                                            <button class="delete-button" onclick="deleteAnnouncement(${index})">Delete</button>
                                        </div>
                                    `;
                                })
                                .join('');
                        } else {
                            existingAnnouncementsDiv.innerHTML = '<p>No announcements to display.</p>';
                        }
                    }

                    // Function to delete an announcement
                    async function deleteAnnouncement(id) {
                        const response = await fetch('/api/announcements/' + id, {
                            method: 'DELETE',
                        });

                        if (response.ok) {
                            alert('Announcement deleted successfully!');
                            fetchAnnouncements();  // Refresh the list
                        } else {
                            alert('Failed to delete announcement.');
                        }
                    }

                    // Handle form submission for new announcement
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
                            fetchAnnouncements();  // Refresh the list
                        } else {
                            alert('Failed to submit announcement.');
                        }
                    });

                    // Call fetchAnnouncements when the page loads to display existing announcements
                    fetchAnnouncements();
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
