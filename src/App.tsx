import React, { useState, useCallback, useEffect, useMemo } from 'react';
import {
  Search,
  Clock,
  Calendar,
  MapPin,
  Loader2,
  Star,
  Moon,
  Copy,
  History,
  X,
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { useInstallPrompt } from './hooks/useInstallPrompt';

interface Location {
  loc: string;
  name: string;
  state: string;
  country: string;
  country_code: string;
  timezone: string;
  latitude: number;
  longitude: number;
}

interface MatchResult {
  date: string;
  nakshatra: string;
  rasi: string;
  points: number;
  matchHtml?: string;
}

interface SearchHistory {
  name: string;
  location: Location;
  date: string;
  time: string;
  ampm: string;
  result?: MatchResult;
  timestamp: number;
  ignoredDates?: IgnoredDate[];
}

interface IgnoredDate {
  day: number;
  month: number;
  timestamp: number;
}

function MainView({ 
  result, 
  loading, 
  status, 
  isSearchingNext, 
  isDownloading, 
  downloadHoroscopeImage,
  handleNameChange,
  handleLocationSearch,
  handleTimeChange,
  findMatch,
  copyToClipboard,
  name,
  date,
  time,
  ampm,
  searchQuery,
  locations,
  selectedLocation,
  setSelectedLocation,
  setSearchQuery,
  setLocations,
  setDate,
  setAmpm,
  setShowHistory,
  showHistory,
  historySearchQuery,
  setHistorySearchQuery,
  filteredHistory,
  applyHistoryItem,
  ignoredDates,
  setShowIgnoredDates
}: {
  result: MatchResult | null;
  loading: boolean;
  status: string;
  isSearchingNext: boolean;
  isDownloading: boolean;
  downloadHoroscopeImage: (birthDate: string, rasi: string, nakshatra: string) => Promise<void>;
  handleNameChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleLocationSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleTimeChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  findMatch: (isRetry: boolean) => Promise<void>;
  copyToClipboard: (text: string) => void;
  name: string;
  date: string;
  time: string;
  ampm: string;
  searchQuery: string;
  locations: Location[];
  selectedLocation: Location | null;
  setSelectedLocation: React.Dispatch<React.SetStateAction<Location | null>>;
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>;
  setLocations: React.Dispatch<React.SetStateAction<Location[]>>;
  setDate: React.Dispatch<React.SetStateAction<string>>;
  setAmpm: React.Dispatch<React.SetStateAction<string>>;
  setShowHistory: React.Dispatch<React.SetStateAction<boolean>>;
  showHistory: boolean;
  historySearchQuery: string;
  setHistorySearchQuery: React.Dispatch<React.SetStateAction<string>>;
  filteredHistory: SearchHistory[];
  applyHistoryItem: (item: SearchHistory) => void;
  ignoredDates: IgnoredDate[];
  setShowIgnoredDates: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-center bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
          Horoscope Match Finder
        </h1>
        <button
          title="Toggle search history"
          onClick={() => setShowHistory(!showHistory)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <History className="h-6 w-6 text-indigo-600" />
        </button>
      </div>

      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Search History</h2>
              <button
                title="Close history"
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative mb-4">
              <input
                type="text"
                value={historySearchQuery}
                onChange={(e) => setHistorySearchQuery(e.target.value)}
                placeholder="Search history..."
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>

            <div className="overflow-y-auto flex-1 -mx-6 px-6">
              <div className="space-y-3">
                {filteredHistory.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No matching records found
                  </div>
                ) : (
                  filteredHistory.map((item, index) => (
                    <div
                      key={index}
                      onClick={() => applyHistoryItem(item)}
                      className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors duration-150 group"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-medium text-lg text-indigo-600">{item.name}</h3>
                          <p className="text-sm text-gray-600">
                            {item.location.name}, {item.location.state}
                          </p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-gray-400" />
                          <span>{item.date}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span>{item.time} {item.ampm}</span>
                        </div>
                      </div>

                      {item.result && (
                        <div className="mt-2 pt-2 border-t border-gray-100">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <Star className="h-4 w-4 text-indigo-400" />
                              <span>Nakshatra: {item.result.nakshatra}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Moon className="h-4 w-4 text-indigo-400" />
                              <span>Rasi: {item.result.rasi}</span>
                            </div>
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-sm">
                            <Star className="h-4 w-4 text-yellow-400" />
                            <span>Match Points: {item.result.points}/10</span>
                          </div>
                          {item.ignoredDates && item.ignoredDates.length > 0 && (
                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                              <X className="h-4 w-4" />
                              <span>Ignored Dates: {item.ignoredDates.length}</span>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-indigo-600">
                        Click to apply these details
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Girl's Name
          </label>
          <input
            type="text"
            value={name}
            onChange={handleNameChange}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            placeholder="Enter name"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Place
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleLocationSearch}
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="Search location..."
            />
            <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />

            {locations.length > 0 && !selectedLocation && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-auto">
                {locations.map((location, index) => (
                  <div
                    key={index}
                    className="px-4 py-3 hover:bg-indigo-50 cursor-pointer transition-colors duration-150"
                    onClick={() => {
                      setSelectedLocation(location);
                      setSearchQuery(
                        `${location.name}, ${location.state}, ${location.country}`
                      );
                      setLocations([]);
                    }}
                  >
                    <div className="font-medium">{location.name}</div>
                    <div className="text-sm text-gray-500">
                      {location.state}, {location.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Birth Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              title="Birth date"
              placeholder="Select birth date"
              className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
            <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Birth Time
            </label>
            <div className="relative">
              <input
                type="text"
                value={time}
                onChange={handleTimeChange}
                placeholder="HHMM"
                maxLength={5}
                className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
              <Clock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              AM/PM
            </label>
            <select
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              title="Select AM/PM"
              className="w-24 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="am">AM</option>
              <option value="pm">PM</option>
            </select>
          </div>
        </div>

        <button
          onClick={() => findMatch(false)}
          disabled={loading}
          className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center transition-all duration-150"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" />
              {isSearchingNext ? 'Finding Next Match...' : 'Finding Perfect Match...'}
            </>
          ) : (
            result ? 'Find Another Match' : 'Find Perfect Match'
          )}
        </button>

        {status && (
          <div className="text-sm text-gray-600 text-center animate-pulse">
            {status}
          </div>
        )}

        {result && (
          <div className="mt-6 p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100 rounded-xl space-y-4">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold text-indigo-900">
                Perfect Match Found!
              </h2>
              <button
                onClick={() => setShowIgnoredDates(true)}
                className="text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
              >
                <X className="h-4 w-4" />
                View Ignored Dates ({ignoredDates.length})
              </button>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600" />
                <span className="text-gray-700">
                  Birth Date: {result.date}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-700">
                    Nakshatra: {result.nakshatra}
                  </span>
                </div>
                <button
                  title="Copy Nakshatra"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(result.nakshatra);
                  }}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="h-5 w-5 text-indigo-600" />
                  <span className="text-gray-700">
                    Rasi: {result.rasi}
                  </span>
                </div>
                <button
                  title="Copy Rasi"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(result.rasi);
                  }}
                  className="p-1.5 hover:bg-white rounded-lg transition-colors"
                >
                  <Copy className="h-4 w-4 text-gray-500" />
                </button>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                <span className="text-gray-700">
                  Match Points: {result.points}/10
                </span>
              </div>
              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadHoroscopeImage(result.date, result.rasi, result.nakshatra);
                  }}
                  disabled={isDownloading}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-2.5 px-4 rounded-xl hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-150 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating Horoscope...
                    </>
                  ) : (
                    'Download Horoscope'
                  )}
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/details');
                  }}
                  className="w-full bg-white border border-indigo-200 text-indigo-600 py-2.5 px-4 rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-150"
                >
                  View Match Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailsView({ result }: { result: MatchResult | null }) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-2xl shadow-xl">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            title="Go back"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>
          <h2 className="text-xl font-semibold">Horoscope Match Details</h2>
        </div>
      </div>
      <div className="p-6">
        {result?.matchHtml && (
          <div 
            className="prose max-w-none"
            dangerouslySetInnerHTML={{ __html: result.matchHtml }}
          />
        )}
      </div>
    </div>
  );
}

function App() {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [ampm, setAmpm] = useState('am');
  const [searchQuery, setSearchQuery] = useState('');
  const [locations, setLocations] = useState<Location[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [status, setStatus] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [view, setView] = useState<'main' | 'details'>('main');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [ignoredDates, setIgnoredDates] = useState<IgnoredDate[]>([]);
  const [showIgnoredDates, setShowIgnoredDates] = useState(false);
  const [isSearchingNext, setIsSearchingNext] = useState(false);
  const [isApplyingHistory, setIsApplyingHistory] = useState(false);
  const { isInstallable, installApp } = useInstallPrompt();

  useEffect(() => {
    const history = localStorage.getItem('searchHistory');
    const ignored = localStorage.getItem('ignoredDates');
    if (history) {
      setSearchHistory(JSON.parse(history));
    }
    if (ignored) {
      setIgnoredDates(JSON.parse(ignored));
    }
  }, []);

  // Clear ignore list and result when inputs change
  useEffect(() => {
    if (!isApplyingHistory) {
      const shouldClear = name || selectedLocation || date || time || ampm;
      const hasManualChange = !searchHistory.some(item => 
        item.name === name &&
        item.location?.loc === selectedLocation?.loc &&
        item.date === date &&
        item.time === time &&
        item.ampm === ampm
      );

      if (shouldClear && hasManualChange) {
        setIgnoredDates([]);
        setResult(null);
        localStorage.removeItem('ignoredDates');
      }
    }
  }, [name, selectedLocation, date, time, ampm, isApplyingHistory, searchHistory]);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      if (value.length >= 2) {
        const hours = value.slice(0, 2);
        const minutes = value.slice(2);
        setTime(`${hours}:${minutes}`);
      } else {
        setTime(value);
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const parseLocationData = (data: string): Location[] => {
    try {
      // Parse the JSON string to get an array of location strings
      const locationStrings = JSON.parse(data);
      
      // Map each location string to a Location object
      return locationStrings.map((locationStr: string) => {
        const parts = locationStr.split('|');
        return {
          loc: parts[0],
          name: parts[1],
          state: parts[2],
          country: parts[3],
          country_code: parts[4],
          timezone: parts[5],
          latitude: parseFloat(parts[6]),
          longitude: parseFloat(parts[7])
        };
      });
    } catch (error) {
      console.error('Error parsing location data:', error);
      return [];
    }
  };

  const searchLocations = useCallback(
    debounce(async (query: string) => {
      if (query.length < 3) {
        setLocations([]);
        return;
      }
      try {
        const response = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horoscope/search?q=${query}`,
          {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            },
          }
        );
        const data = await response.json();
        const locationsList = parseLocationData(data);
        setLocations(locationsList);
      } catch (error) {
        console.error('Error searching locations:', error);
        setLocations([]);
      }
    }, 300),
    []
  );

  const getNakshatraAndRasi = async (day: number, month: number) => {
    const formData = new FormData();
    formData.append('name', 'Ranjithkumar R');
    formData.append('gender', 'male');
    formData.append('year', '1996');
    formData.append('month', month.toString());
    formData.append('day', day.toString());
    formData.append('hour', '9');
    formData.append('min', '45');
    formData.append('apm', 'am');
    formData.append('location', 'Vellore, Tamil Nadu, India');
    formData.append('loc', '1253286');
    formData.append('utm_source', 'Nakshatra_Finder');
    formData.append('utm_medium', '');
    formData.append('utm_campaign', '');
    formData.append('p', '1');

    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horoscope/nakshatra`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      }
    );

    const html = await response.json();

    const nakshatraMatch = html.match(
      /<td class="t-large b">Nakshatra<\/td>\s*<td>\s*<span class="t-large b">\s*(.*?)(?:,|<)/
    );
    const rasiMatch = html.match(
      /Chandra Rasi <em>\(Janma Rasi \)<\/em>\s*<\/td>\s*<td>(.*?)</
    );

    return {
      nakshatra: nakshatraMatch ? nakshatraMatch[1].trim() : 'Unknown',
      rasi: rasiMatch ? rasiMatch[1].trim() : 'Unknown',
    };
  };

  const generateDateCombinations = (strategy: 'july' | 'date23' | 'random', count: number) => {
    const combinations = [];
    
    switch (strategy) {
      case 'july':
        // Generate dates in July (month 7)
        for (let i = 0; i < count; i++) {
          combinations.push({ day: Math.floor(Math.random() * 31) + 1, month: 7 });
        }
        break;
        
      case 'date23':
        // Generate combinations with date 23 in different months
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const shuffledMonths = months.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(count, 12); i++) {
          combinations.push({ day: 23, month: shuffledMonths[i] });
        }
        break;
        
      case 'random':
        // Generate random date combinations
        while (combinations.length < count) {
          const month = Math.floor(Math.random() * 12) + 1;
          const maxDays = new Date(1996, month, 0).getDate();
          const day = Math.floor(Math.random() * maxDays) + 1;
          combinations.push({ day, month });
        }
        break;
    }
    
    return combinations;
  };

  const checkMatch = async (formData: FormData) => {
    const response = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/horoscope/match`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: formData,
      }
    );

    const html = await response.json();
    const match = html.match(
      /<h2>Total Porutham Points<\/h2><\/td><td class="tc"><h2>(\d+(?:\.\d+)?) \/ 10/
    );

    return { points: match ? parseFloat(match[1]) : 0, html };
  };

  const downloadHoroscopeImage = async (birthDate: string, rasi: string, nakshatra: string) => {
    try {
      setIsDownloading(true);
      const response = await fetch('https://pptx-to-png-converter.netlify.app/.netlify/functions/convert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          birthDate,
          rasi,
          natchathiram: nakshatra,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate horoscope image');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'horoscope.png';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading horoscope image:', error);
      alert('Failed to download horoscope image. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

  const isDateIgnored = (day: number, month: number) => {
    return ignoredDates.some(d => d.day === day && d.month === month);
  };

  const findMatch = async (isRetry: boolean = false) => {
    if (!isRetry && (!name || !date || !time || !selectedLocation)) {
      alert('Please fill in all fields');
      return;
    }

    // Clear previous result before starting new search
    if (!isRetry) {
      setResult(null);
    }

    // If we have a current result and we're finding another match,
    // add the current date to ignore list first
    if (result && !isRetry) {
      const [day, month] = result.date.split('/').map(Number);
      const newIgnoredDate: IgnoredDate = {
        day,
        month,
        timestamp: Date.now()
      };
      
      const updatedIgnoredDates = [...ignoredDates, newIgnoredDate];
      setIgnoredDates(updatedIgnoredDates);
      localStorage.setItem('ignoredDates', JSON.stringify(updatedIgnoredDates));
      setIsSearchingNext(true);
    }

    setLoading(true);
    try {
      const [year, month, day] = date.split('-');
      const [hours, minutes] = time.split(':');

      let bestMatch = null;
      const searchStrategies = [
        // July dates with decreasing points
        { strategy: 'july' as const, targetPoints: 9.5, message: 'Checking July dates for matches ≥ 9.5 points...' },
        { strategy: 'july' as const, targetPoints: 9, message: 'Checking July dates for matches ≥ 9 points...' },
        { strategy: 'july' as const, targetPoints: 8.5, message: 'Checking July dates for matches ≥ 8.5 points...' },
        { strategy: 'july' as const, targetPoints: 8, message: 'Checking July dates for matches ≥ 8 points...' },
        
        // Date 23 with decreasing points
        { strategy: 'date23' as const, targetPoints: 9.5, message: 'Checking date 23 across months for matches ≥ 9.5 points...' },
        { strategy: 'date23' as const, targetPoints: 9, message: 'Checking date 23 across months for matches ≥ 9 points...' },
        { strategy: 'date23' as const, targetPoints: 8.5, message: 'Checking date 23 across months for matches ≥ 8.5 points...' },
        { strategy: 'date23' as const, targetPoints: 8, message: 'Checking date 23 across months for matches ≥ 8 points...' },
        
        // Random dates with decreasing points
        { strategy: 'random' as const, targetPoints: 9.5, message: 'Searching random dates for matches ≥ 9.5 points...' },
        { strategy: 'random' as const, targetPoints: 9, message: 'Searching random dates for matches ≥ 9 points...' },
        { strategy: 'random' as const, targetPoints: 8.5, message: 'Searching random dates for matches ≥ 8.5 points...' },
        { strategy: 'random' as const, targetPoints: 8, message: 'Searching random dates for matches ≥ 8 points...' },
        { strategy: 'random' as const, targetPoints: 7.5, message: 'Searching random dates for matches ≥ 7.5 points...' },
        { strategy: 'random' as const, targetPoints: 7, message: 'Searching random dates for matches ≥ 7 points...' },
      ];

      for (const { strategy, targetPoints, message } of searchStrategies) {
        if (bestMatch) break;
        
        setStatus(isSearchingNext ? `Finding next match: ${message}` : message);
        const combinations = generateDateCombinations(strategy, 100);
        
        // Filter out ignored dates
        const validCombinations = combinations.filter(
          ({ day, month }) => !isDateIgnored(day, month)
        );
        
        const matchPromises = validCombinations.map(async ({ day: bday, month: bmonth }) => {
          const formData = new FormData();
          formData.append('compatibility_system', 'Tamil Porutham');
          formData.append('gname', name);
          formData.append(
            'glocation',
            `${selectedLocation.name}, ${selectedLocation.state}, ${selectedLocation.country}`
          );
          formData.append('gloc', selectedLocation.loc);
          formData.append('gyear', year);
          formData.append('gmonth', month.toString());
          formData.append('gday', day.toString());
          formData.append('ghour', hours);
          formData.append('gmin', minutes);
          formData.append('gapm', ampm);
          formData.append('ggender', 'female');
          formData.append('bname', 'Ranjithkumar R');
          formData.append('blocation', 'Vellore, Tamil Nadu, India');
          formData.append('bloc', '1253286');
          formData.append('byear', '1996');
          formData.append('bhour', '9');
          formData.append('bmin', '45');
          formData.append('bapm', 'am');
          formData.append('bgender', 'male');
          formData.append('p', '1');
          formData.append('bmonth', bmonth.toString());
          formData.append('bday', bday.toString());
          
          const { points, html } = await checkMatch(formData);
          return { day: bday, month: bmonth, points, html };
        });

        const results = await Promise.all(matchPromises);
        const bestResult = results.find(r => r.points >= targetPoints);

        if (bestResult) {
          const { nakshatra, rasi } = await getNakshatraAndRasi(
            bestResult.day,
            bestResult.month
          );

          bestMatch = {
            date: `${bestResult.day}/${bestResult.month}/1996`,
            nakshatra,
            rasi,
            points: bestResult.points,
            matchHtml: bestResult.html
          };
        }
      }

      if (bestMatch) {
        setResult(bestMatch);
        const newHistory: SearchHistory = {
          name,
          location: selectedLocation,
          date,
          time,
          ampm,
          result: bestMatch,
          timestamp: Date.now(),
          ignoredDates: [...ignoredDates]
        };
        const updatedHistory = [newHistory, ...searchHistory].slice(0, 10);
        setSearchHistory(updatedHistory);
        localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
      } else {
        alert('No suitable match found');
      }
    } catch (error) {
      console.error('Error finding match:', error);
      setResult(null);
    } finally {
      setLoading(false);
      setStatus('');
      setIsSearchingNext(false);
    }
  };

  const applyHistoryItem = (item: SearchHistory) => {
    setIsApplyingHistory(true);
    
    // First update all form fields
    setName(item.name);
    setSelectedLocation(item.location);
    setSearchQuery(`${item.location.name}, ${item.location.state}, ${item.location.country}`);
    setDate(item.date);
    setTime(item.time);
    setAmpm(item.ampm);

    // Then update ignored dates if they exist
    if (item.ignoredDates) {
      setIgnoredDates(item.ignoredDates);
      localStorage.setItem('ignoredDates', JSON.stringify(item.ignoredDates));
    }

    // Finally set the result and close history
    setResult(item.result || null);
    setShowHistory(false);

    // Reset the applying flag after a delay
    setTimeout(() => {
      setIsApplyingHistory(false);
    }, 500);
  };

  const handleLocationSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSelectedLocation(null);
    searchLocations(value);
  };

  // Filter history based on search query
  const filteredHistory = useMemo(() => {
    const query = historySearchQuery.toLowerCase();
    return searchHistory.filter(item => 
      item.name.toLowerCase().includes(query) ||
      item.location.name.toLowerCase().includes(query) ||
      item.location.state.toLowerCase().includes(query) ||
      item.date.includes(query) ||
      (item.result?.nakshatra.toLowerCase().includes(query)) ||
      (item.result?.rasi.toLowerCase().includes(query))
    );
  }, [searchHistory, historySearchQuery]);

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 p-4 md:p-8">
        <div className="max-w-lg mx-auto">
          <Routes>
            <Route 
              path="/" 
              element={
                <MainView 
                  result={result}
                  loading={loading}
                  status={status}
                  isSearchingNext={isSearchingNext}
                  isDownloading={isDownloading}
                  downloadHoroscopeImage={downloadHoroscopeImage}
                  handleNameChange={handleNameChange}
                  handleLocationSearch={handleLocationSearch}
                  handleTimeChange={handleTimeChange}
                  findMatch={findMatch}
                  copyToClipboard={copyToClipboard}
                  name={name}
                  date={date}
                  time={time}
                  ampm={ampm}
                  searchQuery={searchQuery}
                  locations={locations}
                  selectedLocation={selectedLocation}
                  setSelectedLocation={setSelectedLocation}
                  setSearchQuery={setSearchQuery}
                  setLocations={setLocations}
                  setDate={setDate}
                  setAmpm={setAmpm}
                  setShowHistory={setShowHistory}
                  showHistory={showHistory}
                  historySearchQuery={historySearchQuery}
                  setHistorySearchQuery={setHistorySearchQuery}
                  filteredHistory={filteredHistory}
                  applyHistoryItem={applyHistoryItem}
                  ignoredDates={ignoredDates}
                  setShowIgnoredDates={setShowIgnoredDates}
                />
              } 
            />
            <Route 
              path="/details" 
              element={<DetailsView result={result} />} 
            />
          </Routes>
        </div>

        {showHistory && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Search History</h2>
                <button
                  title="Close history"
                  onClick={() => setShowHistory(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="relative mb-4">
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              </div>

              <div className="overflow-y-auto flex-1 -mx-6 px-6">
                <div className="space-y-3">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-4">
                      No matching records found
                    </div>
                  ) : (
                    filteredHistory.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => applyHistoryItem(item)}
                        className="p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors duration-150 group"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-lg text-indigo-600">{item.name}</h3>
                            <p className="text-sm text-gray-600">
                              {item.location.name}, {item.location.state}
                            </p>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400" />
                            <span>{item.time} {item.ampm}</span>
                          </div>
                        </div>

                        {item.result && (
                          <div className="mt-2 pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-indigo-400" />
                                <span>Nakshatra: {item.result.nakshatra}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Moon className="h-4 w-4 text-indigo-400" />
                                <span>Rasi: {item.result.rasi}</span>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-2 text-sm">
                              <Star className="h-4 w-4 text-yellow-400" />
                              <span>Match Points: {item.result.points}/10</span>
                            </div>
                            {item.ignoredDates && item.ignoredDates.length > 0 && (
                              <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                                <X className="h-4 w-4" />
                                <span>Ignored Dates: {item.ignoredDates.length}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-sm text-indigo-600">
                          Click to apply these details
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {showIgnoredDates && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Ignored Dates ({ignoredDates.length})</h2>
                <button
                  title="Close ignored dates"
                  onClick={() => setShowIgnoredDates(false)}
                  className="p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 -mx-6 px-6">
                {ignoredDates.length === 0 ? (
                  <div className="text-center text-gray-500 py-4">
                    No ignored dates yet
                  </div>
                ) : (
                  <div className="space-y-3">
                    {ignoredDates.map((ignored, index) => (
                      <div
                        key={index}
                        className="p-4 border border-gray-200 rounded-xl flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium">
                            {ignored.day}/{ignored.month}/1996
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            Ignored on: {new Date(ignored.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedIgnoredDates = ignoredDates.filter(d => d.day !== ignored.day && d.month !== ignored.month);
                            setIgnoredDates(updatedIgnoredDates);
                            localStorage.setItem('ignoredDates', JSON.stringify(updatedIgnoredDates));
                          }}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from ignored list"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Install PWA Prompt */}
        {isInstallable && (
          <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-lg mx-auto flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img 
                  src="/android-chrome-192x192.png" 
                  alt="App icon" 
                  className="w-10 h-10 rounded-xl"
                />
                <div>
                  <h3 className="font-semibold">Install App</h3>
                  <p className="text-sm text-gray-600">Add to your home screen for quick access</p>
                </div>
              </div>
              <button
                onClick={installApp}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Install
              </button>
            </div>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;