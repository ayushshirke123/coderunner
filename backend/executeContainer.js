const JUDGE0_API_URL = 'https://ce.judge0.com/submissions?base64_encoded=false&wait=true';

// Mapping our frontend language keys to Judge0 API language IDs
const LANGUAGE_MAP = {
    javascript: { language_id: 93 }, // Node.js 18.15.0
    python: { language_id: 100 },    // Python 3.12
    cpp: { language_id: 54 }         // C++ (GCC 9.2.0)
};

const runCode = async (langKey, code, input) => {
    const config = LANGUAGE_MAP[langKey];
    if (!config) {
        throw { error: 'Unsupported language' };
    }

    try {
        const response = await fetch(JUDGE0_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                language_id: config.language_id,
                source_code: code,
                stdin: input || ''
            })
        });

        const data = await response.json();

        // If Judge0 rejected the request immediately (e.g. rate limit)
        if (!response.ok) {
            throw { error: data.error || data.message || 'Execution engine rate limited or unavailable.' };
        }

        // Judge0 returns various outputs depending on compilation/execution status
        const finalOutput = data.stdout || data.stderr || data.compile_output || data.message || '';

        return { output: finalOutput };

    } catch (error) {
        throw { error: error.error || error.message || 'Error communicating with code execution engine' };
    }
};

module.exports = { runCode };
