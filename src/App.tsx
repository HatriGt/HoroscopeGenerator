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
  User,
  Heart,
  Download,
  Eye,
  ChevronRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight
} from 'lucide-react';
import debounce from 'lodash/debounce';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
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
  checkOriginalMatch,
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
  ignoredDates,
  setShowIgnoredDates,
  searchHistory,
  isInstallable,
  installApp
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
  checkOriginalMatch: () => Promise<void>;
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
  ignoredDates: IgnoredDate[];
  setShowIgnoredDates: React.Dispatch<React.SetStateAction<boolean>>;
  searchHistory: SearchHistory[];
  isInstallable: boolean;
  installApp: () => void;
}) {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white rounded-3xl shadow-2xl p-4 sm:p-8 space-y-4 sm:space-y-8 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-bl-full -z-10 opacity-75" />
      <div className="absolute bottom-0 left-0 w-24 sm:w-32 h-24 sm:h-32 bg-gradient-to-tr from-pink-100 to-indigo-100 rounded-tr-full -z-10 opacity-75" />
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-gradient-to-br from-indigo-50/30 to-purple-50/30 rounded-full blur-3xl -z-10" />
      
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Heart className="h-6 sm:h-8 w-6 sm:w-8 text-pink-500 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full" />
            </div>
            <h1 className="text-2xl sm:text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Horoscope Match
            </h1>
          </div>
          <p className="text-gray-500 mt-2 flex items-center gap-2 text-sm sm:text-base">
            <Sparkles className="h-4 w-4 text-indigo-400" />
            Find your perfect match
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isInstallable && (
            <button
              onClick={installApp}
              className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-sm sm:text-base"
            >
              <Download className="h-4 w-4" />
              <span>Install App</span>
            </button>
          )}
          <button
            title="Toggle search history"
            onClick={() => setShowHistory(!showHistory)}
            className="p-2 sm:p-3 rounded-2xl hover:bg-indigo-50 transition-all duration-300 group relative"
          >
            <History className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
            {searchHistory.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs w-4 sm:w-5 h-4 sm:h-5 rounded-full flex items-center justify-center animate-bounce">
                {searchHistory.length}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-4 sm:space-y-6">
        <div className="flex items-center justify-between px-2 py-2 sm:py-3 bg-indigo-50/50 rounded-2xl mb-4 sm:mb-6 overflow-x-auto whitespace-nowrap text-xs sm:text-sm">
          <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-indigo-600 px-1 sm:px-2">
            <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center ${name ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-400'}`}>
              1
            </div>
            <span>Name</span>
          </div>
          <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-300 flex-shrink-0" />
          <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-indigo-600 px-1 sm:px-2">
            <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center ${selectedLocation ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-400'}`}>
              2
            </div>
            <span>Location</span>
          </div>
          <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-300 flex-shrink-0" />
          <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-indigo-600 px-1 sm:px-2">
            <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center ${date ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-400'}`}>
              3
            </div>
            <span>Date</span>
          </div>
          <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-300 flex-shrink-0" />
          <div className="flex items-center gap-1 sm:gap-2 text-sm font-medium text-indigo-600 px-1 sm:px-2">
            <div className={`w-5 sm:w-6 h-5 sm:h-6 rounded-full flex items-center justify-center ${time ? 'bg-indigo-600 text-white' : 'bg-indigo-100 text-indigo-400'}`}>
              4
            </div>
            <span>Time</span>
          </div>
          <ArrowRight className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-300 flex-shrink-0" />
        </div>

        <div className="group relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 group-focus-within:text-indigo-600 transition-colors flex items-center gap-2">
            <User className="h-3 sm:h-4 w-3 sm:w-4" />
            Girl's Name
          </label>
          <div className="relative">
            <input
              type="text"
              value={name}
              onChange={handleNameChange}
              className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base"
              placeholder="Enter name"
            />
            {name && (
              <CheckCircle2 className="absolute right-3 sm:right-4 top-2.5 sm:top-4 h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
            )}
          </div>
          <div className="absolute -top-2 right-0 text-[10px] sm:text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Enter the girl's full name
          </div>
        </div>

        <div className="group relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 group-focus-within:text-indigo-600 transition-colors flex items-center gap-2">
            <MapPin className="h-3 sm:h-4 w-3 sm:w-4" />
            Birth Place
          </label>
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={handleLocationSearch}
              className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 pl-8 sm:pl-12 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base"
              placeholder="Search location..."
            />
            <MapPin className="absolute left-2.5 sm:left-4 top-2.5 sm:top-4 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
            {selectedLocation && (
              <CheckCircle2 className="absolute right-3 sm:right-4 top-2.5 sm:top-4 h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
            )}
            
            {locations.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-48 sm:max-h-60 overflow-auto">
                <div className="sticky top-0 bg-indigo-50/80 backdrop-blur-sm p-1.5 sm:p-2 text-[10px] sm:text-xs text-indigo-600 flex items-center gap-2">
                  <Info className="h-3 sm:h-4 w-3 sm:w-4" />
                  {locations.length} locations found
                </div>
                {locations.map((location, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedLocation(location);
                      setSearchQuery(`${location.name}, ${location.state}, ${location.country}`);
                      setLocations([]);
                    }}
                    className="w-full px-3 sm:px-4 py-2 sm:py-3 text-left hover:bg-indigo-50 focus:bg-indigo-50 focus:outline-none transition-colors group text-sm sm:text-base"
                  >
                    <div className="flex items-center gap-2 sm:gap-3">
                      <MapPin className="h-4 sm:h-5 w-4 sm:w-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                      <div>
                        <div className="font-medium text-sm sm:text-base">{location.name}</div>
                        <div className="text-xs sm:text-sm text-gray-600">{location.state}, {location.country}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="absolute -top-2 right-0 text-[10px] sm:text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Enter birth place for accurate results
          </div>
        </div>

        <div className="group relative">
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 group-focus-within:text-indigo-600 transition-colors flex items-center gap-2">
            <Calendar className="h-3 sm:h-4 w-3 sm:w-4" />
            Birth Date
          </label>
          <div className="relative">
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              title="Birth date"
              className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 pl-8 sm:pl-12 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base"
            />
            <Calendar className="absolute left-2.5 sm:left-4 top-2.5 sm:top-4 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
            {date && (
              <CheckCircle2 className="absolute right-3 sm:right-4 top-2.5 sm:top-4 h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
            )}
          </div>
          <div className="absolute -top-2 right-0 text-[10px] sm:text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
            Select birth date
          </div>
        </div>

        <div className="flex gap-2 sm:gap-4">
          <div className="flex-1 group relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 group-focus-within:text-indigo-600 transition-colors flex items-center gap-2">
              <Clock className="h-3 sm:h-4 w-3 sm:w-4" />
              Birth Time
            </label>
            <div className="relative">
              <input
                type="text"
                value={time}
                onChange={handleTimeChange}
                placeholder="HHMM"
                maxLength={5}
                className="w-full px-3 sm:px-5 py-2.5 sm:py-3.5 pl-8 sm:pl-12 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 hover:border-gray-300 text-sm sm:text-base"
              />
              <Clock className="absolute left-2.5 sm:left-4 top-2.5 sm:top-4 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              {time && (
                <CheckCircle2 className="absolute right-3 sm:right-4 top-2.5 sm:top-4 h-4 sm:h-5 w-4 sm:w-5 text-green-500" />
              )}
            </div>
            <div className="absolute -top-2 right-0 text-[10px] sm:text-xs text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
              Enter birth time in HHMM format
            </div>
          </div>

          <div className="w-24 sm:w-32 group relative">
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2 group-focus-within:text-indigo-600 transition-colors">
              AM/PM
            </label>
            <select
              value={ampm}
              onChange={(e) => setAmpm(e.target.value)}
              title="Select AM/PM"
              className="w-full px-2 sm:px-5 py-2.5 sm:py-3.5 border-2 border-gray-200 rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-300 appearance-none bg-white hover:border-gray-300 text-sm sm:text-base"
            >
              <option value="am">AM</option>
              <option value="pm">PM</option>
            </select>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 pt-4 sm:pt-6">
          <button
            onClick={checkOriginalMatch}
            disabled={loading || !name || !selectedLocation || !date || !time}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl hover:from-emerald-600 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:hover:shadow-lg group relative text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-6 w-6" />
                <span className="text-lg">Checking Original Match...</span>
              </>
            ) : (
              <>
                <Star className="h-6 w-6 group-hover:rotate-45 transition-transform duration-300" />
                <span className="text-lg">Check Original Match (23/07/1996)</span>
              </>
            )}
            {(!name || !selectedLocation || !date || !time) && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Please fill in all fields first
              </div>
            )}
          </button>

          <button
            onClick={() => findMatch(false)}
            disabled={loading || !name || !selectedLocation || !date || !time}
            className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-2xl hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 sm:gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:hover:shadow-lg group relative text-sm sm:text-base"
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin h-6 w-6" />
                <span className="text-lg">
                  {isSearchingNext ? 'Finding Next Match...' : 'Finding Perfect Match...'}
                </span>
              </>
            ) : (
              <>
                <Heart className="h-6 w-6 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-lg">
                  {result ? 'Find Another Match' : 'Find Perfect Match'}
                </span>
              </>
            )}
            {(!name || !selectedLocation || !date || !time) && (
              <div className="absolute -top-10 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                Please fill in all fields first
              </div>
            )}
          </button>
        </div>

        {status && (
          <div className="text-xs sm:text-sm text-indigo-600 text-center animate-pulse bg-indigo-50 py-2 sm:py-3 px-3 sm:px-4 rounded-xl flex items-center justify-center gap-2">
            <AlertCircle className="h-4 w-4" />
            {status}
          </div>
        )}

        {result && (
          <div className="mt-6 sm:mt-8 p-4 sm:p-8 bg-gradient-to-br from-white to-indigo-50/50 border-2 border-indigo-100 rounded-2xl sm:rounded-3xl space-y-4 sm:space-y-6 relative overflow-hidden shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:scale-[1.02]">
            <div className="absolute top-0 right-0 w-20 sm:w-24 h-20 sm:h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-bl-full opacity-50 -z-10" />
            
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-2 sm:gap-3">
                {result.date === '23/7/1996' ? (
                  <div className="relative">
                    <Star className="h-6 sm:h-7 w-6 sm:w-7 text-yellow-500 animate-spin-slow" />
                    <div className="absolute inset-0 bg-yellow-500 rounded-full animate-ping opacity-20" />
                  </div>
                ) : (
                  <div className="relative">
                    <Heart className="h-6 sm:h-7 w-6 sm:w-7 text-pink-500 animate-pulse" />
                    <div className="absolute inset-0 bg-pink-500 rounded-full animate-ping opacity-20" />
                  </div>
                )}
                <h2 className="text-xl sm:text-2xl font-bold text-indigo-900">
                  {result.date === '23/7/1996' ? 'Your Original Horoscope' : 'Perfect Match Found!'}
                </h2>
              </div>
              <button
                onClick={() => setShowIgnoredDates(true)}
                className="text-xs sm:text-sm text-indigo-600 hover:text-indigo-700 flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 rounded-xl hover:bg-indigo-50 transition-all duration-300 group"
              >
                <X className="h-3 sm:h-4 w-3 sm:w-4 group-hover:rotate-90 transition-transform duration-300" />
                <span>Ignored ({ignoredDates.length})</span>
              </button>
            </div>

            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-white rounded-xl transition-colors group">
                <Calendar className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-600 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-gray-700 text-base sm:text-lg">
                  Birth Date: {result.date}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-white rounded-xl transition-colors group">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Star className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-600 group-hover:rotate-45 transition-transform duration-300" />
                  <span className="text-gray-700 text-base sm:text-lg">
                    Nakshatra: {result.nakshatra}
                  </span>
                </div>
                <button
                  title="Copy Nakshatra"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(result.nakshatra);
                  }}
                  className="p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 hover:bg-indigo-50 rounded-xl transition-all duration-300 relative"
                >
                  <Copy className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
                  <span className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] sm:text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Copy to clipboard
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-between p-3 sm:p-4 hover:bg-white rounded-xl transition-colors group">
                <div className="flex items-center gap-2 sm:gap-3">
                  <Moon className="h-5 sm:h-6 w-5 sm:w-6 text-indigo-600 group-hover:rotate-45 transition-transform duration-300" />
                  <span className="text-gray-700 text-base sm:text-lg">
                    Rasi: {result.rasi}
                  </span>
                </div>
                <button
                  title="Copy Rasi"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyToClipboard(result.rasi);
                  }}
                  className="p-1.5 sm:p-2 opacity-0 group-hover:opacity-100 hover:bg-indigo-50 rounded-xl transition-all duration-300 relative"
                >
                  <Copy className="h-3 sm:h-4 w-3 sm:w-4 text-gray-500" />
                  <span className="absolute -top-6 sm:-top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-[10px] sm:text-xs py-1 px-2 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
                    Copy to clipboard
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 hover:bg-white rounded-xl transition-colors group">
                <Star className="h-5 sm:h-6 w-5 sm:w-6 text-yellow-500 group-hover:scale-110 transition-transform duration-300" />
                <span className="text-gray-700 text-base sm:text-lg">
                  Match Points: {result.points}/10
                </span>
              </div>

              <div className="flex flex-col gap-2 sm:gap-3 pt-3 sm:pt-4">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadHoroscopeImage(result.date, result.rasi, result.nakshatra);
                  }}
                  disabled={isDownloading}
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-xl hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100 shadow-lg hover:shadow-xl disabled:hover:shadow-lg disabled:opacity-50 text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-3 group"
                >
                  {isDownloading ? (
                    <>
                      <Loader2 className="h-5 sm:h-6 w-5 sm:w-6 animate-spin" />
                      <span>Generating Horoscope...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
                      <span>Download Horoscope</span>
                    </>
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/details');
                  }}
                  className="w-full bg-white border-2 border-indigo-200 text-indigo-600 py-3 sm:py-4 px-4 sm:px-6 rounded-xl hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-lg flex items-center justify-center gap-2 sm:gap-3 group"
                >
                  <Eye className="h-5 sm:h-6 w-5 sm:w-6 group-hover:scale-110 transition-transform duration-300" />
                  <span>View Match Details</span>
                  <ChevronRight className="h-4 sm:h-5 w-4 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
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
  const [date, setDate] = useState('1996-01-01');
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
      const locationStrings = JSON.parse(data);
      
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
      case 'july': {
        for (let i = 0; i < count; i++) {
          combinations.push({ day: Math.floor(Math.random() * 31) + 1, month: 7 });
        }
        break;
      }
        
      case 'date23': {
        const months = Array.from({ length: 12 }, (_, i) => i + 1);
        const shuffledMonths = months.sort(() => Math.random() - 0.5);
        for (let i = 0; i < Math.min(count, 12); i++) {
          combinations.push({ day: 23, month: shuffledMonths[i] });
        }
        break;
      }
        
      case 'random': {
        while (combinations.length < count) {
          const month = Math.floor(Math.random() * 12) + 1;
          const maxDays = new Date(1996, month, 0).getDate();
          const day = Math.floor(Math.random() * maxDays) + 1;
          combinations.push({ day, month });
        }
        break;
      }
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

    if (!isRetry) {
      setResult(null);
    }

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
        { strategy: 'july' as const, targetPoints: 9.5, message: 'Checking July dates for matches ≥ 9.5 points...' },
        { strategy: 'july' as const, targetPoints: 9, message: 'Checking July dates for matches ≥ 9 points...' },
        { strategy: 'july' as const, targetPoints: 8.5, message: 'Checking July dates for matches ≥ 8.5 points...' },
        { strategy: 'july' as const, targetPoints: 8, message: 'Checking July dates for matches ≥ 8 points...' },
        
        { strategy: 'date23' as const, targetPoints: 9.5, message: 'Checking date 23 across months for matches ≥ 9.5 points...' },
        { strategy: 'date23' as const, targetPoints: 9, message: 'Checking date 23 across months for matches ≥ 9 points...' },
        { strategy: 'date23' as const, targetPoints: 8.5, message: 'Checking date 23 across months for matches ≥ 8.5 points...' },
        { strategy: 'date23' as const, targetPoints: 8, message: 'Checking date 23 across months for matches ≥ 8 points...' },
        
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
        
        const validCombinations = combinations.filter(
          ({ day, month }) => !isDateIgnored(day, month)
        );
        
        const matchPromises = validCombinations.map(async ({ day: bday, month: bmonth }) => {
          const formData = new FormData();
          formData.append('compatibility_system', 'Tamil Porutham');
          formData.append('gname', name);

          if (selectedLocation) {
            formData.append(
              'glocation',
              `${selectedLocation.name}, ${selectedLocation.state}, ${selectedLocation.country}`
            );
            formData.append('gloc', selectedLocation.loc);
          }

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
          location: selectedLocation!,
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
    
    setName(item.name);
    setSelectedLocation(item.location);
    setSearchQuery(`${item.location.name}, ${item.location.state}, ${item.location.country}`);
    setDate(item.date);
    setTime(item.time);
    setAmpm(item.ampm);

    if (item.ignoredDates) {
      setIgnoredDates(item.ignoredDates);
      localStorage.setItem('ignoredDates', JSON.stringify(item.ignoredDates));
    }

    setResult(item.result || null);
    setShowHistory(false);

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

  const checkOriginalMatch = async () => {
    if (!name || !date || !time || !selectedLocation) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const [year, month, day] = date.split('-');
      const [hours, minutes] = time.split(':');

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
      formData.append('bmonth', '7');
      formData.append('bday', '23');
      formData.append('bhour', '9');
      formData.append('bmin', '45');
      formData.append('bapm', 'am');
      formData.append('bgender', 'male');
      formData.append('p', '1');

      const { points, html } = await checkMatch(formData);
      const { nakshatra, rasi } = await getNakshatraAndRasi(23, 7);

      const originalMatch = {
        date: '23/7/1996',
        nakshatra,
        rasi,
        points,
        matchHtml: html
      };

      setResult(originalMatch);
      const newHistory: SearchHistory = {
        name,
        location: selectedLocation,
        date,
        time,
        ampm,
        result: originalMatch,
        timestamp: Date.now(),
        ignoredDates: [...ignoredDates]
      };
      const updatedHistory = [newHistory, ...searchHistory].slice(0, 10);
      setSearchHistory(updatedHistory);
      localStorage.setItem('searchHistory', JSON.stringify(updatedHistory));
    } catch (error) {
      console.error('Error checking original match:', error);
      setResult(null);
    } finally {
      setLoading(false);
      setStatus('');
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-2 sm:p-6 md:p-10">
        <div className="max-w-2xl mx-auto">
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
                  checkOriginalMatch={checkOriginalMatch}
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
                  ignoredDates={ignoredDates}
                  setShowIgnoredDates={setShowIgnoredDates}
                  searchHistory={searchHistory}
                  isInstallable={isInstallable}
                  installApp={installApp}
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Search History</h2>
                <button
                  title="Close history"
                  onClick={() => setShowHistory(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 sm:h-5 w-4 sm:w-5" />
                </button>
              </div>

              <div className="relative mb-3 sm:mb-4">
                <input
                  type="text"
                  value={historySearchQuery}
                  onChange={(e) => setHistorySearchQuery(e.target.value)}
                  placeholder="Search history..."
                  className="w-full px-3 sm:px-4 py-2 sm:py-2.5 pl-8 sm:pl-10 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm sm:text-base"
                />
                <Search className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-4 sm:h-5 w-4 sm:w-5 text-gray-400" />
              </div>

              <div className="overflow-y-auto flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6">
                <div className="space-y-2 sm:space-y-3">
                  {filteredHistory.length === 0 ? (
                    <div className="text-center text-gray-500 py-3 sm:py-4 text-sm sm:text-base">
                      No matching records found
                    </div>
                  ) : (
                    filteredHistory.map((item, index) => (
                      <div
                        key={index}
                        onClick={() => applyHistoryItem(item)}
                        className="p-3 sm:p-4 border border-gray-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition-colors duration-150 group"
                      >
                        <div className="flex justify-between items-start mb-1.5 sm:mb-2">
                          <div>
                            <h3 className="font-medium text-base sm:text-lg text-indigo-600">{item.name}</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {item.location.name}, {item.location.state}
                            </p>
                          </div>
                          <div className="text-right text-xs sm:text-sm text-gray-500">
                            {new Date(item.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Calendar className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                            <span>{item.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <Clock className="h-3 sm:h-4 w-3 sm:w-4 text-gray-400" />
                            <span>{item.time} {item.ampm}</span>
                          </div>
                        </div>

                        {item.result && (
                          <div className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-gray-100">
                            <div className="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs sm:text-sm">
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Star className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-400" />
                                <span>Nakshatra: {item.result.nakshatra}</span>
                              </div>
                              <div className="flex items-center gap-1.5 sm:gap-2">
                                <Moon className="h-3 sm:h-4 w-3 sm:w-4 text-indigo-400" />
                                <span>Rasi: {item.result.rasi}</span>
                              </div>
                            </div>
                            <div className="mt-1 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm">
                              <Star className="h-3 sm:h-4 w-3 sm:w-4 text-yellow-400" />
                              <span>Match Points: {item.result.points}/10</span>
                            </div>
                            {item.ignoredDates && item.ignoredDates.length > 0 && (
                              <div className="mt-1 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500">
                                <X className="h-3 sm:h-4 w-3 sm:w-4" />
                                <span>Ignored Dates: {item.ignoredDates.length}</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className="mt-1.5 sm:mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs sm:text-sm text-indigo-600">
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
            <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-lg w-full max-h-[90vh] sm:max-h-[80vh] flex flex-col">
              <div className="flex justify-between items-center mb-3 sm:mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">Ignored Dates ({ignoredDates.length})</h2>
                <button
                  title="Close ignored dates"
                  onClick={() => setShowIgnoredDates(false)}
                  className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-full"
                >
                  <X className="h-4 sm:h-5 w-4 sm:w-5" />
                </button>
              </div>

              <div className="overflow-y-auto flex-1 -mx-4 sm:-mx-6 px-4 sm:px-6">
                {ignoredDates.length === 0 ? (
                  <div className="text-center text-gray-500 py-3 sm:py-4 text-sm sm:text-base">
                    No ignored dates yet
                  </div>
                ) : (
                  <div className="space-y-2 sm:space-y-3">
                    {ignoredDates.map((ignored, index) => (
                      <div
                        key={index}
                        className="p-3 sm:p-4 border border-gray-200 rounded-xl flex justify-between items-center"
                      >
                        <div>
                          <div className="font-medium text-sm sm:text-base">
                            {ignored.day}/{ignored.month}/1996
                          </div>
                          <div className="text-[10px] sm:text-xs text-gray-500 mt-0.5 sm:mt-1">
                            Ignored on: {new Date(ignored.timestamp).toLocaleDateString()}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedIgnoredDates = ignoredDates.filter(d => d.day !== ignored.day && d.month !== ignored.month);
                            setIgnoredDates(updatedIgnoredDates);
                            localStorage.setItem('ignoredDates', JSON.stringify(updatedIgnoredDates));
                          }}
                          className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove from ignored list"
                        >
                          <X className="h-4 sm:h-5 w-4 sm:w-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {isInstallable && (
          <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 bg-white border-t border-gray-200 shadow-lg">
            <div className="max-w-lg mx-auto flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <img 
                  src="/android-chrome-192x192.png" 
                  alt="App icon" 
                  className="w-8 sm:w-10 h-8 sm:h-10 rounded-xl"
                />
                <div>
                  <h3 className="font-semibold text-sm sm:text-base">Install App</h3>
                  <p className="text-xs sm:text-sm text-gray-600">Add to your home screen for quick access</p>
                </div>
              </div>
              <button
                onClick={installApp}
                className="px-3 sm:px-4 py-1.5 sm:py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm sm:text-base"
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