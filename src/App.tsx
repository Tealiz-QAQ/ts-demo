import React, { useState, useEffect } from 'react';
import placeholderToken from './question-mark.png';

interface Token {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  chainId: number;
  logoURI: string;
  coingeckoId?: string;
  listedIn?: string[];
}

const tokensURL: { [key: string]: string } = {
  Ethereum: 'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/ethereum.json',
  Arbitrum: 'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/arbitrum.json',
  Optimism: 'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/optimism.json',
  Bsc: 'https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/bsc.json',
};

const Loading: React.FC = () => {
  return <div className="w-full h-[150px] bg-gray-300 rounded-lg animate-pulse"></div>;
};

const App: React.FC = () => {
  const [category, setCategory] = useState<string>('Ethereum');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [tokens, setTokens] = useState<Token[]>([]);
  const [errorTokens, setErrorTokens] = useState<number[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(true);
  const [loadedTokens, setLoadedTokens] = useState<number[]>([]);
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setLoadedTokens([]);
      setMessage('');

      try {
        const response = await fetch(tokensURL[category]);
        const data: Token[] = await response.json();
        setTokens(data);
        setFilteredTokens(data);
      } catch (error) {
        setMessage('Failed to load tokens');
      }

      setLoading(false);
    };

    fetchTokens();
  }, [category]);

  useEffect(() => {
    const pathParts = window.location.pathname.split('/').filter(Boolean);
    if (pathParts.length > 0) {
      const newCategory = pathParts[0];
      const newSearchTerm = pathParts.slice(1).join(' ');

      if (Object.keys(tokensURL).includes(newCategory)) {
        setCategory(newCategory);
        setSearchTerm(newSearchTerm);
      }
    }
  }, []);

  useEffect(() => {
    const newPath = `${window.location.origin}/${category}/${searchTerm}`;
    window.history.pushState({}, '', newPath);
  }, [category, searchTerm]);

  const handleClick = (newCategory: string) => {
    setCategory(newCategory);
    setSearchTerm('');
  };

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      if (searchTerm) {
        const searchResults = tokens.filter(
          (token) =>
            token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            token.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
        setFilteredTokens(searchResults);
        setMessage(searchResults.length ? '' : 'No Tokens Found');
      } else {
        setFilteredTokens(tokens);
        setMessage('');
      }
      setLoading(false);
    }, 1000);
  };

  const handleTokenLoad = (index: number) => {
    setLoadedTokens((prev) => [...prev, index]);
  };

  const handleTokenError = (index: number) => {
    setErrorTokens((prev) => [...prev, index]);
    handleTokenLoad(index);
  };

  const handleMouseEnter = (token: Token) => {
    setHoveredToken(token);
  };

  const handleMouseLeave = () => {
    setHoveredToken(null);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <header className="text-center font-sans text-gray-700">
      <h1 className="font-lobster text-[65px] italic font-bold text-[#2B2B47] mt-[48px] mb-[48px]">SnapShot</h1>
      <div className="flex items-center justify-center mt-[24px]">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-[36px] w-[400px] font-sans text-[14px] rounded-l-lg pl-[10px] border-none outline-none bg-gray-200 hover:bg-gray-300 transition duration-300"
        />
        <button
          type="submit"
          onClick={handleSearch}
          className="h-[36px] bg-[#2B2B47] text-white rounded-r-lg border-none outline-none cursor-pointer flex items-center justify-center px-[12px]"
        >
          <svg height="32" width="32"><path d="M19.427 21.427a8.5 8.5 0 1 1 2-2l5.585 5.585c.55.55.546 1.43 0 1.976l-.024.024a1.399 1.399 0 0 1-1.976 0l-5.585-5.585zM14.5 21a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" fill="#ffffff" fill-rule="evenodd"></path>
          </svg>
        </button>
      </div>
      <nav className="my-[40px] flex items-center justify-center">
        <button onClick={() => handleClick('Ethereum')} className="h-[32px] mx-[8px] font-sans text-[14px] font-bold bg-[#2B2B47] text-white rounded-lg cursor-pointer">
          Ethereum
        </button>
        <button onClick={() => handleClick('Arbitrum')} className="h-[32px] mx-[8px] font-sans text-[14px] font-bold bg-[#2B2B47] text-white rounded-lg cursor-pointer">
          Arbitrum
        </button>
        <button onClick={() => handleClick('Optimism')} className="h-[32px] mx-[8px] font-sans text-[14px] font-bold bg-[#2B2B47] text-white rounded-lg cursor-pointer">
          Optimism
        </button>
        <button onClick={() => handleClick('Bsc')} className="h-[32px] mx-[8px] font-sans text-[14px] font-bold bg-[#2B2B47] text-white rounded-lg cursor-pointer">
          Bsc
        </button>
      </nav>
      <main>
        <h2 className="text-[30px] font-bold my-[40px]">{filteredTokens.length > 0 ? `${category} Tokens` : message}</h2>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(0,_150px))] gap-[30px] mb-[30px] px-[130px] pb-[30px] justify-center">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => <Loading key={index} />)
            : filteredTokens.length > 0
              ? filteredTokens.map((token, index) => (
                <div
                  key={index}
                  className="relative inline-block m-[8px]"
                  onMouseEnter={() => handleMouseEnter(token)}
                  onMouseLeave={handleMouseLeave}
                >
                  <img
                    src={token.logoURI}
                    alt={`${category} ${token.name}`}
                    className={`w-full h-full object-contain rounded-lg transition-opacity ease-in-out duration-[1,5s] transform scale-[0.8] transform hover:scale-110 transition-transform ${loadedTokens.includes(index) || errorTokens.includes(index) ? 'loaded' : ''}`}
                    onLoad={() => handleTokenLoad(index)}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = placeholderToken;
                      handleTokenError(index);
                    }}
                  />
                  {hoveredToken === token && (
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 bg-black bg-opacity-80 text-white text-[12px] p-[8px] rounded-lg whitespace-nowrap z-10">
                      <p>
                        <strong>Name:</strong> {token.name}
                      </p>
                      <p>
                        <strong>Logo URI:</strong>{' '}
                        <a href={token.logoURI} target="_blank" rel="noopener noreferrer" className="text-yellow-400 hover:underline">
                          Open Image
                        </a>
                      </p>
                    </div>
                  )}
                </div>
              ))
              : null}
        </div>
      </main>
    </header>
  );
};

export default App;