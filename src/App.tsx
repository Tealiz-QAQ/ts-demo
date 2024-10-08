import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FixedSizeGrid, GridChildComponentProps } from 'react-window';

const placeholderToken = "https://img.freepik.com/free-vector/question-mark-modern-background-clearing-doubts-concept_1017-43064.jpg";

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
  return <div className="w-full h-[68px] bg-gray-300 rounded-lg animate-pulse"></div>;
};

const CategoryButtons: React.FC<{ categories: string[], selectedCategory: string, onClick: (newCategory: string) => void }> = ({ categories, selectedCategory, onClick }) => {
  return (
    <nav className="grid grid-cols-[repeat(auto-fit,_minmax(0,_125px))] gap-[20px] py-[30px] mx-[80px] items-center justify-center">
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onClick(category)}
          className={`w-[125px] h-[32px] font-sans text-[14px] font-bold rounded-lg cursor-pointer ${category === selectedCategory ? 'bg-gray-200 text-blue-1500' : 'bg-[#2B2B47] text-white'}`}
        >
          {category}
        </button>
      ))}
    </nav>
  );
};

const TokenItem: React.FC<GridChildComponentProps<{ tokens: Token[]; handleMouseEnter: (token: Token) => void; handleMouseLeave: () => void; loadedTokens: number[]; errorTokens: number[]; handleTokenLoad: (index: number) => void; handleTokenError: (index: number) => void; hoveredToken: Token | null; category: string; columnCount: number }>> = ({ columnIndex, rowIndex, style, data }) => {
  const {
    tokens,
    handleMouseEnter,
    handleMouseLeave,
    loadedTokens,
    errorTokens,
    handleTokenLoad,
    handleTokenError,
    hoveredToken,
    category,
  } = data;

  const index = rowIndex * data.columnCount + columnIndex;
  const token = tokens[index];

  if (!token) {
    return null;
  }

  return (
    <div
      style={style}
      className="relative flex justify-center items-center inline-block"
      onMouseEnter={() => handleMouseEnter(token)}
      onMouseLeave={handleMouseLeave}
    >
      <img
        src={token.logoURI}
        alt={`${category} ${token.name}`}
        className={`w-full h-full object-contain rounded-lg transition-opacity ease-in-out duration-[1.3s] transform scale-[0.7] transform hover:scale-100 transition-transform ${loadedTokens.includes(index) || errorTokens.includes(index) ? 'loaded' : ''}`}
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
  );
};

const App: React.FC = () => {
  const { category = '101', searchQuery = '' } = useParams<{ category: string; searchQuery: string }>();
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
    navigate(`/${newCategory}/`); // Reset search term in URL
    setSearchTerm(''); // Reset search term state
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

  const [gridWidth, setGridWidth] = useState<number>(window.innerWidth - 50);

  useEffect(() => {
    const handleResize = () => {
      setGridWidth(window.innerWidth - 50);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const itemData = {
    tokens: filteredTokens,
    handleMouseEnter,
    handleMouseLeave,
    loadedTokens,
    errorTokens,
    handleTokenLoad,
    handleTokenError,
    hoveredToken,
    category,
    columnCount: Math.floor(gridWidth / 130), // 100px là chiều rộng của mỗi cột + 30px khoảng cách
  };

  const columnCount = itemData.columnCount;
  const rowCount = Math.ceil(filteredTokens.length / columnCount);
  const gridHeight = Math.min(500, rowCount * 115); // 85px là chiều cao của mỗi hàng + 30px khoảng cách

  return (
    <header className="text-center font-sans text-gray-700">
      <h1 className="font-lobster text-[65px] italic font-bold text-[#2B2B47] py-[48px]">Token List</h1>
      <div className="flex items-center justify-center py-[24px]">
        <input
          type="text"
          placeholder="Search..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="h-[36px] w-[400px] font-sans text-[14px] rounded-l-lg pl-[10px] border-none outline-none bg-gray-200 hover:bg-gray-300 transition duration-300"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="h-[36px] bg-[#2B2B47] text-white rounded-r-lg border-none outline-none cursor-pointer flex items-center justify-center px-[12px]"
        >
          <svg height="32" width="32"><path d="M19.427 21.427a8.5 8.5 0 1 1 2-2l5.585 5.585c.55.55.546 1.43 0 1.976l-.024.024a1.399 1.399 0 0 1-1.976 0l-5.585-5.585zM14.5 21a6.5 6.5 0 1 0 0-13 6.5 6.5 0 0 0 0 13z" fill="#ffffff" fill-rule="evenodd"></path></svg>
        </button>
      </div>

      <CategoryButtons categories={categories} selectedCategory={category} onClick={handleClick} />

      <h2 className="text-[30px] font-bold items-center justify-center py-[30px]">{filteredTokens.length > 0 ? `${category} Tokens` : category ? `No Tokens in ${category}` : message}</h2>
      <div className='pb-[50px] mx-[50px] overflow-x-auto overflow-y-auto'>
        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-[20px] mx-auto max-w-[800px]">
            {Array.from({ length: 8 }, (_, index) => (
              <Loading key={index} />
            ))}
          </div>
        ) : filteredTokens.length > 0 ? (
          <FixedSizeGrid
            columnCount={columnCount}
            columnWidth={gridWidth < 600
              ? (gridWidth - (columnCount - 1) * 30) / columnCount // Khi chiều rộng nhỏ hơn 600px
              : ((gridWidth) / columnCount) - 10 // Khi chiều rộng lớn hơn hoặc bằng 600px
            }
            height={gridHeight}
            rowCount={rowCount}
            rowHeight={115} // Điều chỉnh chiều cao của mỗi hàng
            width={gridWidth} // Điều chỉnh chiều rộng của grid
            itemData={itemData}
          >
            {TokenItem}
          </FixedSizeGrid>
        ) : (
          <div className="text-[20px]">{message}</div>
        )}
      </div>
    </header>
  );
};

export default App;
