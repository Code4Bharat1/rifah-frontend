import { COUNTRIES } from "./countries";

/**
 * Comprehensive dataset of International Countries, Major Cities, and Postal/Zip Codes.
 * Used for cascading Country -> City selection and auto-filling postal codes in USD registration.
 */
export const INTERNATIONAL_COUNTRIES_AND_CITIES = {
  "United Arab Emirates": [
    { city: "Dubai", pincode: "00000" },
    { city: "Abu Dhabi", pincode: "00000" },
    { city: "Sharjah", pincode: "00000" },
    { city: "Ajman", pincode: "00000" },
    { city: "Ras Al Khaimah", pincode: "00000" },
    { city: "Fujairah", pincode: "00000" },
    { city: "Umm Al Quwain", pincode: "00000" },
    { city: "Al Ain", pincode: "00000" },
  ],
  "Saudi Arabia": [
    { city: "Riyadh", pincode: "11564" },
    { city: "Jeddah", pincode: "21442" },
    { city: "Mecca (Makkah)", pincode: "24231" },
    { city: "Medina (Madinah)", pincode: "42311" },
    { city: "Dammam", pincode: "32411" },
    { city: "Al Khobar", pincode: "34423" },
    { city: "Dhahran", pincode: "34463" },
    { city: "Jubail", pincode: "35514" },
    { city: "Tabuk", pincode: "47512" },
    { city: "Yanbu", pincode: "46424" },
    { city: "Abha", pincode: "62521" },
    { city: "Taif", pincode: "26511" },
  ],
  "Qatar": [
    { city: "Doha", pincode: "00000" },
    { city: "Al Rayyan", pincode: "00000" },
    { city: "Al Wakrah", pincode: "00000" },
    { city: "Al Khor", pincode: "00000" },
    { city: "Lusail", pincode: "00000" },
    { city: "Umm Salal", pincode: "00000" },
  ],
  "Kuwait": [
    { city: "Kuwait City", pincode: "13001" },
    { city: "Hawalli", pincode: "32001" },
    { city: "Salmiya", pincode: "22001" },
    { city: "Al Ahmadi", pincode: "61001" },
    { city: "Farwaniya", pincode: "85000" },
    { city: "Jahra", pincode: "00004" },
  ],
  "Oman": [
    { city: "Muscat", pincode: "100" },
    { city: "Salalah", pincode: "211" },
    { city: "Sohar", pincode: "311" },
    { city: "Nizwa", pincode: "611" },
    { city: "Sur", pincode: "411" },
    { city: "Seeb", pincode: "121" },
    { city: "Barka", pincode: "320" },
  ],
  "Bahrain": [
    { city: "Manama", pincode: "316" },
    { city: "Riffa", pincode: "901" },
    { city: "Muharraq", pincode: "201" },
    { city: "Hamad Town", pincode: "1201" },
    { city: "Isa Town", pincode: "801" },
    { city: "Sitra", pincode: "601" },
  ],
  "United States": [
    { city: "New York", pincode: "10001" },
    { city: "Los Angeles", pincode: "90001" },
    { city: "Chicago", pincode: "60601" },
    { city: "Houston", pincode: "77001" },
    { city: "Phoenix", pincode: "85001" },
    { city: "Philadelphia", pincode: "19101" },
    { city: "San Antonio", pincode: "78201" },
    { city: "San Diego", pincode: "92101" },
    { city: "Dallas", pincode: "75201" },
    { city: "San Jose", pincode: "95101" },
    { city: "Austin", pincode: "78701" },
    { city: "San Francisco", pincode: "94101" },
    { city: "Seattle", pincode: "98101" },
    { city: "Denver", pincode: "80201" },
    { city: "Boston", pincode: "02108" },
    { city: "Miami", pincode: "33101" },
    { city: "Atlanta", pincode: "30301" },
  ],
  "United Kingdom": [
    { city: "London", pincode: "EC1A 1BB" },
    { city: "Birmingham", pincode: "B1 1AA" },
    { city: "Manchester", pincode: "M1 1AE" },
    { city: "Glasgow", pincode: "G1 1AA" },
    { city: "Liverpool", pincode: "L1 8JQ" },
    { city: "Leeds", pincode: "LS1 1AA" },
    { city: "Sheffield", pincode: "S1 1AA" },
    { city: "Edinburgh", pincode: "EH1 1YZ" },
    { city: "Bristol", pincode: "BS1 1AA" },
    { city: "Leicester", pincode: "LE1 1AA" },
    { city: "Cardiff", pincode: "CF10 1AA" },
    { city: "Belfast", pincode: "BT1 1AA" },
  ],
  "Canada": [
    { city: "Toronto", pincode: "M5H 2N2" },
    { city: "Montreal", pincode: "H2Y 1C6" },
    { city: "Vancouver", pincode: "V6B 1A1" },
    { city: "Calgary", pincode: "T2P 1J9" },
    { city: "Edmonton", pincode: "T5J 0N3" },
    { city: "Ottawa", pincode: "K1P 1J1" },
    { city: "Winnipeg", pincode: "R3C 0V8" },
    { city: "Quebec City", pincode: "G1R 4V7" },
    { city: "Halifax", pincode: "B3J 1A1" },
  ],
  "Australia": [
    { city: "Sydney", pincode: "2000" },
    { city: "Melbourne", pincode: "3000" },
    { city: "Brisbane", pincode: "4000" },
    { city: "Perth", pincode: "6000" },
    { city: "Adelaide", pincode: "5000" },
    { city: "Gold Coast", pincode: "4217" },
    { city: "Canberra", pincode: "2600" },
    { city: "Newcastle", pincode: "2300" },
    { city: "Hobart", pincode: "7000" },
  ],
  "Singapore": [
    { city: "Singapore", pincode: "018989" },
  ],
  "Malaysia": [
    { city: "Kuala Lumpur", pincode: "50450" },
    { city: "George Town (Penang)", pincode: "10200" },
    { city: "Johor Bahru", pincode: "80000" },
    { city: "Ipoh", pincode: "30000" },
    { city: "Shah Alam", pincode: "40000" },
    { city: "Petaling Jaya", pincode: "46000" },
    { city: "Malacca", pincode: "75000" },
    { city: "Kota Kinabalu", pincode: "88000" },
    { city: "Kuching", pincode: "93000" },
  ],
  "Turkey": [
    { city: "Istanbul", pincode: "34000" },
    { city: "Ankara", pincode: "06000" },
    { city: "Izmir", pincode: "35000" },
    { city: "Bursa", pincode: "16000" },
    { city: "Antalya", pincode: "07000" },
    { city: "Adana", pincode: "01000" },
    { city: "Gaziantep", pincode: "27000" },
    { city: "Konya", pincode: "42000" },
  ],
  "Germany": [
    { city: "Berlin", pincode: "10115" },
    { city: "Munich", pincode: "80331" },
    { city: "Frankfurt", pincode: "60311" },
    { city: "Hamburg", pincode: "20095" },
    { city: "Cologne", pincode: "50667" },
    { city: "Stuttgart", pincode: "70173" },
    { city: "Düsseldorf", pincode: "40213" },
    { city: "Leipzig", pincode: "04109" },
  ],
  "France": [
    { city: "Paris", pincode: "75001" },
    { city: "Marseille", pincode: "13001" },
    { city: "Lyon", pincode: "69001" },
    { city: "Toulouse", pincode: "31000" },
    { city: "Nice", pincode: "06000" },
    { city: "Nantes", pincode: "44000" },
    { city: "Strasbourg", pincode: "67000" },
    { city: "Bordeaux", pincode: "33000" },
  ],
  "Italy": [
    { city: "Rome", pincode: "00118" },
    { city: "Milan", pincode: "20121" },
    { city: "Naples", pincode: "80121" },
    { city: "Turin", pincode: "10121" },
    { city: "Florence", pincode: "50121" },
    { city: "Venice", pincode: "30121" },
    { city: "Bologna", pincode: "40121" },
  ],
  "Spain": [
    { city: "Madrid", pincode: "28001" },
    { city: "Barcelona", pincode: "08001" },
    { city: "Valencia", pincode: "46001" },
    { city: "Seville", pincode: "41001" },
    { city: "Zaragoza", pincode: "50001" },
    { city: "Malaga", pincode: "29001" },
  ],
  "Netherlands": [
    { city: "Amsterdam", pincode: "1012 JS" },
    { city: "Rotterdam", pincode: "3011 AA" },
    { city: "The Hague", pincode: "2511 AA" },
    { city: "Utrecht", pincode: "3511 AA" },
    { city: "Eindhoven", pincode: "5611 AA" },
  ],
  "Switzerland": [
    { city: "Zurich", pincode: "8001" },
    { city: "Geneva", pincode: "1201" },
    { city: "Basel", pincode: "4001" },
    { city: "Bern", pincode: "3001" },
    { city: "Lausanne", pincode: "1001" },
  ],
  "Belgium": [
    { city: "Brussels", pincode: "1000" },
    { city: "Antwerp", pincode: "2000" },
    { city: "Ghent", pincode: "9000" },
    { city: "Bruges", pincode: "8000" },
  ],
  "Sweden": [
    { city: "Stockholm", pincode: "111 20" },
    { city: "Gothenburg", pincode: "411 01" },
    { city: "Malmo", pincode: "211 11" },
    { city: "Uppsala", pincode: "753 10" },
  ],
  "Norway": [
    { city: "Oslo", pincode: "0150" },
    { city: "Bergen", pincode: "5003" },
    { city: "Trondheim", pincode: "7010" },
    { city: "Stavanger", pincode: "4005" },
  ],
  "Denmark": [
    { city: "Copenhagen", pincode: "1050" },
    { city: "Aarhus", pincode: "8000" },
    { city: "Odense", pincode: "5000" },
  ],
  "Japan": [
    { city: "Tokyo", pincode: "100-0001" },
    { city: "Osaka", pincode: "530-0001" },
    { city: "Yokohama", pincode: "220-0001" },
    { city: "Nagoya", pincode: "460-0001" },
    { city: "Kyoto", pincode: "600-8001" },
    { city: "Fukuoka", pincode: "810-0001" },
  ],
  "South Korea": [
    { city: "Seoul", pincode: "03000" },
    { city: "Busan", pincode: "46000" },
    { city: "Incheon", pincode: "21000" },
    { city: "Daegu", pincode: "41000" },
  ],
  "China": [
    { city: "Beijing", pincode: "100000" },
    { city: "Shanghai", pincode: "200000" },
    { city: "Guangzhou", pincode: "510000" },
    { city: "Shenzhen", pincode: "518000" },
    { city: "Hangzhou", pincode: "310000" },
  ],
  "Hong Kong": [
    { city: "Hong Kong", pincode: "999077" },
    { city: "Kowloon", pincode: "999077" },
  ],
  "Indonesia": [
    { city: "Jakarta", pincode: "10110" },
    { city: "Surabaya", pincode: "60111" },
    { city: "Bandung", pincode: "40111" },
    { city: "Medan", pincode: "20111" },
    { city: "Bali (Denpasar)", pincode: "80111" },
  ],
  "Bangladesh": [
    { city: "Dhaka", pincode: "1000" },
    { city: "Chittagong", pincode: "4000" },
    { city: "Sylhet", pincode: "3100" },
    { city: "Rajshahi", pincode: "6000" },
    { city: "Khulna", pincode: "9000" },
  ],
  "Sri Lanka": [
    { city: "Colombo", pincode: "00100" },
    { city: "Kandy", pincode: "20000" },
    { city: "Galle", pincode: "80000" },
    { city: "Jaffna", pincode: "40000" },
    { city: "Negombo", pincode: "11500" },
  ],
  "Nepal": [
    { city: "Kathmandu", pincode: "44600" },
    { city: "Pokhara", pincode: "33700" },
    { city: "Lalitpur", pincode: "44700" },
    { city: "Biratnagar", pincode: "56613" },
  ],
  "Pakistan": [
    { city: "Karachi", pincode: "74200" },
    { city: "Lahore", pincode: "54000" },
    { city: "Islamabad", pincode: "44000" },
    { city: "Rawalpindi", pincode: "46000" },
    { city: "Faisalabad", pincode: "38000" },
    { city: "Peshawar", pincode: "25000" },
    { city: "Multan", pincode: "60000" },
    { city: "Sialkot", pincode: "51310" },
  ],
  "South Africa": [
    { city: "Johannesburg", pincode: "2001" },
    { city: "Cape Town", pincode: "8001" },
    { city: "Durban", pincode: "4001" },
    { city: "Pretoria", pincode: "0002" },
  ],
  "Egypt": [
    { city: "Cairo", pincode: "11511" },
    { city: "Alexandria", pincode: "21500" },
    { city: "Giza", pincode: "12511" },
    { city: "Port Said", pincode: "42511" },
  ],
  "Nigeria": [
    { city: "Lagos", pincode: "100001" },
    { city: "Abuja", pincode: "900001" },
    { city: "Kano", pincode: "700001" },
    { city: "Ibadan", pincode: "200001" },
  ],
  "Kenya": [
    { city: "Nairobi", pincode: "00100" },
    { city: "Mombasa", pincode: "80100" },
    { city: "Kisumu", pincode: "40100" },
  ],
  "Jordan": [
    { city: "Amman", pincode: "11110" },
    { city: "Zarqa", pincode: "13110" },
    { city: "Irbid", pincode: "21110" },
    { city: "Aqaba", pincode: "77110" },
  ],
  "Morocco": [
    { city: "Casablanca", pincode: "20000" },
    { city: "Rabat", pincode: "10000" },
    { city: "Marrakech", pincode: "40000" },
    { city: "Tangier", pincode: "90000" },
    { city: "Fez", pincode: "30000" },
  ],
  "Brazil": [
    { city: "Sao Paulo", pincode: "01000-000" },
    { city: "Rio de Janeiro", pincode: "20000-000" },
    { city: "Brasilia", pincode: "70000-000" },
  ],
  "Mexico": [
    { city: "Mexico City", pincode: "01000" },
    { city: "Guadalajara", pincode: "44100" },
    { city: "Monterrey", pincode: "64000" },
    { city: "Cancun", pincode: "77500" },
  ],
  "New Zealand": [
    { city: "Auckland", pincode: "1010" },
    { city: "Wellington", pincode: "6011" },
    { city: "Christchurch", pincode: "8011" },
  ],
  "Ireland": [
    { city: "Dublin", pincode: "D01 A1B2" },
    { city: "Cork", pincode: "T12 A1B2" },
    { city: "Galway", pincode: "H91 A1B2" },
  ],
  "Thailand": [
    { city: "Bangkok", pincode: "10100" },
    { city: "Phuket", pincode: "83000" },
    { city: "Chiang Mai", pincode: "50000" },
    { city: "Pattaya", pincode: "20150" },
  ],
  "Vietnam": [
    { city: "Ho Chi Minh City", pincode: "70000" },
    { city: "Hanoi", pincode: "10000" },
    { city: "Da Nang", pincode: "550000" },
  ],
  "Philippines": [
    { city: "Manila", pincode: "1000" },
    { city: "Quezon City", pincode: "1100" },
    { city: "Cebu City", pincode: "6000" },
    { city: "Davao City", pincode: "8000" },
  ],
  "Maldives": [
    { city: "Male", pincode: "20002" },
    { city: "Hulhumale", pincode: "23000" },
  ],
  "Mauritius": [
    { city: "Port Louis", pincode: "11302" },
    { city: "Curepipe", pincode: "74211" },
    { city: "Grand Baie", pincode: "30510" },
  ],
};

// All international countries list (excludes India as India is under National / INR)
const mappedCountryNames = Object.keys(INTERNATIONAL_COUNTRIES_AND_CITIES);
const allOtherCountryNames = COUNTRIES.filter((c) => c.code !== "IN").map((c) => c.name);

export const ALL_INTERNATIONAL_COUNTRIES = Array.from(
  new Set([...mappedCountryNames, ...allOtherCountryNames])
).sort((a, b) => a.localeCompare(b));

/**
 * Returns list of cities for an international country.
 */
export function getCitiesForInternationalCountry(countryName) {
  if (!countryName) return [];
  const normalized = countryName.trim().toLowerCase();
  
  // Find key matching normalized
  const foundKey = Object.keys(INTERNATIONAL_COUNTRIES_AND_CITIES).find(
    (k) => k.toLowerCase() === normalized
  );

  if (foundKey && INTERNATIONAL_COUNTRIES_AND_CITIES[foundKey]) {
    return INTERNATIONAL_COUNTRIES_AND_CITIES[foundKey].map((item) => item.city);
  }
  return [];
}

/**
 * Returns representative pincode/postal code for a given country and city.
 */
export function getPincodeForInternationalCity(countryName, cityName) {
  if (!countryName || !cityName) return "";
  const normCountry = countryName.trim().toLowerCase();
  const normCity = cityName.trim().toLowerCase();

  const foundKey = Object.keys(INTERNATIONAL_COUNTRIES_AND_CITIES).find(
    (k) => k.toLowerCase() === normCountry
  );

  if (!foundKey) return "";
  const list = INTERNATIONAL_COUNTRIES_AND_CITIES[foundKey] || [];
  const match = list.find((item) => item.city.toLowerCase() === normCity);
  return match?.pincode || "";
}

/**
 * Finds country object (flag, dialCode, code) from country name.
 */
export function getCountryObjByName(countryName) {
  if (!countryName) return null;
  const norm = countryName.trim().toLowerCase();
  return (
    COUNTRIES.find(
      (c) =>
        c.name.toLowerCase() === norm ||
        c.name.toLowerCase().includes(norm) ||
        norm.includes(c.name.toLowerCase())
    ) || null
  );
}

/**
 * Returns localized postal code label based on country name & region:
 * India       → PIN Code
 * USA         → ZIP Code
 * UK          → Postcode
 * Canada      → Postal Code
 * Germany     → Postal Code
 * Australia   → Postcode
 */
export function getPostalCodeLabel(countryOrState, region = "national") {
  if (region === "national") return "PIN Code";
  if (!countryOrState) return "Postal / ZIP Code";
  
  const c = countryOrState.trim().toLowerCase();
  if (c.includes("india")) return "PIN Code";
  if (c.includes("united states") || c.includes("usa") || c === "us" || c.includes("america")) return "ZIP Code";
  if (c.includes("united kingdom") || c.includes("uk") || c === "gb" || c.includes("great britain") || c.includes("england") || c.includes("scotland") || c.includes("wales") || c.includes("northern ireland")) return "Postcode";
  if (c.includes("australia") || c.includes("new zealand")) return "Postcode";
  if (c.includes("canada") || c.includes("germany") || c.includes("france") || c.includes("spain") || c.includes("italy") || c.includes("japan") || c.includes("netherlands") || c.includes("singapore") || c.includes("malaysia") || c.includes("switzerland") || c.includes("sweden") || c.includes("norway")) return "Postal Code";
  if (c.includes("emirates") || c.includes("uae") || c.includes("saudi") || c.includes("qatar") || c.includes("kuwait") || c.includes("oman") || c.includes("bahrain")) return "Postal / ZIP Code";
  
  return "Postal Code";
}

/**
 * Returns localized postal code placeholder based on country name & region
 */
export function getPostalCodePlaceholder(countryOrState, region = "national") {
  if (region === "national") return "6-digit PIN code (e.g. 400001)";
  if (!countryOrState) return "Enter Postal / ZIP Code";

  const c = countryOrState.trim().toLowerCase();
  if (c.includes("india")) return "6-digit PIN code (e.g. 400001)";
  if (c.includes("united states") || c.includes("usa") || c === "us" || c.includes("america")) return "5-digit ZIP code (e.g. 90210)";
  if (c.includes("united kingdom") || c.includes("uk") || c === "gb" || c.includes("great britain") || c.includes("england") || c.includes("scotland")) return "e.g. SW1A 1AA / EC1A 1BB";
  if (c.includes("canada")) return "e.g. K1A 0B1";
  if (c.includes("germany")) return "5-digit Postal Code (e.g. 10115)";
  if (c.includes("australia")) return "4-digit Postcode (e.g. 2000)";
  if (c.includes("emirates") || c.includes("uae") || c.includes("qatar")) return "e.g. 00000";
  return "Enter Postal / ZIP Code";
}

