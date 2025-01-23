const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Serve the policy HTML file
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/policy.html');
});

// Handle form submission
app.post('/submit-signature', (req, res) => {
    const name = req.body.signature;
    const timestamp = new Date().toISOString();

    const log = `${timestamp}: ${name}\n`;

    // Append the signature to a file
    fs.appendFile('signatures.txt', log, (err) => {
        if (err) {
            console.error('Failed to save signature:', err);
            return res.status(500).send('Error saving signature');
        }
        console.log('Signature saved:', log);
        res.send('<h1>Thank you for submitting your acknowledgment!</h1>');
    });
});

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
