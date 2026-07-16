const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { runCode } = require('./executeContainer');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.post('/execute', async (req, res) => {
    const { language, code, input } = req.body;

    if (!language || !code) {
        return res.status(400).json({ error: 'Language and code are required' });
    }

    try {
        const { output } = await runCode(language, code, input);
        res.status(200).json({ output });
    } catch (error) {
        // Return 400 for a bad execution rather than a 500 server crash
        res.status(400).json({ error: error.error || 'Unknown execution error' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
