import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import axios from 'axios';
import { Play, Code2, Loader2 } from 'lucide-react';
import { Toaster, toast } from 'react-hot-toast';

const LANGUAGE_VERSIONS = {
  javascript: 'Node.js 18.x',
  python: 'Python 3.10',
  cpp: 'GCC 11.x',
};

const DEFAULT_CODE = {
  javascript: `// Welcome to the Online Code Execution Engine
// Write your JavaScript code here

function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet('Developer'));
`,
  python: `# Welcome to the Online Code Execution Engine
# Write your Python code here

def greet(name):
    return f"Hello, {name}!"

print(greet("Developer"))
`,
  cpp: `// Welcome to the Online Code Execution Engine
// Write your C++ code here

#include <iostream>

int main() {
    std::cout << "Hello, Developer!" << std::endl;
    return 0;
}
`
};

function App() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(DEFAULT_CODE['javascript']);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('output');
  const [isError, setIsError] = useState(false);

  const handleLanguageChange = (e) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    setCode(DEFAULT_CODE[newLang]);
  };

  const handleRunCode = async () => {
    setIsLoading(true);
    setOutput('');
    setActiveTab('output');
    setIsError(false);

    try {
      // Use environment variable for backend URL, fallback to localhost for local dev
      const API_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';
      const response = await axios.post(`${API_URL}/execute`, {
        language,
        code,
        input
      });

      setOutput(response.data.output);
      toast.success('Execution completed');
    } catch (error) {
      console.error(error);
      setIsError(true);
      if (error.response && error.response.data) {
        setOutput(error.response.data.error || 'Execution failed');
      } else {
        setOutput('Network error. Is the backend server running?');
      }
      toast.error('Execution failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="app-container">
      <Toaster position="top-right" />
      {/* Navbar Section */}
      <header className="navbar">
        <div className="navbar-brand">
          <Code2 size={24} color="var(--accent-primary)" />
          <span>CodeRunner Pro</span>
        </div>
        <div className="navbar-actions">
          <select
            className="select-dropdown"
            value={language}
            onChange={handleLanguageChange}
          >
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="python">Python 3</option>
            <option value="cpp">C++ (GCC)</option>
          </select>
          <button
            className="btn btn-success"
            onClick={handleRunCode}
            disabled={isLoading}
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
            <span>Run Code</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Section */}
      <main className="main-workspace">
        <section className="editor-section">
          <div className="editor-header">
            <span>{language}.{language === 'python' ? 'py' : language === 'cpp' ? 'cpp' : 'js'}</span>
            <span style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }}>
              {LANGUAGE_VERSIONS[language]}
            </span>
          </div>
          <div className="monaco-container">
            <Editor
              height="100%"
              language={language.replace('cpp', 'cpp')}
              theme="vs-dark"
              value={code}
              onChange={(value) => setCode(value || '')}
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: 'Fira Code, monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
              }}
            />
          </div>
        </section>

        {/* Side Panel Section */}
        <section className="panel-section">
          <div className="panel-tabs">
            <div
              className={`panel-tab ${activeTab === 'input' ? 'active' : ''}`}
              onClick={() => setActiveTab('input')}
            >
              Input (stdin)
            </div>
            <div
              className={`panel-tab ${activeTab === 'output' ? 'active' : ''}`}
              onClick={() => setActiveTab('output')}
            >
              Output
            </div>
          </div>
          <div className="panel-content">
            {activeTab === 'input' ? (
              <textarea
                className="textarea-input"
                placeholder="Enter standard input here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
            ) : (
              <div className={`output-container ${isError ? 'error-text' : ''}`}>
                {isLoading ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)' }}>
                    <Loader2 size={16} className="animate-spin" />
                    Executing...
                  </div>
                ) : (
                  output || 'Run your code to see the output here.'
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
