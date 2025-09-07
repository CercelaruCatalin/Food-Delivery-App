"use client"
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from 'next-auth/react';

export default function HomePage() {
  const [cities, setCities] = useState([]);
  const [filteredCities, setFilteredCities] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAllCities, setShowAllCities] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    const fetchCities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/cities');
        
        if (!response.ok) {
          throw new Error("Failed to load cities");
        }
        
        const data = await response.json();
        setCities(data.cities);
        setFilteredCities(data.cities);
      } catch (error) {
        console.error("Error fetching cities:", error);
      } finally {
        setLoading(false);
      }
    };

    const userType = session?.user?.userType;
    if(userType == 'user' || userType == null){
      fetchCities();
    }else{
      router.push('/courier/dashboard');
    }
  }, [status, session]);

  const handleCitiesSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setFilteredCities(cities);
      setShowAllCities(false);
      return;
    }
    
    const filtered = cities.filter(city => 
      city.toLowerCase().includes(searchQuery.toLowerCase())
    );

    setFilteredCities(filtered);
    setShowAllCities(true);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setFilteredCities(cities);
    setShowAllCities(false);
    setLocationError("");
  };

  const getCityFromCoordinates = async (latitude, longitude) => {
    try {
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&language=ro&region=ro&result_type=locality|administrative_area_level_1|administrative_area_level_2`
      );
      
      if (!response.ok) {
        throw new Error('Geocoding failed');
      }
      
      const data = await response.json();
      
      if (data.status === 'OK' && data.results.length > 0) {
        const sortedResults = data.results.sort((a, b) => {
          const aHasLocality = a.address_components.some(comp => comp.types.includes('locality'));
          const bHasLocality = b.address_components.some(comp => comp.types.includes('locality'));
          
          if (aHasLocality && !bHasLocality) return -1;
          if (!aHasLocality && bHasLocality) return 1;
          return 0;
        });
        
        for (const result of sortedResults) {
          console.log('Geocoding result:', result.formatted_address, result.types);
          
          const cityComponent = result.address_components.find(
            component => component.types.includes('locality')
          );
          
          if (cityComponent) {
            console.log('Found city:', cityComponent.long_name);
            return removeDiacritics(cityComponent.long_name);
          }
        }
        
        for (const result of sortedResults) {
          const adminComponent = result.address_components.find(
            component => component.types.includes('administrative_area_level_1')
          );
          
          if (adminComponent) {
            console.log('Found admin area:', adminComponent.long_name);
            return removeDiacritics(adminComponent.long_name);
          }
        }
      }
      
      console.log('No city found from geocoding');
      return null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  };

  const handleUseCurrentLocation = async () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by this browser");
      return;
    }

    if (!session) {
      setLocationError("Please sign in to save your location");
      return;
    }

    setLocationLoading(true);
    setLocationError("");

    const options = {
      enableHighAccuracy: true,
      timeout: 20000,
      maximumAge: 0
    };

    const getCurrentLocationWithRetry = () => {
      return new Promise((resolve, reject) => {
        let attempts = 0;
        const maxAttempts = 3;
        
        const tryGetLocation = () => {
          attempts++;
          navigator.geolocation.getCurrentPosition(
            (position) => resolve(position),
            (error) => {
              if (attempts < maxAttempts && error.code !== error.PERMISSION_DENIED) {
                console.log(`Location attempt ${attempts} failed, retrying...`);
                setTimeout(tryGetLocation, 1000);
              } else {
                reject(error);
              }
            },
            options
          );
        };
        
        tryGetLocation();
      });
    };

    try {
      const position = await getCurrentLocationWithRetry();
      const { latitude, longitude, accuracy } = position.coords;
      
      console.log('GPS Coordinates:', { latitude, longitude, accuracy });
      
      if (accuracy > 1000) {
        setLocationError("Location accuracy is low. Please try again or search manually.");
        setLocationLoading(false);
        return;
      }
      
      const cityName = await getCityFromCoordinates(latitude, longitude);
      
      const response = await fetch('/api/user/location', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude,
          longitude
        }),
      });

      if (response.ok) {
        if (cityName) {
          setSearchQuery(cityName);
          
          const filtered = cities.filter(city => 
            city.toLowerCase().includes(cityName.toLowerCase()) ||
            cityName.toLowerCase().includes(city.toLowerCase())
          );
          
          if (filtered.length > 0) {
            setFilteredCities(filtered);
            setShowAllCities(true);
          } else {
            const partialMatch = cities.filter(city => {
              const cityLower = city.toLowerCase();
              const detectedLower = cityName.toLowerCase();
              return cityLower.includes(detectedLower.split(' ')[0]) || 
                     detectedLower.includes(cityLower.split(' ')[0]);
            });
            
            if (partialMatch.length > 0) {
              setFilteredCities(partialMatch);
              setShowAllCities(true);
            } else {
              setLocationError(`We don't deliver to ${cityName} yet, but we're expanding!`);
              setFilteredCities(cities);
              setShowAllCities(true);
            }
          }
        } else {
          setFilteredCities(cities);
          setShowAllCities(true);
          setLocationError("Location saved! Could not determine your city name, but you can search manually.");
        }
      } else {
        const errorData = await response.json();
        setLocationError(errorData.error || "Failed to save location");
      }
    } catch (error) {
      console.error('Location handling error:', error);
      setLocationError("Failed to process your location");
    } finally {
      setLocationLoading(false);
    }
  };

  const removeDiacritics = (str) => {
    return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  };

  const getCitiesToDisplay = () => {
    if (searchQuery.trim() || showAllCities) {
      return filteredCities;
    }
    return filteredCities.slice(0, 10);
  };

  const getCityImageUrl = (cityName) => {
    const formattedCityName = cityName.toLowerCase().replace(/\s+/g, '-');
    return `https://res.cloudinary.com/dgrxgnab1/image/upload/${formattedCityName}.jpg`;
  };

  const citiesToDisplay = getCitiesToDisplay();

  return (
    <div className="container mx-auto px-4 py-8 mt-20">
      <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12">
        <div className="md:w-1/2">
          <h1 className="text-4xl font-bold mb-4">
            Find the best food in your area
          </h1>
          <p className="text-gray-600 mb-8">
            Discover local restaurants and order delicious meals delivered right to your door
          </p>
          
          <form onSubmit={handleCitiesSearch} className="mb-8">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <input
                  type="text"
                  placeholder="Enter your city..."
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    onClick={clearSearch}
                  >
                    ✕
                  </button>
                )}
              </div>
              <button
                type="submit"
                className="bg-primary hover:bg-primaryhov text-white py-3 px-6 rounded-lg font-medium"
              >
                Find city
              </button>
            </div>
            
            <div className="mt-2">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="text-primary text-sm flex items-center gap-1 hover:text-primaryhov transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {locationLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-primary"></div>
                    Getting your location...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                    </svg>
                    Use my current location
                  </>
                )}
              </button>
            </div>
            
            {locationError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                {locationError}
              </div>
            )}
          </form>
        </div>
      </section>

      <section className="mb-12" id="citiesSection">
        <h2 className="text-2xl font-semibold mb-6 text-center">
          {searchQuery ? `Results for "${searchQuery}"` : (showAllCities ? "All Cities" : "Popular Cities")}
        </h2>
        
        {loading ? (
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : citiesToDisplay.length > 0 ? (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {citiesToDisplay.map((city, index) => (
                <Link 
                  key={index} 
                  href={`/${city.toLowerCase()}/restaurants`}
                  className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden h-96"
                >
                  <div className="absolute inset-0 overflow-hidden">
                    <Image
                      src={getCityImageUrl(city)}
                      alt={city}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      unoptimized={true}
                      onError={(e) => {
                        e.target.src = "/placeholder-city.jpg";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 transform transition-transform duration-300 group-hover:translate-y-[-5px]">
                    <h3 className="text-xl font-bold text-white tracking-wide capitalize text-center">
                      {city}
                    </h3>
                    <div className="w-12 h-1 bg-secondary mx-auto mt-2 rounded-full transform transition-all duration-300 group-hover:w-16 group-hover:bg-primary"></div>
                  </div>
                </Link>
              ))}
            </div>
            
            <div className="text-center mt-8">
              {!searchQuery && !showAllCities && cities.length > 10 && (
                <button 
                  onClick={() => setShowAllCities(true)}
                  className="px-6 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-full transition-colors mr-4"
                >
                  View All Cities ({cities.length})
                </button>
              )}
              
              {!searchQuery && showAllCities && (
                <button 
                  onClick={() => setShowAllCities(false)}
                  className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-full transition-colors"
                >
                  Show Less
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center text-gray-500">
            {searchQuery ? 
              `No cities available "${searchQuery}"` : 
              "No cities available at the moment."
            }
          </div>
        )}
      </section>
    </div>
  );
}