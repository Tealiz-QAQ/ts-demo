import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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

const Loading: React.FC = () => {
  return <div className="w-full h-[150px] bg-gray-300 rounded-lg animate-pulse"></div>;
};

const CategoryButtons: React.FC<{ categories: string[], onClick: (newCategory: string) => void }> = ({ categories, onClick }) => {
  return (
    <nav className="grid grid-cols-[repeat(auto-fit,_minmax(0,_125px))] gap-[20px] py-[30px] mx-[80px] items-center justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onClick(category)}
          className="w-[125px] h-[32px] mx-[8px] font-sans text-[14px] font-bold bg-[#2B2B47] text-white rounded-lg cursor-pointer"
        >
          {category}
        </button>
      ))}
    </nav>
  );
};

const App: React.FC = () => {
  const { category = '', searchQuery = '' } = useParams<{ category: string; searchQuery: string }>();
  const navigate = useNavigate();

  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>(searchQuery);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [errorTokens, setErrorTokens] = useState<number[]>([]);
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);
  const [message, setMessage] = useState<string>('');
  const [isLoading, setLoading] = useState<boolean>(true);
  const [loadedTokens, setLoadedTokens] = useState<number[]>([]);
  const [hoveredToken, setHoveredToken] = useState<Token | null>(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('https://api.github.com/repos/viaprotocol/tokenlists/contents/tokenlists');
        const data = await response.json();
        const fetchedCategories = data.map((file: any) => file.name.replace('.json', ''));
        setCategories(fetchedCategories);
      } catch (error) {
        setMessage('Failed to load categories');
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchTokens = async () => {
      setLoading(true);
      setLoadedTokens([]);
      setMessage('');

      if (!category) return;

      try {
        const response = await fetch(`https://raw.githubusercontent.com/viaprotocol/tokenlists/main/tokenlists/${category}.json`);
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
    setSearchTerm(searchQuery);
  }, [searchQuery]);

  const handleClick = (newCategory: string) => {
    navigate(`/${newCategory}/${searchTerm}`);
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
    navigate(`/${category}/${searchTerm}`);
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
      <h1 className="font-lobster text-[65px] italic font-bold text-[#2B2B47] mt-[48px] mb-[48px]">Token List</h1>
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
      <CategoryButtons categories={categories} onClick={handleClick} />
      <main>
        <h2 className="text-[30px] font-bold mb-[40px]">{filteredTokens.length > 0 ? `${category} Tokens` : category ? `No Tokens in ${category}` : message}</h2>
        <div className="grid grid-cols-[repeat(auto-fit,_minmax(0,_150px))] gap-[30px] px-[130px] pb-[70px] justify-center">
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
              : <p className="text-[18px] text-gray-500">{message}</p>
          }
        </div>
      </main>
    </header>
  );
};

export default App;
