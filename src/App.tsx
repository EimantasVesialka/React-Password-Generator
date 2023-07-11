import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSyncAlt, faCopy, faUnlockAlt, faLock, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { ToastContainer, toast } from 'react-toastify';
import Switch from 'react-switch';
import tippy from 'tippy.js';
import axios from 'axios';
import './tailwind.css';
import 'tippy.js/dist/tippy.css';
import 'react-toastify/dist/ReactToastify.css';
import 'react-toggle/style.css';

function generatePassword(
  length: number,
  useCapitalLetters: boolean,
  useDigits: boolean,
  useSymbols: boolean,
  wordSeparator: string
) {
  const uppercaseLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lowercaseLetters = 'abcdefghijklmnopqrstuvwxyz';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+<>?';

  let characterSet = lowercaseLetters;

  if (useCapitalLetters) {
    characterSet += uppercaseLetters;
  }

  if (useDigits) {
    characterSet += numbers;
  }

  if (useSymbols) {
    characterSet += symbols;
  }

  let generatedPassword = '';

  // Randomly select characters from the combined character set
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characterSet.length);
    generatedPassword += characterSet[randomIndex];
  }

  return generatedPassword;
}


function App() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState('Weak password');
  const generateButtonRef = useRef(null);
  const copyButtonRef = useRef(null);
  const [length, setLength] = useState(12);
  const [useCapitalLetters, setUseCapitalLetters] = useState(false);
  const [useDigits, setUseDigits] = useState(false);
  const [useSymbols, setUseSymbols] = useState(false);
  const [passwordType, setPasswordType] = useState('characters');
  const [wordSeparator, setWordSeparator] = useState('-');

  const handleSeparatorChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setWordSeparator(event.target.value);
  };

  const handleCapitalLettersChange = (checked: boolean) => {
    setUseCapitalLetters(checked);
  };

  const handleDigitsChange = (checked: boolean) => {
    setUseDigits(checked);
  };

  const handleSymbolsChange = (checked: boolean) => {
    setUseSymbols(checked);
  };

  useEffect(() => {
    if (passwordType === 'characters') {
      if (length > 60) {
        setLength(60);
        generatePassword(60, useCapitalLetters, useDigits, useSymbols, wordSeparator);
      }
    } else if (passwordType === 'words') {
      if (length > 10) {
        setLength(10);
        generatePassword(10, useCapitalLetters, useDigits, useSymbols, wordSeparator);
      }
    }
  }, [passwordType, length, useCapitalLetters, useDigits, useSymbols, wordSeparator]);  

  useEffect(() => {
    if (generateButtonRef.current) {
      tippy(generateButtonRef.current, {
        content: 'Generate password',
      });
    }
    if (copyButtonRef.current) {
      tippy(copyButtonRef.current, {
        content: 'Copy password',
      });
    }
  }, []);
  
  useEffect(() => {
    // Generate initial password when page loads for the first time
    generateRandomPassword();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    // Regenerate password whenever any of the options changes
    generateRandomPassword();
    // eslint-disable-next-line
  }, [passwordType, length, useCapitalLetters, useDigits, useSymbols, wordSeparator]);  

  function handleGeneratePasswordClick() {
    generateRandomPassword();
  }

  function copyPassword() {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(password);
      toast.success('Password copied!', {
        position: toast.POSITION.BOTTOM_RIGHT,
        closeOnClick: true,
        autoClose: 2000,
      });
    }
  }

  const generateRandomPassword = () => {
    let generatedPassword = '';
    let passwordStrength = '';
  
    if (passwordType === 'characters') {
      generatedPassword = generatePassword(
        length,
        useCapitalLetters,
        useDigits,
        useSymbols,
        wordSeparator
      );
  
      passwordStrength = getPasswordStrength(generatedPassword);
      setPassword(generatedPassword);
      setStrength(passwordStrength);
    } else if (passwordType === 'words') {
      // Pull random english words using axios
      axios
        .get('https://raw.githubusercontent.com/first20hours/google-10000-english/master/google-10000-english.txt')
        .then(response => {
          const wordPool: string[] = response.data.split('\n').map((word: string) => word.trim());
  
          for (let i = 0; i < length; i++) {
            const randomIndex = Math.floor(Math.random() * wordPool.length);
            let word = wordPool[randomIndex];
            const isFirstWord = i === 0;
            const isLastWord = i === length - 1;
  
            if (useCapitalLetters && !isFirstWord && !isLastWord) {
              const randomCase = Math.random() < 0.5 ? 'lower' : 'upper';
              const capitalizedWord =
                randomCase === 'lower'
                  ? word.charAt(0).toLowerCase() + word.slice(1)
                  : word.charAt(0).toUpperCase() + word.slice(1);
              word = capitalizedWord;
            }
  
            if (useSymbols) {
              word = word.replace(/a/gi, '4');
              word = word.replace(/e/gi, '3');
              word = word.replace(/l/gi, '1');
              word = word.replace(/o/gi, '0');
              word = word.replace(/s/gi, '5');
              word = word.replace(/t/gi, '7');
            }
  
            generatedPassword += word;
  
            if (!isLastWord) {
              generatedPassword += wordSeparator;
            }
          }
  
          passwordStrength = getPasswordStrength(generatedPassword);
          setPassword(generatedPassword);
          setStrength(passwordStrength);
        })
    }
  }  

  function getPasswordStrength(password: string) {
    const hasLowercase = /[a-z]/.test(password);
    const hasUppercase = /[A-Z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSymbol = /[^A-Za-z0-9]/.test(password);
    const length = password.length;
  
    // Count how many types of characters are present
    const typesCount = [hasLowercase, hasUppercase, hasNumber, hasSymbol].filter(Boolean).length;

    // Strong password if: 4 types of characters and length >= 8, or 3 types with length > 12, or 2 types with length > 20 or any type with length > 50
    if ((typesCount === 4 && length >= 8) || (typesCount >= 3 && length > 12) || (typesCount >= 2 && length > 20) || length > 50) {
      return 'Strong password';
    }

    // Moderate password if: 3 types of characters and length >= 8, or 2 types and length >= 12, or any type with length > 12
    if ((typesCount === 3 && length >= 8) || (typesCount === 2 && length >= 12) || length > 12) {
      return 'Moderate password';
    }
  
    // Weak password if: all other passwords
    return 'Weak password';
  }
  
  return (
  <div className="App">
    <ToastContainer/>
    <header className="App-header">
      <h1>Password generator</h1>
    </header>
    
    <div className="App-password">
      <p>{password}</p>
    </div>
    
    <p className={`password-strength ${strength === 'Weak password' ? 'red' : strength === 'Strong password' ? 'green' : 'orange'}`}>
    {strength === 'Weak password' ? <FontAwesomeIcon icon={faUnlockAlt} className="icon" /> : strength === 'Strong password' ? <FontAwesomeIcon icon={faLock} className="icon"/> : <FontAwesomeIcon icon={faCheckCircle} className="icon" />}
    {strength}
    </p>
    
    <div className="button-container">
      <div className="generate-button">
        <button ref={generateButtonRef} onClick={handleGeneratePasswordClick}>
          <FontAwesomeIcon icon={faSyncAlt} />
        </button>
      </div>
      
      <div className="copy-button">
        <button ref={copyButtonRef} onClick={copyPassword}>
          <FontAwesomeIcon icon={faCopy} />
        </button>
      </div>
    </div>
    
    <div className="App-options">
      <div className="option">
        <p>Type</p>
        <div className="toggle">
          <input
            type="radio"
            id="charactersRadio"
            value="characters"
            checked={passwordType === 'characters'}
            onChange={(e) => setPasswordType(e.target.value)}
            className="hidden"
          />
          <label
            htmlFor="charactersRadio"
            className={`bg-gray-200 rounded-full px-4 py-2 mr-2 cursor-pointer ${
              passwordType === 'characters' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Characters
          </label>
        </div>
        
        <div className="toggle">
          <input
            type="radio"
            id="wordsRadio"
            value="words"
            checked={passwordType === 'words'}
            onChange={(e) => setPasswordType(e.target.value)}
            className="hidden"
          />
          <label
            htmlFor="wordsRadio"
            className={`bg-gray-200 rounded-full px-4 py-2 cursor-pointer ${
              passwordType === 'words' ? 'bg-blue-500 text-white' : ''
            }`}
          >
            Words
          </label>
        </div>
      </div>

      {passwordType === 'characters' && (
        <div className="option">
          <p>Length</p>
          <div className="slider">
            <input 
              type="range" 
              min="8" 
              max="60" 
              step="1" 
              value={length}
              onChange={(event) => {
                const newLength = parseInt(event.target.value);
                setLength(newLength);
                generatePassword(newLength, useCapitalLetters, useDigits, useSymbols, wordSeparator);
              }}
            />
            <span className="selected-length">{length}</span>
          </div>
        </div>
      )}

      {passwordType === 'words' && (
        <div className="option">
          <p>Words</p>
          <div className="slider">
            <input 
              type="range" 
              min="3" 
              max="10" 
              step="1" 
              value={length}
              onChange={(event) => {
                const newLength = parseInt(event.target.value);
                setLength(newLength);
                generatePassword(newLength, useCapitalLetters, useDigits, useSymbols, wordSeparator);
              }}
            />
            <span className="selected-length">{length}</span>
          </div>
        </div>
      )}

      {passwordType === 'characters' && (
      <div className="option">
        <p>Use capital letters (A-Z)</p>
        <div className="toggle">
          <Switch
            checked={useCapitalLetters}
            onChange={handleCapitalLettersChange}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
          />
        </div>
      </div>
      )}

    {passwordType === 'words' && (
      <div className="option">
        <p>Separate words with</p>
        <div className="dropdown">
          <select
            value={wordSeparator}
            onChange={handleSeparatorChange}
            className="dropdown-select"
          >
            <option value="_">Underscore</option>
            <option value="-">Hyphen</option>
            <option value=" ">Space</option>
            <option value=",">Comma</option>
            <option value=".">Period</option>
          </select>
        </div>
      </div>
    )}

      {passwordType === 'characters' && (
      <div className="option">
        <p>Use digits (0-9)</p>
        <div className="toggle">
          <Switch 
            checked={useDigits} 
            onChange={handleDigitsChange} 
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
          />
        </div>
      </div>
      )}

      {passwordType === 'words' && (
      <div className="option">
        <p>Use capital letters (A-Z)</p>
        <div className="toggle">
          <Switch
            checked={useCapitalLetters}
            onChange={handleCapitalLettersChange}
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
          />
        </div>
      </div>
      )}

      {passwordType === 'characters' && (
      <div className="option">
        <p>Use symbols (@!$%&*)</p>
        <div className="toggle">
          <Switch 
            checked={useSymbols} 
            onChange={handleSymbolsChange} 
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
          />
        </div>
      </div>
      )}

      {passwordType === 'words' && (
      <div className="option">
        <p>Use digits (e.g. replace A with 4)</p>
        <div className="toggle">
          <Switch 
            checked={useSymbols} 
            onChange={handleSymbolsChange} 
            boxShadow="0px 1px 5px rgba(0, 0, 0, 0.6)"
            activeBoxShadow="0px 0px 1px 10px rgba(0, 0, 0, 0.2)"
            height={20}
            width={48}
          />
        </div>
      </div>
      )}

      <div className="generate-password">
        <button onClick={handleGeneratePasswordClick}>
            <p>Generate password</p>
        </button>
      </div>

    </div>
  </div>
  );
}

export default App;