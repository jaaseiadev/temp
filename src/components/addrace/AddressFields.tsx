'use client';

import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Province, City, Municipality, Barangay } from '@/types/psgc';

interface AddressFieldsProps {
  formData: {
    province: string;dadasdasdasd
    provinceCode: string;
    cityMunicipality: string;
    cityMunicipalityCode: string;asdasd
    baranggay: string;
  };
  onProvinceChange: (code: string, name: string) => void;
  onCityChange: (code: string, name: string) => void;
  onBarangayChange: (name: string) => void;
}

export default function AddressFields({ asd
  formData, 
  onProvinceChange, 
  onCityChange, 
  onBarangayChange 
}: AddressFieldsProps) {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<(City | Municipality)[]>([]);
  const [barangays, setBarangays] = useState<Barangay[]>([]);
  const [loading, setLoading] = useState({
    provinces: false,
    cities: false,
    barangays: false,
  });
  const [mounted, setMounted] = useState(false);

  // Set mounted flag
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch all provinces on mount
  useEffect(() => {
    if (!mounted || typeof window === 'undefined') return;
    
    const fetchProvinces = async () => {
      setLoading(prev => ({ ...prev, provinces: true }));
      try {
        const response = await fetch('https://psgc.gitlab.io/api/provinces/', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Provinces fetched:', data.length);
        setProvinces(data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
        setProvinces([]);
      } finally {
        setLoading(prev => ({ ...prev, provinces: false }));
      }
    };
    fetchProvinces();
  }, [mounted]);

  // Fetch cities when province changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (formData.provinceCode) {
      const fetchCities = async () => {
        setLoading(prev => ({ ...prev, cities: true }));
        setCities([]);
        setBarangays([]);
        try {
          const response = await fetch(`https://psgc.gitlab.io/api/provinces/${formData.provinceCode}/cities-municipalities/`);
          const data = await response.json();
          setCities(data);
        } catch (error) {
          console.error('Error fetching cities:', error);
        } finally {
          setLoading(prev => ({ ...prev, cities: false }));
        }
      };
      fetchCities();
    } else {
      setCities([]);
      setBarangays([]);
    }
  }, [formData.provinceCode]);

  // Fetch barangays when city changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (formData.cityMunicipalityCode) {
      const fetchBarangays = async () => {
        setLoading(prev => ({ ...prev, barangays: true }));
        setBarangays([]);
        try {
          const response = await fetch(`https://psgc.gitlab.io/api/cities-municipalities/${formData.cityMunicipalityCode}/barangays/`);
          const data = await response.json();
          setBarangays(data);
        } catch (error) {
          console.error('Error fetching barangays:', error);
        } finally {
          setLoading(prev => ({ ...prev, barangays: false }));
        }
      };
      fetchBarangays();
    } else {
      setBarangays([]);
    }
  }, [formData.cityMunicipalityCode]);

  return (
    <div className="space-y-6">
      {/* Province, City/Municipality, Baranggay in Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Province */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">
            Province <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="province"
              value={formData.provinceCode}
              onChange={(e) => {
                const province = provinces.find(p => p.code === e.target.value);
                onProvinceChange(e.target.value, province?.name || '');
              }}
              disabled={loading.provinces}
              className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent appearance-none bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
            >
              <option value="">
                {loading.provinces ? 'Loading provinces...' : 'Select Province'}
              </option>
              {provinces.map((province) => (
                <option key={province.code} value={province.code}>
                  {province.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
          {!formData.provinceCode && (
            <p className="text-xs text-gray-500 mt-1">Please select a province first</p>
          )}
        </div>

        {/* City/Municipality */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">
            City / Municipality <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <select
              name="cityMunicipality"
              value={formData.cityMunicipalityCode}
              onChange={(e) => {
                const city = cities.find(c => c.code === e.target.value);
                onCityChange(e.target.value, city?.name || '');
              }}
              disabled={!formData.provinceCode || loading.cities}
              className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent appearance-none bg-white transition-all ${
                !formData.provinceCode 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                  : 'disabled:bg-gray-100 disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {!formData.provinceCode 
                  ? 'Select Province First'
                  : loading.cities 
                  ? 'Loading cities...' 
                  : 'Select City / Municipality'}
              </option>
              {cities.map((city) => (
                <option key={city.code} value={city.code}>
                  {city.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Baranggay */}
        <div className="relative">
          <label className="block text-sm font-medium mb-2">
            Baranggay <span className="text-gray-400 text-xs">( Optional )</span>
          </label>
          <div className="relative">
            <select
              name="baranggay"
              value={formData.baranggay}
              onChange={(e) => onBarangayChange(e.target.value)}
              disabled={!formData.cityMunicipalityCode || loading.barangays}
              className={`w-full px-4 py-3 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#fc4c02] focus:border-transparent appearance-none bg-white transition-all ${
                !formData.cityMunicipalityCode 
                  ? 'opacity-50 cursor-not-allowed bg-gray-50' 
                  : 'disabled:bg-gray-100 disabled:cursor-not-allowed'
              }`}
            >
              <option value="">
                {!formData.cityMunicipalityCode 
                  ? 'Select City First'
                  : loading.barangays 
                  ? 'Loading barangays...' 
                  : 'Select Baranggay'}
              </option>
              {barangays.map((barangay) => (
                <option key={barangay.code} value={barangay.name}>
                  {barangay.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}
