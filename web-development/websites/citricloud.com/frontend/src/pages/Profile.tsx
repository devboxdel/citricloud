import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Navbar from '../components/Navbar';
import Topbar from '../components/Topbar';
import Footer from '../components/Footer';
import { RichTextEditor } from '../components/RichTextEditor';
import { toast } from 'react-hot-toast';
import { profileAPI, emailAliasAPI, sharedEmailAPI, invoicesAPI, erpAPI, crmAPI, authAPI } from '../lib/api';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { useLanguage } from '../context/LanguageContext';
import { FiUser, FiMail, FiPhone, FiCheckCircle, FiXCircle, FiSettings, FiMoon, FiSun, FiClock, FiBell, FiLock, FiGlobe, FiGrid, FiBriefcase, FiFileText, FiAlertCircle, FiAward, FiPackage, FiShoppingCart, FiActivity, FiCreditCard, FiRepeat, FiPlus, FiTrash2, FiEdit2, FiAtSign, FiMapPin, FiChevronRight, FiRefreshCw, FiZap, FiCreditCard as FiPayment, FiDownload, FiFilter, FiSearch, FiMessageSquare, FiShield, FiUsers } from 'react-icons/fi';
import { QRCodeSVG } from 'qrcode.react';

const ROLE_COLORS: Record<string, string> = {
  blue: 'bg-blue-500',
  red: 'bg-red-500',
  green: 'bg-green-500',
  purple: 'bg-purple-500',
  yellow: 'bg-yellow-500',
  pink: 'bg-pink-500',
  indigo: 'bg-indigo-500',
  teal: 'bg-teal-500',
  cyan: 'bg-cyan-500',
  orange: 'bg-orange-500',
  gray: 'bg-gray-500',
  amber: 'bg-amber-500',
  lime: 'bg-lime-500',
  emerald: 'bg-emerald-500',
  sky: 'bg-sky-500',
  fuchsia: 'bg-fuchsia-500',
  violet: 'bg-violet-500',
  rose: 'bg-rose-500',
};

const ROLE_TEXT_COLORS: Record<string, string> = {
  blue: 'text-blue-700 dark:text-blue-400',
  red: 'text-red-700 dark:text-red-400',
  green: 'text-green-700 dark:text-green-400',
  purple: 'text-purple-700 dark:text-purple-400',
  yellow: 'text-yellow-700 dark:text-yellow-400',
  pink: 'text-pink-700 dark:text-pink-400',
  indigo: 'text-indigo-700 dark:text-indigo-400',
  teal: 'text-teal-700 dark:text-teal-400',
  cyan: 'text-cyan-700 dark:text-cyan-400',
  orange: 'text-orange-700 dark:text-orange-400',
  gray: 'text-gray-700 dark:text-gray-400',
  amber: 'text-amber-700 dark:text-amber-400',
  lime: 'text-lime-700 dark:text-lime-400',
  emerald: 'text-emerald-700 dark:text-emerald-400',
  sky: 'text-sky-700 dark:text-sky-400',
  fuchsia: 'text-fuchsia-700 dark:text-fuchsia-400',
  violet: 'text-violet-700 dark:text-violet-400',
  rose: 'text-rose-700 dark:text-rose-400',
};

const ROLE_BG_COLORS: Record<string, string> = {
  blue: 'bg-blue-100 dark:bg-blue-900/30',
  red: 'bg-red-100 dark:bg-red-900/30',
  green: 'bg-green-100 dark:bg-green-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30',
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30',
  indigo: 'bg-indigo-100 dark:bg-indigo-900/30',
  teal: 'bg-teal-100 dark:bg-teal-900/30',
  cyan: 'bg-cyan-100 dark:bg-cyan-900/30',
  orange: 'bg-orange-100 dark:bg-orange-900/30',
  gray: 'bg-gray-100 dark:bg-gray-900/30',
  amber: 'bg-amber-100 dark:bg-amber-900/30',
  lime: 'bg-lime-100 dark:bg-lime-900/30',
  emerald: 'bg-emerald-100 dark:bg-emerald-900/30',
  sky: 'bg-sky-100 dark:bg-sky-900/30',
  fuchsia: 'bg-fuchsia-100 dark:bg-fuchsia-900/30',
  violet: 'bg-violet-100 dark:bg-violet-900/30',
  rose: 'bg-rose-100 dark:bg-rose-900/30',
};

// Country-City mapping
const COUNTRY_CITIES: Record<string, string[]> = {
  "Afghanistan": ["Kabul", "Kandahar", "Herat", "Mazar-i-Sharif", "Jalalabad"],
  "Albania": ["Tirana", "Durrës", "Vlorë", "Elbasan", "Shkodër"],
  "Algeria": ["Algiers", "Oran", "Constantine", "Annaba", "Blida"],
  "Andorra": ["Andorra la Vella", "Escaldes-Engordany", "Encamp", "La Massana", "Sant Julià de Lòria"],
  "Angola": ["Luanda", "Huambo", "Lobito", "Benguela", "Lubango"],
  "Antigua and Barbuda": ["St. John's", "All Saints", "Liberta", "Potter's Village", "Bolans"],
  "Argentina": ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta"],
  "Armenia": ["Yerevan", "Gyumri", "Vanadzor", "Vagharshapat", "Hrazdan"],
  "Australia": ["Sydney", "Melbourne", "Brisbane", "Perth", "Adelaide", "Gold Coast", "Canberra", "Newcastle"],
  "Austria": ["Vienna", "Graz", "Linz", "Salzburg", "Innsbruck", "Klagenfurt", "Villach", "Wels"],
  "Azerbaijan": ["Baku", "Ganja", "Sumqayit", "Mingachevir", "Lankaran"],
  "Bahamas": ["Nassau", "Freeport", "West End", "Coopers Town", "Marsh Harbour"],
  "Bahrain": ["Manama", "Riffa", "Muharraq", "Hamad Town", "A'ali"],
  "Bangladesh": ["Dhaka", "Chittagong", "Khulna", "Rajshahi", "Sylhet", "Barisal", "Rangpur", "Comilla"],
  "Barbados": ["Bridgetown", "Speightstown", "Oistins", "Bathsheba", "Holetown"],
  "Belarus": ["Minsk", "Gomel", "Mogilev", "Vitebsk", "Grodno", "Brest"],
  "Belgium": ["Brussels", "Antwerp", "Ghent", "Charleroi", "Liège", "Bruges", "Namur", "Leuven"],
  "Belize": ["Belize City", "San Ignacio", "Orange Walk", "Belmopan", "Dangriga"],
  "Benin": ["Cotonou", "Porto-Novo", "Parakou", "Djougou", "Bohicon"],
  "Bhutan": ["Thimphu", "Phuntsholing", "Paro", "Punakha", "Wangdue Phodrang"],
  "Bolivia": ["La Paz", "Santa Cruz", "Cochabamba", "Sucre", "Oruro", "Tarija", "Potosí"],
  "Bosnia and Herzegovina": ["Sarajevo", "Banja Luka", "Tuzla", "Zenica", "Mostar"],
  "Botswana": ["Gaborone", "Francistown", "Molepolole", "Maun", "Selebi-Phikwe"],
  "Brazil": ["São Paulo", "Rio de Janeiro", "Brasília", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"],
  "Brunei": ["Bandar Seri Begawan", "Kuala Belait", "Seria", "Tutong", "Bangar"],
  "Bulgaria": ["Sofia", "Plovdiv", "Varna", "Burgas", "Ruse", "Stara Zagora", "Pleven"],
  "Burkina Faso": ["Ouagadougou", "Bobo-Dioulasso", "Koudougou", "Ouahigouya", "Banfora"],
  "Burundi": ["Gitega", "Bujumbura", "Muyinga", "Ruyigi", "Ngozi"],
  "Cabo Verde": ["Praia", "Mindelo", "Santa Maria", "Assomada", "Pedra Badejo"],
  "Cambodia": ["Phnom Penh", "Siem Reap", "Battambang", "Sihanoukville", "Kampong Cham"],
  "Cameroon": ["Yaoundé", "Douala", "Bamenda", "Bafoussam", "Garoua"],
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener"],
  "Central African Republic": ["Bangui", "Bimbo", "Berbérati", "Carnot", "Bambari"],
  "Chad": ["N'Djamena", "Moundou", "Sarh", "Abéché", "Kelo"],
  "Chile": ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Iquique"],
  "China": ["Beijing", "Shanghai", "Guangzhou", "Shenzhen", "Chengdu", "Hangzhou", "Wuhan", "Xi'an", "Chongqing", "Tianjin"],
  "Colombia": ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Bucaramanga", "Pereira"],
  "Comoros": ["Moroni", "Mutsamudu", "Fomboni", "Domoni", "Sima"],
  "Congo": ["Brazzaville", "Pointe-Noire", "Dolisie", "Nkayi", "Owando"],
  "Costa Rica": ["San José", "Limón", "Alajuela", "Heredia", "Cartago", "Puntarenas", "Liberia"],
  "Croatia": ["Zagreb", "Split", "Rijeka", "Osijek", "Zadar", "Slavonski Brod", "Pula"],
  "Cuba": ["Havana", "Santiago de Cuba", "Camagüey", "Holguín", "Santa Clara", "Guantánamo"],
  "Cyprus": ["Nicosia", "Limassol", "Larnaca", "Paphos", "Famagusta"],
  "Czech Republic": ["Prague", "Brno", "Ostrava", "Plzeň", "Liberec", "Olomouc", "České Budějovice"],
  "Democratic Republic of the Congo": ["Kinshasa", "Lubumbashi", "Mbuji-Mayi", "Kananga", "Kisangani", "Bukavu", "Goma"],
  "Denmark": ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding"],
  "Djibouti": ["Djibouti City", "Ali Sabieh", "Tadjoura", "Obock", "Dikhil"],
  "Dominica": ["Roseau", "Portsmouth", "Marigot", "Berekua", "Saint Joseph"],
  "Dominican Republic": ["Santo Domingo", "Santiago", "La Romana", "San Pedro de Macorís", "Puerto Plata"],
  "Ecuador": ["Quito", "Guayaquil", "Cuenca", "Santo Domingo", "Machala", "Manta", "Portoviejo"],
  "Egypt": ["Cairo", "Alexandria", "Giza", "Shubra El-Kheima", "Port Said", "Suez", "Luxor", "Aswan"],
  "El Salvador": ["San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Santa Tecla"],
  "Equatorial Guinea": ["Malabo", "Bata", "Ebebiyin", "Aconibe", "Añisoc"],
  "Eritrea": ["Asmara", "Keren", "Massawa", "Assab", "Mendefera"],
  "Estonia": ["Tallinn", "Tartu", "Narva", "Pärnu", "Kohtla-Järve"],
  "Eswatini": ["Mbabane", "Manzini", "Lobamba", "Big Bend", "Malkerns"],
  "Ethiopia": ["Addis Ababa", "Dire Dawa", "Mekelle", "Gondar", "Bahir Dar", "Hawassa", "Awasa"],
  "Fiji": ["Suva", "Lautoka", "Nadi", "Labasa", "Ba"],
  "Finland": ["Helsinki", "Espoo", "Tampere", "Vantaa", "Oulu", "Turku", "Jyväskylä"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
  "Gabon": ["Libreville", "Port-Gentil", "Franceville", "Oyem", "Moanda"],
  "Gambia": ["Banjul", "Serekunda", "Brikama", "Bakau", "Farafenni"],
  "Georgia": ["Tbilisi", "Batumi", "Kutaisi", "Rustavi", "Gori"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
  "Ghana": ["Accra", "Kumasi", "Tamale", "Takoradi", "Ashaiman", "Cape Coast"],
  "Greece": ["Athens", "Thessaloniki", "Patras", "Heraklion", "Larissa", "Volos", "Rhodes"],
  "Grenada": ["St. George's", "Gouyave", "Grenville", "Victoria", "Sauteurs"],
  "Guatemala": ["Guatemala City", "Mixco", "Villa Nueva", "Quetzaltenango", "Escuintla"],
  "Guinea": ["Conakry", "Nzérékoré", "Kankan", "Kindia", "Labé"],
  "Guinea-Bissau": ["Bissau", "Bafatá", "Gabú", "Bissorã", "Bolama"],
  "Guyana": ["Georgetown", "Linden", "New Amsterdam", "Anna Regina", "Bartica"],
  "Haiti": ["Port-au-Prince", "Cap-Haïtien", "Gonaïves", "Les Cayes", "Port-de-Paix"],
  "Honduras": ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso"],
  "Hungary": ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr"],
  "Iceland": ["Reykjavík", "Kópavogur", "Hafnarfjörður", "Akureyri", "Reykjanesbær"],
  "India": ["Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai", "Kolkata", "Ahmedabad", "Pune", "Jaipur", "Lucknow"],
  "Indonesia": ["Jakarta", "Surabaya", "Bandung", "Medan", "Semarang", "Makassar", "Palembang", "Tangerang"],
  "Iran": ["Tehran", "Mashhad", "Isfahan", "Karaj", "Shiraz", "Tabriz", "Qom", "Ahvaz"],
  "Iraq": ["Baghdad", "Basra", "Mosul", "Erbil", "Sulaymaniyah", "Najaf", "Karbala"],
  "Ireland": ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk"],
  "Israel": ["Jerusalem", "Tel Aviv", "Haifa", "Rishon LeZion", "Petah Tikva", "Ashdod", "Netanya", "Beersheba"],
  "Italy": ["Rome", "Milan", "Naples", "Turin", "Palermo", "Genoa", "Bologna", "Florence", "Venice", "Verona"],
  "Jamaica": ["Kingston", "Spanish Town", "Portmore", "Montego Bay", "May Pen"],
  "Japan": ["Tokyo", "Yokohama", "Osaka", "Nagoya", "Sapporo", "Fukuoka", "Kobe", "Kyoto", "Kawasaki", "Hiroshima"],
  "Jordan": ["Amman", "Zarqa", "Irbid", "Russeifa", "Aqaba"],
  "Kazakhstan": ["Almaty", "Nur-Sultan", "Shymkent", "Karaganda", "Aktobe"],
  "Kenya": ["Nairobi", "Mombasa", "Kisumu", "Nakuru", "Eldoret", "Ruiru"],
  "Kiribati": ["South Tarawa", "Betio", "Bikenibeu", "Teaoraereke"],
  "Kosovo": ["Pristina", "Prizren", "Ferizaj", "Peja", "Gjilan"],
  "Kuwait": ["Kuwait City", "Al Ahmadi", "Hawalli", "As Salimiyah", "Sabah Al-Salem"],
  "Kyrgyzstan": ["Bishkek", "Osh", "Jalal-Abad", "Karakol", "Tokmok"],
  "Laos": ["Vientiane", "Pakse", "Savannakhet", "Luang Prabang", "Thakhek"],
  "Latvia": ["Riga", "Daugavpils", "Liepāja", "Jelgava", "Jūrmala"],
  "Lebanon": ["Beirut", "Tripoli", "Sidon", "Tyre", "Nabatieh"],
  "Lesotho": ["Maseru", "Teyateyaneng", "Mafeteng", "Hlotse", "Mohale's Hoek"],
  "Liberia": ["Monrovia", "Gbarnga", "Kakata", "Bensonville", "Harper"],
  "Libya": ["Tripoli", "Benghazi", "Misrata", "Bayda", "Zawiya"],
  "Liechtenstein": ["Vaduz", "Schaan", "Balzers", "Triesen", "Eschen"],
  "Lithuania": ["Vilnius", "Kaunas", "Klaipėda", "Šiauliai", "Panevėžys"],
  "Luxembourg": ["Luxembourg City", "Esch-sur-Alzette", "Differdange", "Dudelange", "Ettelbruck"],
  "Madagascar": ["Antananarivo", "Toamasina", "Antsirabe", "Fianarantsoa", "Mahajanga"],
  "Malawi": ["Lilongwe", "Blantyre", "Mzuzu", "Zomba", "Karonga"],
  "Malaysia": ["Kuala Lumpur", "George Town", "Ipoh", "Shah Alam", "Petaling Jaya", "Johor Bahru", "Malacca City"],
  "Maldives": ["Malé", "Addu City", "Fuvahmulah", "Kulhudhuffushi", "Thinadhoo"],
  "Mali": ["Bamako", "Sikasso", "Mopti", "Koutiala", "Kayes"],
  "Malta": ["Valletta", "Birkirkara", "Qormi", "Mosta", "Żabbar"],
  "Marshall Islands": ["Majuro", "Ebeye", "Arno", "Jabor", "Wotje"],
  "Mauritania": ["Nouakchott", "Nouadhibou", "Néma", "Kaédi", "Rosso"],
  "Mauritius": ["Port Louis", "Beau Bassin-Rose Hill", "Vacoas-Phoenix", "Curepipe", "Quatre Bornes"],
  "Mexico": ["Mexico City", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Juárez", "Zapopan", "Mérida", "Cancún"],
  "Micronesia": ["Palikir", "Weno", "Kolonia", "Tofol", "Colonia"],
  "Moldova": ["Chișinău", "Tiraspol", "Bălți", "Bender", "Rîbnița"],
  "Monaco": ["Monte Carlo", "La Condamine", "Monaco-Ville", "Fontvieille"],
  "Mongolia": ["Ulaanbaatar", "Erdenet", "Darkhan", "Choibalsan", "Khovd"],
  "Montenegro": ["Podgorica", "Nikšić", "Pljevlja", "Bijelo Polje", "Cetinje"],
  "Morocco": ["Casablanca", "Rabat", "Fès", "Marrakesh", "Tangier", "Agadir", "Meknes"],
  "Mozambique": ["Maputo", "Matola", "Beira", "Nampula", "Chimoio"],
  "Myanmar": ["Naypyidaw", "Yangon", "Mandalay", "Bago", "Mawlamyine"],
  "Namibia": ["Windhoek", "Rundu", "Walvis Bay", "Swakopmund", "Oshakati"],
  "Nauru": ["Yaren", "Denigomodu", "Aiwo", "Anabar", "Anibare"],
  "Nepal": ["Kathmandu", "Pokhara", "Lalitpur", "Bharatpur", "Biratnagar"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen"],
  "New Zealand": ["Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga", "Dunedin", "Palmerston North"],
  "Nicaragua": ["Managua", "León", "Masaya", "Matagalpa", "Chinandega"],
  "Niger": ["Niamey", "Zinder", "Maradi", "Agadez", "Tahoua"],
  "Nigeria": ["Lagos", "Kano", "Ibadan", "Abuja", "Port Harcourt", "Benin City", "Kaduna", "Maiduguri"],
  "North Korea": ["Pyongyang", "Hamhung", "Chongjin", "Nampo", "Wonsan"],
  "North Macedonia": ["Skopje", "Bitola", "Kumanovo", "Prilep", "Tetovo"],
  "Norway": ["Oslo", "Bergen", "Stavanger", "Trondheim", "Drammen", "Fredrikstad", "Kristiansand"],
  "Oman": ["Muscat", "Salalah", "Sohar", "Nizwa", "Sur"],
  "Pakistan": ["Karachi", "Lahore", "Faisalabad", "Rawalpindi", "Multan", "Peshawar", "Quetta", "Islamabad"],
  "Palau": ["Ngerulmud", "Koror", "Melekeok", "Airai", "Kloulklubed"],
  "Palestine": ["Gaza City", "Hebron", "Nablus", "Ramallah", "Khan Yunis"],
  "Panama": ["Panama City", "San Miguelito", "Tocumen", "David", "Colón"],
  "Papua New Guinea": ["Port Moresby", "Lae", "Arawa", "Mount Hagen", "Madang"],
  "Paraguay": ["Asunción", "Ciudad del Este", "San Lorenzo", "Luque", "Capiatá"],
  "Peru": ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Iquitos"],
  "Philippines": ["Manila", "Quezon City", "Davao", "Caloocan", "Cebu City", "Zamboanga", "Antipolo", "Pasig"],
  "Poland": ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz"],
  "Portugal": ["Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Setúbal", "Coimbra"],
  "Qatar": ["Doha", "Al Rayyan", "Umm Salal Muhammad", "Al Wakrah", "Al Khor"],
  "Romania": ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov"],
  "Russia": ["Moscow", "Saint Petersburg", "Novosibirsk", "Yekaterinburg", "Kazan", "Nizhny Novgorod", "Chelyabinsk", "Samara"],
  "Rwanda": ["Kigali", "Butare", "Gitarama", "Ruhengeri", "Gisenyi"],
  "Saint Kitts and Nevis": ["Basseterre", "Charlestown", "Dieppe Bay Town", "Market Shop", "Middle Island"],
  "Saint Lucia": ["Castries", "Vieux Fort", "Micoud", "Soufrière", "Dennery"],
  "Saint Vincent and the Grenadines": ["Kingstown", "Georgetown", "Barrouallie", "Port Elizabeth", "Biabou"],
  "Samoa": ["Apia", "Vaitele", "Faleula", "Siusega", "Malie"],
  "San Marino": ["San Marino", "Serravalle", "Borgo Maggiore", "Domagnano", "Fiorentino"],
  "Sao Tome and Principe": ["São Tomé", "Santo António", "Trindade", "Neves", "Santana"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Khobar", "Tabuk"],
  "Senegal": ["Dakar", "Touba", "Thiès", "Kaolack", "Saint-Louis"],
  "Serbia": ["Belgrade", "Novi Sad", "Niš", "Kragujevac", "Subotica"],
  "Seychelles": ["Victoria", "Anse Boileau", "Beau Vallon", "Cascade", "Takamaka"],
  "Sierra Leone": ["Freetown", "Bo", "Kenema", "Koidu", "Makeni"],
  "Singapore": ["Singapore City", "Jurong", "Woodlands", "Tampines", "Bedok"],
  "Slovakia": ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra"],
  "Slovenia": ["Ljubljana", "Maribor", "Celje", "Kranj", "Velenje"],
  "Solomon Islands": ["Honiara", "Auki", "Gizo", "Buala", "Tulagi"],
  "Somalia": ["Mogadishu", "Hargeisa", "Bosaso", "Kismayo", "Marka"],
  "South Africa": ["Johannesburg", "Cape Town", "Durban", "Pretoria", "Port Elizabeth", "Bloemfontein", "East London", "Polokwane"],
  "South Korea": ["Seoul", "Busan", "Incheon", "Daegu", "Daejeon", "Gwangju", "Suwon", "Ulsan"],
  "South Sudan": ["Juba", "Wau", "Malakal", "Yei", "Yambio"],
  "Spain": ["Madrid", "Barcelona", "Valencia", "Seville", "Zaragoza", "Málaga", "Murcia", "Palma", "Bilbao", "Alicante"],
  "Sri Lanka": ["Colombo", "Dehiwala-Mount Lavinia", "Moratuwa", "Jaffna", "Negombo", "Kandy"],
  "Sudan": ["Khartoum", "Omdurman", "Port Sudan", "Kassala", "Nyala"],
  "Suriname": ["Paramaribo", "Lelydorp", "Brokopondo", "Nieuw Nickerie", "Moengo"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping"],
  "Switzerland": ["Zürich", "Geneva", "Basel", "Lausanne", "Bern", "Winterthur", "Lucerne", "St. Gallen"],
  "Syria": ["Damascus", "Aleppo", "Homs", "Latakia", "Hama"],
  "Taiwan": ["Taipei", "Kaohsiung", "Taichung", "Tainan", "Hsinchu", "Taoyuan"],
  "Tajikistan": ["Dushanbe", "Khujand", "Kulob", "Qurghonteppa", "Istaravshan"],
  "Tanzania": ["Dar es Salaam", "Mwanza", "Arusha", "Dodoma", "Mbeya"],
  "Thailand": ["Bangkok", "Nonthaburi", "Pak Kret", "Hat Yai", "Chiang Mai", "Phuket", "Pattaya"],
  "Timor-Leste": ["Dili", "Baucau", "Maliana", "Suai", "Lospalos"],
  "Togo": ["Lomé", "Sokodé", "Kara", "Kpalimé", "Atakpamé"],
  "Tonga": ["Nuku'alofa", "Neiafu", "Haveluloto", "Vaini", "Pangai"],
  "Trinidad and Tobago": ["Port of Spain", "San Fernando", "Chaguanas", "Arima", "Point Fortin"],
  "Tunisia": ["Tunis", "Sfax", "Sousse", "Kairouan", "Bizerte"],
  "Turkey": ["Istanbul", "Ankara", "Izmir", "Bursa", "Adana", "Gaziantep", "Konya", "Antalya"],
  "Turkmenistan": ["Ashgabat", "Türkmenabat", "Daşoguz", "Mary", "Balkanabat"],
  "Tuvalu": ["Funafuti", "Vaiaku", "Alapi", "Asau", "Lolua"],
  "Uganda": ["Kampala", "Gulu", "Lira", "Mbarara", "Jinja"],
  "Ukraine": ["Kyiv", "Kharkiv", "Odesa", "Dnipro", "Donetsk", "Lviv", "Zaporizhzhia"],
  "United Arab Emirates": ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah"],
  "United Kingdom": ["London", "Birmingham", "Leeds", "Glasgow", "Sheffield", "Manchester", "Edinburgh", "Liverpool", "Bristol", "Cardiff"],
  "United States": ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix", "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose"],
  "Uruguay": ["Montevideo", "Salto", "Ciudad de la Costa", "Paysandú", "Las Piedras"],
  "Uzbekistan": ["Tashkent", "Samarkand", "Namangan", "Andijan", "Bukhara"],
  "Vanuatu": ["Port Vila", "Luganville", "Norsup", "Isangel", "Sola"],
  "Vatican City": ["Vatican City"],
  "Venezuela": ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Maracay", "Ciudad Guayana"],
  "Vietnam": ["Ho Chi Minh City", "Hanoi", "Da Nang", "Bien Hoa", "Nha Trang", "Can Tho", "Hai Phong"],
  "Yemen": ["Sana'a", "Aden", "Taiz", "Hodeidah", "Ibb"],
  "Zambia": ["Lusaka", "Kitwe", "Ndola", "Kabwe", "Chingola"],
  "Zimbabwe": ["Harare", "Bulawayo", "Chitungwiza", "Mutare", "Gweru"]
};

// Country metadata: ZIP format and subdivision labels
const COUNTRY_METADATA: Record<string, { zipFormat: string; zipExample: string; hasProvince: boolean; provinceLabel: string; hasDistrict: boolean; districtLabel: string }> = {
  "Netherlands": { zipFormat: "#### AA", zipExample: "1012 AB", hasProvince: true, provinceLabel: "Province", hasDistrict: false, districtLabel: "" },
  "United States": { zipFormat: "#####", zipExample: "10001", hasProvince: true, provinceLabel: "State", hasDistrict: false, districtLabel: "" },
  "United Kingdom": { zipFormat: "AA# #AA", zipExample: "SW1A 1AA", hasProvince: true, provinceLabel: "County", hasDistrict: false, districtLabel: "" },
  "Canada": { zipFormat: "A#A #A#", zipExample: "K1A 0B1", hasProvince: true, provinceLabel: "Province", hasDistrict: false, districtLabel: "" },
  "Germany": { zipFormat: "#####", zipExample: "10115", hasProvince: true, provinceLabel: "State", hasDistrict: false, districtLabel: "" },
  "France": { zipFormat: "#####", zipExample: "75001", hasProvince: true, provinceLabel: "Region", hasDistrict: false, districtLabel: "" },
  "Australia": { zipFormat: "####", zipExample: "2000", hasProvince: true, provinceLabel: "State", hasDistrict: false, districtLabel: "" },
  "India": { zipFormat: "######", zipExample: "110001", hasProvince: true, provinceLabel: "State", hasDistrict: true, districtLabel: "District" },
  "China": { zipFormat: "######", zipExample: "100000", hasProvince: true, provinceLabel: "Province", hasDistrict: true, districtLabel: "District" },
  "Japan": { zipFormat: "###-####", zipExample: "100-0001", hasProvince: true, provinceLabel: "Prefecture", hasDistrict: false, districtLabel: "" },
  "Brazil": { zipFormat: "#####-###", zipExample: "01310-100", hasProvince: true, provinceLabel: "State", hasDistrict: false, districtLabel: "" },
  "Mexico": { zipFormat: "#####", zipExample: "01000", hasProvince: true, provinceLabel: "State", hasDistrict: false, districtLabel: "" },
  "Spain": { zipFormat: "#####", zipExample: "28001", hasProvince: true, provinceLabel: "Province", hasDistrict: false, districtLabel: "" },
  "Italy": { zipFormat: "#####", zipExample: "00100", hasProvince: true, provinceLabel: "Region", hasDistrict: false, districtLabel: "" },
  "South Korea": { zipFormat: "#####", zipExample: "03000", hasProvince: true, provinceLabel: "Province", hasDistrict: true, districtLabel: "District" },
  "Indonesia": { zipFormat: "#####", zipExample: "10110", hasProvince: true, provinceLabel: "Province", hasDistrict: true, districtLabel: "District" },
  "Philippines": { zipFormat: "####", zipExample: "1000", hasProvince: true, provinceLabel: "Province", hasDistrict: false, districtLabel: "" },
  "Singapore": { zipFormat: "######", zipExample: "018956", hasProvince: false, provinceLabel: "", hasDistrict: true, districtLabel: "District" },
};

// Province/State data by country
const COUNTRY_PROVINCES: Record<string, string[]> = {
  "Netherlands": ["North Holland", "South Holland", "Utrecht", "Gelderland", "North Brabant", "Limburg", "Groningen", "Friesland", "Drenthe", "Overijssel", "Flevoland", "Zeeland"],
  "United States": ["Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"],
  "Germany": ["Baden-Württemberg", "Bavaria", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hesse", "Lower Saxony", "Mecklenburg-Vorpommern", "North Rhine-Westphalia", "Rhineland-Palatinate", "Saarland", "Saxony", "Saxony-Anhalt", "Schleswig-Holstein", "Thuringia"],
  "France": ["Île-de-France", "Provence-Alpes-Côte d'Azur", "Auvergne-Rhône-Alpes", "Nouvelle-Aquitaine", "Occitanie", "Hauts-de-France", "Brittany", "Normandy", "Grand Est", "Pays de la Loire", "Burgundy-Franche-Comté", "Centre-Val de Loire", "Corsica"],
  "Australia": ["New South Wales", "Victoria", "Queensland", "Western Australia", "South Australia", "Tasmania", "Australian Capital Territory", "Northern Territory"],
  "India": ["Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir", "Ladakh"],
  "China": ["Anhui", "Fujian", "Gansu", "Guangdong", "Guizhou", "Hainan", "Hebei", "Heilongjiang", "Henan", "Hubei", "Hunan", "Jiangsu", "Jiangxi", "Jilin", "Liaoning", "Qinghai", "Shaanxi", "Shandong", "Shanxi", "Sichuan", "Yunnan", "Zhejiang", "Beijing", "Shanghai", "Tianjin", "Chongqing"],
  "Japan": ["Hokkaido", "Aomori", "Iwate", "Miyagi", "Akita", "Yamagata", "Fukushima", "Ibaraki", "Tochigi", "Gunma", "Saitama", "Chiba", "Tokyo", "Kanagawa", "Niigata", "Toyama", "Ishikawa", "Fukui", "Yamanashi", "Nagano", "Gifu", "Shizuoka", "Aichi", "Mie", "Shiga", "Kyoto", "Osaka", "Hyogo", "Nara", "Wakayama", "Tottori", "Shimane", "Okayama", "Hiroshima", "Yamaguchi", "Tokushima", "Kagawa", "Ehime", "Kochi", "Fukuoka", "Saga", "Nagasaki", "Kumamoto", "Oita", "Miyazaki", "Kagoshima", "Okinawa"],
  "Brazil": ["Acre", "Alagoas", "Amapá", "Amazonas", "Bahia", "Ceará", "Distrito Federal", "Espírito Santo", "Goiás", "Maranhão", "Mato Grosso", "Mato Grosso do Sul", "Minas Gerais", "Pará", "Paraíba", "Paraná", "Pernambuco", "Piauí", "Rio de Janeiro", "Rio Grande do Norte", "Rio Grande do Sul", "Rondônia", "Roraima", "Santa Catarina", "São Paulo", "Sergipe", "Tocantins"],
  "Mexico": ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Coahuila", "Colima", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "México", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas", "Mexico City"],
  "Spain": ["Andalusia", "Aragon", "Asturias", "Balearic Islands", "Basque Country", "Canary Islands", "Cantabria", "Castile and León", "Castile-La Mancha", "Catalonia", "Extremadura", "Galicia", "La Rioja", "Community of Madrid", "Region of Murcia", "Navarre", "Valencia"],
  "Italy": ["Abruzzo", "Aosta Valley", "Apulia", "Basilicata", "Calabria", "Campania", "Emilia-Romagna", "Friuli-Venezia Giulia", "Lazio", "Liguria", "Lombardy", "Marche", "Molise", "Piedmont", "Sardinia", "Sicily", "Trentino-Alto Adige", "Tuscany", "Umbria", "Veneto"],
  "South Korea": ["Seoul", "Busan", "Daegu", "Incheon", "Gwangju", "Daejeon", "Ulsan", "Sejong", "Gyeonggi", "Gangwon", "North Chungcheong", "South Chungcheong", "North Jeolla", "South Jeolla", "North Gyeongsang", "South Gyeongsang", "Jeju"],
  "Indonesia": ["Aceh", "North Sumatra", "West Sumatra", "Riau", "Jambi", "South Sumatra", "Bengkulu", "Lampung", "Bangka Belitung", "Riau Islands", "Jakarta", "West Java", "Central Java", "East Java", "Banten", "Yogyakarta", "Bali", "West Nusa Tenggara", "East Nusa Tenggara", "West Kalimantan", "Central Kalimantan", "South Kalimantan", "East Kalimantan", "North Kalimantan", "North Sulawesi", "Central Sulawesi", "South Sulawesi", "Southeast Sulawesi", "Gorontalo", "West Sulawesi", "Maluku", "North Maluku", "Papua", "West Papua"],
  "Philippines": ["Abra", "Agusan del Norte", "Agusan del Sur", "Aklan", "Albay", "Antique", "Apayao", "Aurora", "Basilan", "Bataan", "Batanes", "Batangas", "Benguet", "Biliran", "Bohol", "Bukidnon", "Bulacan", "Cagayan", "Camarines Norte", "Camarines Sur", "Camiguin", "Capiz", "Catanduanes", "Cavite", "Cebu", "Cotabato", "Davao de Oro", "Davao del Norte", "Davao del Sur", "Davao Occidental", "Davao Oriental", "Dinagat Islands", "Eastern Samar", "Guimaras", "Ifugao", "Ilocos Norte", "Ilocos Sur", "Iloilo", "Isabela", "Kalinga", "La Union", "Laguna", "Lanao del Norte", "Lanao del Sur", "Leyte", "Maguindanao", "Marinduque", "Masbate", "Metro Manila", "Misamis Occidental", "Misamis Oriental", "Mountain Province", "Negros Occidental", "Negros Oriental", "Northern Samar", "Nueva Ecija", "Nueva Vizcaya", "Occidental Mindoro", "Oriental Mindoro", "Palawan", "Pampanga", "Pangasinan", "Quezon", "Quirino", "Rizal", "Romblon", "Samar", "Sarangani", "Siquijor", "Sorsogon", "South Cotabato", "Southern Leyte", "Sultan Kudarat", "Sulu", "Surigao del Norte", "Surigao del Sur", "Tarlac", "Tawi-Tawi", "Zambales", "Zamboanga del Norte", "Zamboanga del Sur", "Zamboanga Sibugay"],
};

// Province/State to Cities mapping (for countries with provinces)
const PROVINCE_CITIES: Record<string, Record<string, string[]>> = {
  "Netherlands": {
    "North Holland": ["Amsterdam", "Haarlem", "Zaanstad", "Haarlemmermeer", "Alkmaar"],
    "South Holland": ["Rotterdam", "The Hague", "Leiden", "Zoetermeer", "Dordrecht"],
    "Utrecht": ["Utrecht", "Amersfoort", "Nieuwegein", "Veenendaal", "Zeist"],
    "Gelderland": ["Nijmegen", "Arnhem", "Apeldoorn", "Ede", "Zutphen"],
    "North Brabant": ["Eindhoven", "Tilburg", "Breda", "'s-Hertogenbosch", "Helmond"],
    "Limburg": ["Maastricht", "Heerlen", "Sittard-Geleen", "Venlo", "Roermond"],
  },
  "United States": {
    "California": ["Los Angeles", "San Diego", "San Jose", "San Francisco", "Fresno", "Sacramento", "Long Beach", "Oakland"],
    "New York": ["New York", "Buffalo", "Rochester", "Yonkers", "Syracuse", "Albany"],
    "Texas": ["Houston", "San Antonio", "Dallas", "Austin", "Fort Worth", "El Paso", "Arlington"],
    "Florida": ["Jacksonville", "Miami", "Tampa", "Orlando", "St. Petersburg", "Tallahassee"],
    "Illinois": ["Chicago", "Aurora", "Naperville", "Joliet", "Rockford", "Springfield"],
    "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading"],
    "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Toledo", "Akron"],
    "Georgia": ["Atlanta", "Augusta", "Columbus", "Savannah", "Athens"],
    "Michigan": ["Detroit", "Grand Rapids", "Warren", "Sterling Heights", "Lansing"],
    "Arizona": ["Phoenix", "Tucson", "Mesa", "Chandler", "Scottsdale"],
  },
  "Canada": {
    "Ontario": ["Toronto", "Ottawa", "Mississauga", "Brampton", "Hamilton", "London"],
    "Quebec": ["Montreal", "Quebec City", "Laval", "Gatineau", "Longueuil"],
    "British Columbia": ["Vancouver", "Surrey", "Burnaby", "Richmond", "Kelowna"],
    "Alberta": ["Calgary", "Edmonton", "Red Deer", "Lethbridge", "Medicine Hat"],
  },
  "Germany": {
    "Bavaria": ["Munich", "Nuremberg", "Augsburg", "Regensburg", "Ingolstadt"],
    "North Rhine-Westphalia": ["Cologne", "Düsseldorf", "Dortmund", "Essen", "Duisburg"],
    "Baden-Württemberg": ["Stuttgart", "Mannheim", "Karlsruhe", "Freiburg", "Heidelberg"],
    "Berlin": ["Berlin"],
    "Hesse": ["Frankfurt", "Wiesbaden", "Kassel", "Darmstadt", "Offenbach"],
  },
  "Australia": {
    "New South Wales": ["Sydney", "Newcastle", "Wollongong", "Maitland", "Wagga Wagga"],
    "Victoria": ["Melbourne", "Geelong", "Ballarat", "Bendigo", "Shepparton"],
    "Queensland": ["Brisbane", "Gold Coast", "Sunshine Coast", "Townsville", "Cairns"],
    "Western Australia": ["Perth", "Bunbury", "Geraldton", "Albany", "Kalgoorlie"],
  },
  "Brazil": {
    "São Paulo": ["São Paulo", "Campinas", "Santos", "São José dos Campos", "Ribeirão Preto"],
    "Rio de Janeiro": ["Rio de Janeiro", "Niterói", "Duque de Caxias", "Nova Iguaçu", "Petrópolis"],
    "Minas Gerais": ["Belo Horizonte", "Uberlândia", "Contagem", "Juiz de Fora", "Betim"],
    "Bahia": ["Salvador", "Feira de Santana", "Vitória da Conquista", "Camaçari", "Itabuna"],
    "Paraná": ["Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel"],
    "Rio Grande do Sul": ["Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria"],
    "Pernambuco": ["Recife", "Jaboatão dos Guararapes", "Olinda", "Caruaru", "Petrolina"],
    "Ceará": ["Fortaleza", "Caucaia", "Juazeiro do Norte", "Maracanaú", "Sobral"],
    "Santa Catarina": ["Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó"],
  },
  "Mexico": {
    "Mexico City": ["Mexico City"],
    "Jalisco": ["Guadalajara", "Zapopan", "Tlaquepaque", "Tonalá", "Puerto Vallarta"],
    "Nuevo León": ["Monterrey", "Guadalupe", "San Nicolás de los Garza", "Apodaca", "Santa Catarina"],
    "Puebla": ["Puebla", "Tehuacán", "San Martín Texmelucan", "Atlixco", "Cholula"],
    "Guanajuato": ["León", "Irapuato", "Celaya", "Salamanca", "Guanajuato"],
    "Chiapas": ["Tuxtla Gutiérrez", "Tapachula", "San Cristóbal de las Casas", "Comitán", "Palenque"],
    "Veracruz": ["Veracruz", "Xalapa", "Coatzacoalcos", "Córdoba", "Poza Rica"],
    "Chihuahua": ["Chihuahua", "Ciudad Juárez", "Cuauhtémoc", "Delicias", "Parral"],
    "Baja California": ["Tijuana", "Mexicali", "Ensenada", "Rosarito", "Tecate"],
  },
  "Spain": {
    "Madrid": ["Madrid", "Móstoles", "Alcalá de Henares", "Fuenlabrada", "Leganés"],
    "Catalonia": ["Barcelona", "Hospitalet de Llobregat", "Badalona", "Terrassa", "Sabadell"],
    "Andalusia": ["Seville", "Málaga", "Córdoba", "Granada", "Jerez de la Frontera"],
    "Valencian Community": ["Valencia", "Alicante", "Elche", "Castellón", "Torrevieja"],
    "Galicia": ["Vigo", "A Coruña", "Ourense", "Lugo", "Santiago de Compostela"],
    "Basque Country": ["Bilbao", "Vitoria-Gasteiz", "San Sebastián", "Barakaldo", "Getxo"],
    "Castile and León": ["Valladolid", "Burgos", "Salamanca", "León", "Zamora"],
    "Aragon": ["Zaragoza", "Huesca", "Teruel"],
  },
  "Italy": {
    "Lazio": ["Rome", "Latina", "Guidonia Montecelio", "Fiumicino", "Aprilia"],
    "Lombardy": ["Milan", "Brescia", "Monza", "Bergamo", "Como"],
    "Campania": ["Naples", "Salerno", "Giugliano in Campania", "Torre del Greco", "Caserta"],
    "Sicily": ["Palermo", "Catania", "Messina", "Syracuse", "Marsala"],
    "Veneto": ["Venice", "Verona", "Padua", "Vicenza", "Treviso"],
    "Piedmont": ["Turin", "Novara", "Alessandria", "Asti", "Cuneo"],
    "Emilia-Romagna": ["Bologna", "Modena", "Parma", "Reggio Emilia", "Ravenna"],
    "Tuscany": ["Florence", "Prato", "Livorno", "Pisa", "Arezzo"],
  },
  "Japan": {
    "Tokyo": ["Tokyo"],
    "Osaka": ["Osaka", "Sakai", "Higashiosaka", "Toyonaka", "Takatsuki"],
    "Kanagawa": ["Yokohama", "Kawasaki", "Sagamihara", "Fujisawa", "Yokosuka"],
    "Aichi": ["Nagoya", "Toyota", "Okazaki", "Ichinomiya", "Kasugai"],
    "Hokkaido": ["Sapporo", "Asahikawa", "Hakodate", "Kushiro", "Obihiro"],
    "Fukuoka": ["Fukuoka", "Kitakyushu", "Kurume", "Omuta", "Iizuka"],
    "Hyogo": ["Kobe", "Himeji", "Nishinomiya", "Amagasaki", "Akashi"],
    "Saitama": ["Saitama", "Kawaguchi", "Kawagoe", "Tokorozawa", "Koshigaya"],
    "Chiba": ["Chiba", "Funabashi", "Matsudo", "Ichikawa", "Kashiwa"],
  },
  "India": {
    "Maharashtra": ["Mumbai", "Pune", "Nagpur", "Thane", "Nashik"],
    "Karnataka": ["Bangalore", "Mysore", "Hubli", "Mangalore", "Belgaum"],
    "Tamil Nadu": ["Chennai", "Coimbatore", "Madurai", "Tiruchirappalli", "Salem"],
    "Delhi": ["New Delhi", "Delhi"],
    "West Bengal": ["Kolkata", "Howrah", "Durgapur", "Asansol", "Siliguri"],
    "Gujarat": ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar"],
    "Uttar Pradesh": ["Lucknow", "Kanpur", "Ghaziabad", "Agra", "Varanasi"],
    "Telangana": ["Hyderabad", "Warangal", "Nizamabad", "Khammam", "Karimnagar"],
    "Rajasthan": ["Jaipur", "Jodhpur", "Kota", "Udaipur", "Ajmer"],
    "Kerala": ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Kollam"],
  },
  "China": {
    "Beijing": ["Beijing"],
    "Shanghai": ["Shanghai"],
    "Guangdong": ["Guangzhou", "Shenzhen", "Dongguan", "Foshan", "Zhuhai"],
    "Shandong": ["Jinan", "Qingdao", "Yantai", "Weifang", "Zibo"],
    "Jiangsu": ["Nanjing", "Suzhou", "Wuxi", "Changzhou", "Nantong"],
    "Zhejiang": ["Hangzhou", "Ningbo", "Wenzhou", "Taizhou", "Jinhua"],
    "Sichuan": ["Chengdu", "Mianyang", "Deyang", "Nanchong", "Yibin"],
    "Henan": ["Zhengzhou", "Luoyang", "Kaifeng", "Anyang", "Xinxiang"],
    "Hubei": ["Wuhan", "Yichang", "Xiangyang", "Jingzhou", "Huangshi"],
    "Liaoning": ["Shenyang", "Dalian", "Anshan", "Fushun", "Dandong"],
  },
  "United Kingdom": {
    "England": ["London", "Birmingham", "Manchester", "Leeds", "Liverpool"],
    "Scotland": ["Glasgow", "Edinburgh", "Aberdeen", "Dundee", "Inverness"],
    "Wales": ["Cardiff", "Swansea", "Newport", "Wrexham", "Barry"],
    "Northern Ireland": ["Belfast", "Derry", "Lisburn", "Newry", "Armagh"],
  },
  "South Korea": {
    "Seoul": ["Seoul"],
    "Busan": ["Busan"],
    "Gyeonggi": ["Suwon", "Goyang", "Seongnam", "Yongin", "Bucheon"],
    "Incheon": ["Incheon"],
    "Daegu": ["Daegu"],
    "Daejeon": ["Daejeon"],
    "Gwangju": ["Gwangju"],
    "Ulsan": ["Ulsan"],
    "Gangwon": ["Chuncheon", "Wonju", "Gangneung", "Donghae", "Taebaek"],
  },
  "Indonesia": {
    "Jakarta": ["Jakarta"],
    "West Java": ["Bandung", "Bekasi", "Depok", "Bogor", "Cirebon"],
    "East Java": ["Surabaya", "Malang", "Kediri", "Probolinggo", "Madiun"],
    "Central Java": ["Semarang", "Solo", "Tegal", "Pekalongan", "Purwokerto"],
    "Banten": ["Tangerang", "South Tangerang", "Serang", "Cilegon", "Tangerang City"],
    "North Sumatra": ["Medan", "Pematangsiantar", "Binjai", "Tebing Tinggi", "Tanjungbalai"],
    "Bali": ["Denpasar", "Singaraja", "Tabanan", "Gianyar", "Negara"],
    "South Sulawesi": ["Makassar", "Parepare", "Palopo"],
  },
  "Philippines": {
    "Metro Manila": ["Manila", "Quezon City", "Caloocan", "Makati", "Pasig"],
    "Cebu": ["Cebu City", "Mandaue", "Lapu-Lapu", "Talisay", "Toledo"],
    "Davao del Sur": ["Davao City", "Digos", "Bansalan", "Hagonoy", "Magsaysay"],
    "Cavite": ["Bacoor", "Dasmariñas", "Imus", "Cavite City", "Tagaytay"],
    "Laguna": ["Calamba", "San Pablo", "Biñan", "Santa Rosa", "Cabuyao"],
    "Bulacan": ["Malolos", "Meycauayan", "San Jose del Monte", "Marilao", "Baliuag"],
    "Rizal": ["Antipolo", "Cainta", "Taytay", "Binangonan", "San Mateo"],
    "Pampanga": ["San Fernando", "Angeles", "Mabalacat", "Porac", "Magalang"],
  },
  "France": {
    "Île-de-France": ["Paris", "Boulogne-Billancourt", "Saint-Denis", "Argenteuil", "Montreuil"],
    "Auvergne-Rhône-Alpes": ["Lyon", "Grenoble", "Villeurbanne", "Saint-Étienne", "Clermont-Ferrand"],
    "Provence-Alpes-Côte d'Azur": ["Marseille", "Nice", "Toulon", "Aix-en-Provence", "Cannes"],
    "Occitanie": ["Toulouse", "Montpellier", "Nîmes", "Perpignan", "Béziers"],
    "Nouvelle-Aquitaine": ["Bordeaux", "Limoges", "Poitiers", "Pau", "La Rochelle"],
    "Hauts-de-France": ["Lille", "Amiens", "Roubaix", "Tourcoing", "Dunkirk"],
    "Grand Est": ["Strasbourg", "Reims", "Metz", "Mulhouse", "Nancy"],
    "Brittany": ["Rennes", "Brest", "Quimper", "Lorient", "Saint-Malo"],
  },
  "Switzerland": {
    "Zurich": ["Zurich", "Winterthur", "Uster", "Dübendorf"],
    "Bern": ["Bern", "Biel/Bienne", "Thun", "Köniz"],
    "Vaud": ["Lausanne", "Yverdon-les-Bains", "Montreux", "Renens"],
    "Geneva": ["Geneva", "Vernier", "Lancy", "Meyrin"],
    "Aargau": ["Aarau", "Baden", "Wettingen", "Wohlen"],
    "Basel-Stadt": ["Basel"],
    "Basel-Landschaft": ["Allschwil", "Reinach", "Muttenz", "Liestal"],
    "St. Gallen": ["St. Gallen", "Rapperswil-Jona", "Wil", "Gossau"],
    "Ticino": ["Lugano", "Bellinzona", "Locarno", "Mendrisio"],
  },
  "Belgium": {
    "Flanders": ["Antwerp", "Ghent", "Bruges", "Leuven", "Mechelen"],
    "Wallonia": ["Charleroi", "Liège", "Namur", "Mons", "La Louvière"],
    "Brussels": ["Brussels"],
  },
};

// District data by country and city (selective implementation for major cities)
const CITY_DISTRICTS: Record<string, Record<string, string[]>> = {
  "Netherlands": {
    "Amsterdam": ["Centrum", "Noord", "Oost", "Zuid", "West", "Nieuw-West", "Zuidoost"],
    "Rotterdam": ["Centrum", "Delfshaven", "Overschie", "Noord", "Hillegersberg-Schiebroek", "Kralingen-Crooswijk", "Feijenoord", "IJsselmonde", "Pernis", "Prins Alexander", "Charlois", "Hoogvliet", "Hoek van Holland"],
    "The Hague": ["Centrum", "Escamp", "Haagse Hout", "Laak", "Leidschenveen-Ypenburg", "Loosduinen", "Scheveningen", "Segbroek"],
    "Utrecht": ["Binnenstad", "Noordoost", "Noordwest", "Oost", "West", "Zuid", "Zuidwest", "Vleuten-De Meern", "Leidsche Rijn"],
  },
  "United States": {
    "New York": ["Manhattan", "Brooklyn", "Queens", "The Bronx", "Staten Island"],
    "Los Angeles": ["Downtown", "Hollywood", "Westside", "San Fernando Valley", "South LA", "Harbor", "Eastside"],
    "Chicago": ["North Side", "West Side", "South Side", "Far North Side", "Northwest Side", "Southwest Side", "Far Southwest Side", "Far Southeast Side"],
  },
  "United Kingdom": {
    "London": ["City of London", "Westminster", "Kensington and Chelsea", "Hammersmith and Fulham", "Wandsworth", "Lambeth", "Southwark", "Tower Hamlets", "Hackney", "Islington", "Camden", "Brent", "Ealing", "Hounslow", "Richmond", "Kingston", "Merton", "Sutton", "Croydon", "Bromley", "Lewisham", "Greenwich", "Bexley", "Havering", "Barking and Dagenham", "Redbridge", "Newham", "Waltham Forest", "Haringey", "Enfield", "Barnet", "Harrow", "Hillingdon"],
  },
  "India": {
    "Mumbai": ["Mumbai City", "Mumbai Suburban"],
    "Delhi": ["Central Delhi", "North Delhi", "South Delhi", "East Delhi", "West Delhi", "North East Delhi", "North West Delhi", "South East Delhi", "South West Delhi", "Shahdara", "New Delhi"],
    "Bangalore": ["Bangalore Urban", "Bangalore Rural"],
  },
  "China": {
    "Beijing": ["Dongcheng", "Xicheng", "Chaoyang", "Fengtai", "Shijingshan", "Haidian", "Mentougou", "Fangshan", "Tongzhou", "Shunyi", "Changping", "Daxing", "Huairou", "Pinggu", "Miyun", "Yanqing"],
    "Shanghai": ["Huangpu", "Xuhui", "Changning", "Jing'an", "Putuo", "Hongkou", "Yangpu", "Minhang", "Baoshan", "Jiading", "Pudong", "Jinshan", "Songjiang", "Qingpu", "Fengxian", "Chongming"],
  },
  "Singapore": {
    "Singapore City": ["District 1 (CBD)", "District 2 (Chinatown)", "District 3 (Alexandra)", "District 4 (Sentosa)", "District 5 (Buona Vista)", "District 9 (Orchard)", "District 10 (Tanglin)", "District 11 (Newton)", "District 15 (East Coast)", "District 19 (Serangoon)", "District 23 (Bukit Timah)"],
  },
};

// Messages Button with Unread Badge
function MessagesButtonWithBadge({ activeTab, onClick }: { activeTab: string; onClick: () => void }) {
  const { data: unreadData } = useQuery({
    queryKey: ['unread-messages-count'],
    queryFn: async () => {
      const response = await crmAPI.getMyMessages({ status_filter: 'unread' });
      return response.data;
    },
    refetchInterval: 15000, // Poll every 15 seconds
  });

  const unreadCount = unreadData?.items?.length || 0;

  return (
    <button
      onClick={onClick}
      className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
        activeTab === 'messages'
          ? 'bg-primary-500 text-white shadow-lg'
          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
      }`}
    >
      <FiMessageSquare className="w-5 h-5" />
      <span>Messages</span>
      {unreadCount > 0 && (
        <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse" />
      )}
    </button>
  );
}

// Messages Content Component
function MessagesContent() {
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [replyContent, setReplyContent] = useState('');
  const [showReply, setShowReply] = useState(false);
  const [previousUnreadCount, setPreviousUnreadCount] = useState(0);
  const queryClient = useQueryClient();

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['my-messages', statusFilter],
    queryFn: async () => {
      const response = await crmAPI.getMyMessages({
        status_filter: statusFilter || undefined,
      });
      return response.data;
    },
    refetchInterval: 30000, // Poll every 30 seconds for new messages
  });

  // Track unread messages and show notifications
  useEffect(() => {
    if (messagesData?.items) {
      const unreadMessages = messagesData.items.filter((m: any) => m.status === 'unread');
      const currentUnreadCount = unreadMessages.length;
      
      // Only show notification if unread count increased (not on initial load)
      if (currentUnreadCount > previousUnreadCount && previousUnreadCount > 0) {
        const latestUnread = unreadMessages[0];
        toast.success(`New message: ${latestUnread.subject}`, {
          duration: 4000,
        });
      }
      
      setPreviousUnreadCount(currentUnreadCount);
    }
  }, [messagesData]);

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => 
      crmAPI.updateMessageStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
    },
  });

  const replyMutation = useMutation({
    mutationFn: async (data: { message_id: number; content: string }) => {
      // Using the sendMessage API with a reference to the original message
      const response = await crmAPI.sendMessage({
        recipient_email: selectedMessage.sender_email,
        subject: `Re: ${selectedMessage.subject}`,
        content: data.content,
        priority: 'medium',
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success('Reply sent successfully!');
      setReplyContent('');
      setShowReply(false);
      setSelectedMessage(null);
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
    },
    onError: () => {
      toast.error('Failed to send reply');
    },
  });

  const messages = messagesData?.items || [];

  const priorityStyles: Record<string, string> = {
    low: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
    medium: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    high: 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
    urgent: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  };

  // Helper function to strip HTML tags and get plain text preview
  const getPlainTextPreview = (html: string, maxLength: number = 150): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    const text = tmp.textContent || tmp.innerText || '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  // If a message is selected, show detail view
  if (selectedMessage) {
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <button
          onClick={() => setSelectedMessage(null)}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="text-sm">Back to Messages</span>
        </button>

        {/* Message Header Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-start justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {selectedMessage.subject}
            </h1>
            {selectedMessage.status !== 'archived' && (
              <button
                onClick={() => {
                  updateStatusMutation.mutate(
                    { id: selectedMessage.id, status: 'archived' },
                    { onSuccess: () => setSelectedMessage(null) }
                  );
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-all text-sm font-medium"
              >
                Archive
              </button>
            )}
          </div>
          
          <div className="flex items-center gap-3 flex-wrap text-sm">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize ${priorityStyles[selectedMessage.priority]}`}>
              {selectedMessage.priority}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              From: <strong className="text-gray-900 dark:text-gray-100">{selectedMessage.sender_name}</strong> ({selectedMessage.sender_email})
            </span>
            <span className="text-gray-500 dark:text-gray-500">
              {new Date(selectedMessage.created_at).toLocaleString('en-US', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: false
              }).replace(',', '')}
            </span>
          </div>
        </div>

        {/* Message Content */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div 
            className="prose dark:prose-invert max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-a:text-blue-500 prose-a:underline prose-strong:font-bold prose-em:italic prose-ul:list-disc prose-ol:list-decimal prose-li:my-1" 
            dangerouslySetInnerHTML={{ __html: selectedMessage.content }} 
          />
        </div>
        
        {/* Reply Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Reply</h2>
            {!showReply && (
              <button
                onClick={() => setShowReply(true)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all text-sm font-medium"
              >
                Show Reply Form
              </button>
            )}
            {showReply && (
              <button
                onClick={() => setShowReply(false)}
                className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all text-sm font-medium"
              >
                Hide Reply Form
              </button>
            )}
          </div>
          
          {showReply && (
            <div className="space-y-4">
              <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
                <RichTextEditor
                  value={replyContent}
                  onChange={setReplyContent}
                  placeholder="Type your reply... Use the toolbar above to format your text."
                  minHeight="200px"
                  compact={false}
                />
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (replyContent.trim()) {
                      replyMutation.mutate({
                        message_id: selectedMessage.id,
                        content: replyContent,
                      });
                    }
                  }}
                  disabled={!replyContent.trim() || replyMutation.isLoading}
                  className="px-5 py-2.5 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  {replyMutation.isLoading ? 'Sending...' : 'Send Reply'}
                </button>
                <button
                  onClick={() => {
                    setShowReply(false);
                    setReplyContent('');
                  }}
                  className="px-5 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-all text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Otherwise, show messages list
  return (
    <div className="space-y-4">
      <style>{`
        .message-preview strong {
          font-weight: 600;
          color: inherit;
        }
        .message-preview em {
          font-style: italic;
        }
        .message-preview u {
          text-decoration: underline;
        }
        .message-preview p {
          display: inline;
          margin: 0;
        }
        .message-preview br {
          display: none;
        }
        .message-preview h1, .message-preview h2, .message-preview h3 {
          display: inline;
          font-size: inherit;
          font-weight: 600;
          margin: 0;
        }
        .message-preview ul, .message-preview ol {
          display: inline;
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .message-preview li {
          display: inline;
        }
        .message-preview li:not(:last-child):after {
          content: ", ";
        }
        .message-preview a {
          color: inherit;
          text-decoration: underline;
        }
      `}</style>
      {/* Filters */}
      <div className="flex items-center gap-2">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-primary-500 focus:border-transparent"
        >
          <option value="">All Messages</option>
          <option value="unread">Unread</option>
          <option value="read">Read</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Messages List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
      ) : messages.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <FiMessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No messages found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {messages.map((message: any) => (
            <div
              key={message.id}
              onClick={() => {
                setSelectedMessage(message);
                if (message.status === 'unread') {
                  updateStatusMutation.mutate({ id: message.id, status: 'read' });
                }
              }}
              className={`p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all ${
                message.status === 'unread'
                  ? 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                  : 'bg-white dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {message.subject}
                    </h3>
                    {message.status === 'unread' && (
                      <span className="px-2 py-0.5 rounded-full bg-primary-500 text-white text-xs font-semibold">
                        New
                      </span>
                    )}
                  </div>
                  <div 
                    className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 message-preview"
                    dangerouslySetInnerHTML={{ __html: message.content }}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${priorityStyles[message.priority]}`}>
                      {message.priority}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      From: {message.sender_name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ProfilePage() {
  const { t } = useLanguage();
  const { user, updateUser, logout } = useAuthStore();
  const { mode, autoSource, setMode, setAutoSource } = useThemeStore();
  const [activeTab, setActiveTab] = useState<'profile' | 'messages' | 'license' | 'usage' | 'settings' | 'email-aliases' | 'products' | 'orders' | 'invoices' | 'payments' | 'subscriptions' | 'tickets'>('profile');

  // Fetch roles for color mapping
  const { data: rolesData } = useQuery({
    queryKey: ['crm-roles'],
    queryFn: async () => {
      const response = await crmAPI.getRoles({ page: 1, page_size: 100 });
      return response.data;
    },
  });
  const roles = (rolesData as any)?.items || [];

  // Poll for user profile updates (e.g., billing information changed on mobile)
  const { data: profileData } = useQuery({
    queryKey: ['user-profile'],
    queryFn: async () => {
      const response = await profileAPI.getMe();
      return response.data;
    },
    refetchInterval: 10000, // Poll every 10 seconds for profile updates
  });

  // Update user data and billing fields when profile data changes
  useEffect(() => {
    if (profileData) {
      updateUser(profileData);
      // Update billing fields if they exist in the profile
      if (profileData.address !== undefined) setAddress(profileData.address || '');
      if (profileData.city !== undefined) setCity(profileData.city || '');
      if (profileData.country !== undefined) setCountry(profileData.country || '');
      if (profileData.zip_code !== undefined) setZipCode(profileData.zip_code || '');
      if (profileData.province !== undefined) setProvince(profileData.province || '');
      if (profileData.district !== undefined) setDistrict(profileData.district || '');
      if (profileData.block !== undefined) setBlock(profileData.block || '');
    }
  }, [profileData, updateUser]);

  // Initialize billing fields from user object on mount
  useEffect(() => {
    if (user) {
      if (user.address) setAddress(user.address);
      if (user.city) setCity(user.city);
      if (user.country) setCountry(user.country);
      if (user.zip_code) setZipCode(user.zip_code);
      if (user.province) setProvince(user.province);
      if (user.district) setDistrict(user.district);
      if (user.block) setBlock(user.block);
    }
  }, []); // Run only on mount

  const getRoleInfo = (roleKey: string) => {
    const role = roles.find((r: any) => r.role_key === roleKey);
    console.log('getRoleInfo:', { roleKey, role, rolesLength: roles.length });
    return role || { name: roleKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()), color: 'purple' };
  };

  const getRoleColor = (roleKey: string) => {
    const role = roles.find((r: any) => r.role_key === roleKey);
    return role?.color || 'blue';
  };

  const getRoleName = (roleKey: string) => {
    const role = roles.find((r: any) => r.role_key === roleKey);
    return role ? role.name : roleKey.replace('_', ' ');
  };

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [availableCities, setAvailableCities] = useState<string[]>([]);
  const [province, setProvince] = useState('');
  const [availableProvinces, setAvailableProvinces] = useState<string[]>([]);
  const [district, setDistrict] = useState('');
  const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);
  const [block, setBlock] = useState('');
  const [zipCodePattern, setZipCodePattern] = useState('');
  const [zipCodePlaceholder, setZipCodePlaceholder] = useState('Enter ZIP code');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [language, setLanguage] = useState('en');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  // Tickets (Profile legacy page)
  const [showCreateTicket, setShowCreateTicket] = useState(false);
  const [newTicketSubject, setNewTicketSubject] = useState('');
  const [newTicketDescription, setNewTicketDescription] = useState('');
  const [newTicketPriority, setNewTicketPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [creatingTicket, setCreatingTicket] = useState(false);
  const [createTicketError, setCreateTicketError] = useState<string | null>(null);
  const [ticketSuccessMsg, setTicketSuccessMsg] = useState<string | null>(null);

  // Settings tabs state
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'notifications' | 'language' | 'security' | 'privacy' | 'accessibility' | 'data' | 'account'>('appearance');
  const tabsScrollRef = useState<HTMLDivElement | null>(null)[0];
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);
  
  // Debug log
  useEffect(() => {
    console.log('Settings tab changed to:', settingsTab);
  }, [settingsTab]);

  // Scroll functions for tabs
  const scrollTabs = (direction: 'left' | 'right') => {
    const container = document.getElementById('settings-tabs-container');
    if (container) {
      const scrollAmount = 200;
      container.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
      setTimeout(() => checkScrollPosition(), 100);
    }
  };

  const checkScrollPosition = () => {
    const container = document.getElementById('settings-tabs-container');
    if (container) {
      setShowLeftArrow(container.scrollLeft > 0);
      setShowRightArrow(container.scrollLeft < container.scrollWidth - container.clientWidth - 10);
    }
  };

  useEffect(() => {
    const container = document.getElementById('settings-tabs-container');
    if (container) {
      checkScrollPosition();
      container.addEventListener('scroll', checkScrollPosition);
      window.addEventListener('resize', checkScrollPosition);
      return () => {
        container.removeEventListener('scroll', checkScrollPosition);
        window.removeEventListener('resize', checkScrollPosition);
      };
    }
  }, []);
  
  // Security state
  const [securitySection, setSecuritySection] = useState<'overview' | 'change-password' | '2fa' | 'sessions' | 'privacy' | 'recovery'>('overview');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [showQRCode, setShowQRCode] = useState(false);
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [totpSecret, setTotpSecret] = useState('');

  // Workspace + billing state
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState('');
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState('');
  const [invoiceStats, setInvoiceStats] = useState<any>(null);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoiceTotalPages, setInvoiceTotalPages] = useState(1);
  
  // Invoice filters
  const [invoiceFilters, setInvoiceFilters] = useState({
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
    status: '',
    search: '',
  });
  
  const [downloadingInvoice, setDownloadingInvoice] = useState<number | null>(null);
  const [cancelingSubscription, setCancelingSubscription] = useState<number | null>(null);
  const [hasWorkspaceLicense, setHasWorkspaceLicense] = useState(true);

  // Email alias state
  const [aliases, setAliases] = useState<any[]>([]);
  const [loadingAliases, setLoadingAliases] = useState(false);
  const [aliasError, setAliasError] = useState('');
  const [aliasSuccess, setAliasSuccess] = useState('');
  const [newAlias, setNewAlias] = useState('');
  const [newAliasDisplayName, setNewAliasDisplayName] = useState('');
  const [newAliasDescription, setNewAliasDescription] = useState('');
  const [showAddAlias, setShowAddAlias] = useState(false);
  
  // Email sub-tabs
  const [emailSubTab, setEmailSubTab] = useState<'aliases' | 'shared'>('aliases');
  
  // Shared email state
  const [sharedEmails, setSharedEmails] = useState<any[]>([]);
  const [loadingSharedEmails, setLoadingSharedEmails] = useState(false);
  const [sharedEmailError, setSharedEmailError] = useState('');
  const [sharedEmailSuccess, setSharedEmailSuccess] = useState('');
  const [showAddSharedEmail, setShowAddSharedEmail] = useState(false);
  const [newSharedEmailName, setNewSharedEmailName] = useState('');
  const [newSharedEmailDisplayName, setNewSharedEmailDisplayName] = useState('');
  const [newSharedEmailDescription, setNewSharedEmailDescription] = useState('');
  const [selectedSharedEmail, setSelectedSharedEmail] = useState<any>(null);
  const [showInviteUser, setShowInviteUser] = useState(false);
  const [inviteUserEmail, setInviteUserEmail] = useState('');
  const [pendingInvites, setPendingInvites] = useState<any[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(false);

  // Workspace/admin extras
  const showUnlimitedInfo = user?.role === 'system_admin';

  // Handle country change to update available cities, provinces, and ZIP pattern
  const handleCountryChange = (selectedCountry: string) => {
    setCountry(selectedCountry);
    setCity(''); // Reset dependent fields
    setProvince('');
    setDistrict('');
    setBlock('');
    setZipCode('');
    
    // Set provinces if available
    if (selectedCountry && COUNTRY_PROVINCES[selectedCountry]) {
      setAvailableProvinces(COUNTRY_PROVINCES[selectedCountry]);
      // If province system exists, don't populate cities yet - wait for province selection
      if (PROVINCE_CITIES[selectedCountry]) {
        setAvailableCities([]);
      } else {
        // Province list exists but no province-city mapping, show all cities
        setAvailableCities(COUNTRY_CITIES[selectedCountry] || []);
      }
    } else {
      setAvailableProvinces([]);
      // No province system, show all cities directly
      if (selectedCountry && COUNTRY_CITIES[selectedCountry]) {
        setAvailableCities(COUNTRY_CITIES[selectedCountry]);
      } else {
        setAvailableCities([]);
      }
    }
    
    // Set ZIP code pattern
    const metadata = COUNTRY_METADATA[selectedCountry];
    if (metadata) {
      setZipCodePattern(metadata.zipFormat);
      setZipCodePlaceholder(`e.g., ${metadata.zipExample}`);
    } else {
      setZipCodePattern('');
      setZipCodePlaceholder('Enter ZIP/Postal code');
    }
    
    setAvailableDistricts([]);
  };

  // Handle province/state change to update available cities
  const handleProvinceChange = (selectedProvince: string) => {
    setProvince(selectedProvince);
    setCity(''); // Reset city when province changes
    setDistrict('');
    setBlock('');
    
    // If province-city mapping exists, use it; otherwise use all country cities
    if (country && selectedProvince && PROVINCE_CITIES[country]?.[selectedProvince]) {
      setAvailableCities(PROVINCE_CITIES[country][selectedProvince]);
    } else if (country && COUNTRY_CITIES[country]) {
      setAvailableCities(COUNTRY_CITIES[country]);
    } else {
      setAvailableCities([]);
    }
    
    setAvailableDistricts([]);
  };

  // Handle city change to update available districts
  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    setDistrict('');
    setBlock('');
    
    if (country && selectedCity && CITY_DISTRICTS[country]?.[selectedCity]) {
      setAvailableDistricts(CITY_DISTRICTS[country][selectedCity]);
    } else {
      setAvailableDistricts([]);
    }
  };

  // Security & privacy state
  const [activeSessions, setActiveSessions] = useState(
    [
      { id: 1, device: 'This device', location: 'Amsterdam, NL', ip: '192.168.0.24', lastActive: 'Just now', current: true },
      { id: 2, device: 'MacBook Pro', location: 'Rotterdam, NL', ip: '10.0.0.15', lastActive: '2 hours ago', current: false },
    ],
  );
  const [profileVisibility, setProfileVisibility] = useState<'public' | 'friends' | 'private'>('private');
  const [activityVisibility, setActivityVisibility] = useState<'public' | 'friends' | 'private'>('friends');
  const [dataSharing, setDataSharing] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [recoveryEmail, setRecoveryEmail] = useState(user?.email || '');
  const [recoveryPhone, setRecoveryPhone] = useState(user?.phone_number || '');
  
  // Accessibility state
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large' | 'extra-large'>('medium');
  const [highContrast, setHighContrast] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [screenReader, setScreenReader] = useState(false);
  
  // Primary color state
  const [primaryColor, setPrimaryColor] = useState('#0ea5e9'); // Default sky-500
  const defaultPrimaryColor = '#0ea5e9';
  
  // Font preferences state
  const [fontH1, setFontH1] = useState('Montserrat, sans-serif');
  const [fontH2, setFontH2] = useState('Montserrat, sans-serif');
  const [fontH3, setFontH3] = useState('Montserrat, sans-serif');
  const [fontH4, setFontH4] = useState('Montserrat, sans-serif');
  const [fontBody, setFontBody] = useState('-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif');
  const defaultFonts = {
    h1: 'Montserrat, sans-serif',
    h2: 'Montserrat, sans-serif',
    h3: 'Montserrat, sans-serif',
    h4: 'Montserrat, sans-serif',
    body: '-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif'
  };
  
  // Data & Storage state
  const [cacheSize, setCacheSize] = useState('128 MB');
  const [downloadingData, setDownloadingData] = useState(false);
  
  // Account state
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load preferences from backend on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const response = await profileAPI.getPreferences();
        const prefs = response.data;
        
        // Load all preferences if they exist
        if (prefs.theme_mode) setMode(prefs.theme_mode);
        if (prefs.theme_auto_source) setAutoSource(prefs.theme_auto_source);
        if (prefs.language) setLanguage(prefs.language);
        if (prefs.email_notifications !== undefined) setEmailNotifications(prefs.email_notifications);
        if (prefs.push_notifications !== undefined) setPushNotifications(prefs.push_notifications);
        if (prefs.marketing_emails !== undefined) setMarketingEmails(prefs.marketing_emails);
        if (prefs.profile_visibility) setProfileVisibility(prefs.profile_visibility);
        if (prefs.activity_visibility) setActivityVisibility(prefs.activity_visibility);
        if (prefs.data_sharing !== undefined) setDataSharing(prefs.data_sharing);
        if (prefs.analytics_enabled !== undefined) setAnalyticsEnabled(prefs.analytics_enabled);
        if (prefs.recovery_email) setRecoveryEmail(prefs.recovery_email);
        if (prefs.recovery_phone) setRecoveryPhone(prefs.recovery_phone);
        // Accessibility settings
        if (prefs.font_size) setFontSize(prefs.font_size);
        if (prefs.high_contrast !== undefined) setHighContrast(prefs.high_contrast);
        if (prefs.reduce_motion !== undefined) setReduceMotion(prefs.reduce_motion);
        if (prefs.screen_reader !== undefined) setScreenReader(prefs.screen_reader);
        // Load fonts
        if (prefs.font_h1) setFontH1(prefs.font_h1);
        if (prefs.font_h2) setFontH2(prefs.font_h2);
        if (prefs.font_h3) setFontH3(prefs.font_h3);
        if (prefs.font_h4) setFontH4(prefs.font_h4);
        if (prefs.font_body) setFontBody(prefs.font_body);
        // Load primary color or use default violet
        if (prefs.primary_color) {
          setPrimaryColor(prefs.primary_color);
          applyPrimaryColor(prefs.primary_color);
        } else {
          // Apply default color if not set in backend
          applyPrimaryColor(defaultPrimaryColor);
        }
        // Load Two-Factor Authentication settings
        if (prefs.two_factor_enabled !== undefined) setTwoFactorEnabled(prefs.two_factor_enabled);
        if (prefs.totp_secret) setTotpSecret(prefs.totp_secret);
        if (prefs.backup_codes && Array.isArray(prefs.backup_codes)) setBackupCodes(prefs.backup_codes);
      } catch (error) {
        console.error('Failed to load preferences:', error);
        // Continue with default values and apply default color
        applyPrimaryColor(defaultPrimaryColor);
      }
    };
    
    if (user) {
      loadPreferences();
    }
  }, [user]);

  // Apply primary color to document
  const applyPrimaryColor = (color: string) => {
    const root = document.documentElement;
    // Convert hex to RGB for Tailwind CSS variables
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    // Set CSS custom properties for primary colors
    root.style.setProperty('--color-primary-50', `${Math.min(r + 96, 255)} ${Math.min(g + 138, 255)} ${Math.min(b + 9, 255)}`);
    root.style.setProperty('--color-primary-100', `${Math.min(r + 82, 255)} ${Math.min(g + 122, 255)} ${Math.min(b + 8, 255)}`);
    root.style.setProperty('--color-primary-200', `${Math.min(r + 57, 255)} ${Math.min(g + 89, 255)} ${Math.min(b + 7, 255)}`);
    root.style.setProperty('--color-primary-300', `${Math.min(r + 28, 255)} ${Math.min(g + 47, 255)} ${Math.min(b + 4, 255)}`);
    root.style.setProperty('--color-primary-400', `${r} ${g} ${b}`);
    root.style.setProperty('--color-primary-500', `${r} ${g} ${b}`);
    root.style.setProperty('--color-primary-600', `${Math.max(r - 15, 0)} ${Math.max(g - 34, 0)} ${Math.max(b - 9, 0)}`);
    root.style.setProperty('--color-primary-700', `${Math.max(r - 30, 0)} ${Math.max(g - 52, 0)} ${Math.max(b - 29, 0)}`);
    root.style.setProperty('--color-primary-800', `${Math.max(r - 48, 0)} ${Math.max(g - 59, 0)} ${Math.max(b - 64, 0)}`);
    root.style.setProperty('--color-primary-900', `${Math.max(r - 63, 0)} ${Math.max(g - 63, 0)} ${Math.max(b - 97, 0)}`);
  };
  
  // Apply primary color on mount and when it changes
  useEffect(() => {
    applyPrimaryColor(primaryColor);
  }, [primaryColor]);

  // Auto-save primary color when it changes (instant save to backend)
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        console.log('[PROFILE] Auto-saving primary color:', primaryColor);
        await profileAPI.updatePreferences({
          primary_color: primaryColor,
        });
        console.log('[PROFILE] Primary color auto-saved');
      } catch (error) {
        console.error('[PROFILE] Failed to auto-save primary color:', error);
      }
    }, 300); // Quick debounce

    return () => clearTimeout(timeoutId);
  }, [primaryColor]);

  // Auto-save fonts when they change
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      try {
        await profileAPI.updatePreferences({
          font_h1: fontH1,
          font_h2: fontH2,
          font_h3: fontH3,
          font_h4: fontH4,
          font_body: fontBody,
        });
        console.log('[PROFILE] Fonts auto-saved');
      } catch (error) {
        console.error('[PROFILE] Failed to auto-save fonts:', error);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [fontH1, fontH2, fontH3, fontH4, fontBody]);
  
  // Apply fonts to document
  const applyFonts = () => {
    if (typeof document !== 'undefined') {
      const style = document.createElement('style');
      style.id = 'custom-fonts';
      const existingStyle = document.getElementById('custom-fonts');
      if (existingStyle) {
        existingStyle.remove();
      }
      style.textContent = `
        h1 { font-family: ${fontH1} !important; }
        h2 { font-family: ${fontH2} !important; }
        h3 { font-family: ${fontH3} !important; }
        h4 { font-family: ${fontH4} !important; }
        body { font-family: ${fontBody} !important; }
      `;
      document.head.appendChild(style);
    }
  };
  
  // Apply fonts on mount and when they change
  useEffect(() => {
    applyFonts();
  }, [fontH1, fontH2, fontH3, fontH4, fontBody]);

  const handleSavePreferences = async () => {
    try {
      setSaveStatus('idle');
      // Save all settings to backend
      await profileAPI.updatePreferences({
        theme_mode: mode,
        theme_auto_source: autoSource,
        language: language,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        marketing_emails: marketingEmails,
        profile_visibility: profileVisibility,
        activity_visibility: activityVisibility,
        data_sharing: dataSharing,
        analytics_enabled: analyticsEnabled,
        recovery_email: recoveryEmail,
        recovery_phone: recoveryPhone,
        // Accessibility settings
        font_size: fontSize,
        high_contrast: highContrast,
        reduce_motion: reduceMotion,
        screen_reader: screenReader,
        primary_color: primaryColor,
        font_h1: fontH1,
        font_h2: fontH2,
        font_h3: fontH3,
        font_h4: fontH4,
        font_body: fontBody,
        // Two-Factor Authentication settings
        two_factor_enabled: twoFactorEnabled,
        totp_secret: totpSecret,
        backup_codes: backupCodes,
      });
      
      // Also update theme in themeStore
      setMode(mode);
      setAutoSource(autoSource);
      
      // Apply primary color to document root
      applyPrimaryColor(primaryColor);
      
      setSaveStatus('success');
      toast.success('Settings saved successfully');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      console.error('Failed to save preferences:', error);
      setSaveStatus('error');
      toast.error('Failed to save settings');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  // Generate TOTP secret when enabling 2FA
  const generateTOTPSecret = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'; // Base32 alphabet
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += chars[Math.floor(Math.random() * chars.length)];
    }
    setTotpSecret(secret);
    return secret;
  };

  // Load mock subscriptions (placeholder for API)
  useEffect(() => {
    // Only seed once to avoid resetting potential future data wiring
    if (subscriptions.length === 0) {
      setSubscriptions([
        {
          id: 1,
          name: 'Workspace Starter',
          price: 12,
          cycle: 'monthly',
          features: ['All 15 Workspace apps', '100GB storage per user', 'Email support', 'Mobile apps', 'Basic integrations', 'Version history (30 days)'],
          nextBillingDate: new Date().toISOString(),
          canCancel: true,
        },
        {
          id: 2,
          name: 'Workspace Professional',
          price: 20,
          cycle: 'monthly',
          features: ['Everything in Starter', 'Unlimited storage', 'Priority support', 'Advanced integrations', 'Version history (90 days)', 'Admin console', 'Custom branding', 'Advanced security'],
          nextBillingDate: new Date().toISOString(),
          canCancel: true,
        },
        {
          id: 3,
          name: 'Workspace Enterprise',
          price: 0,
          cycle: 'custom',
          features: ['Everything in Professional', 'Dedicated account manager', '24/7 phone support', 'SLA guarantees', 'Unlimited version history', 'SSO & SAML', 'Data residency options', 'Custom contracts'],
          nextBillingDate: null,
          canCancel: false,
        },
      ]);
    }
  }, [subscriptions.length]);

  // Load aliases when visiting the tab
  useEffect(() => {
    if (activeTab === 'email-aliases' && hasWorkspaceLicense) {
      loadAliases();
      if (emailSubTab === 'shared') {
        loadSharedEmails();
        loadPendingInvites();
      }
    }
  }, [activeTab, hasWorkspaceLicense, emailSubTab]);

  const loadAliases = async () => {
    try {
      setLoadingAliases(true);
      setAliasError('');
      const response = await emailAliasAPI.listAliases();
      setAliases(response.data.aliases || []);
    } catch (error: any) {
      console.error('Email alias load error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to load email aliases';
      setAliasError(errorMsg);
      setAliases([]);
    } finally {
      setLoadingAliases(false);
    }
  };

  const loadSharedEmails = async () => {
    try {
      setLoadingSharedEmails(true);
      setSharedEmailError('');
      const response = await sharedEmailAPI.listSharedEmails();
      setSharedEmails(response.data.shared_emails || []);
    } catch (error: any) {
      console.error('Shared email load error:', error);
      const errorMsg = error.response?.data?.detail || error.message || 'Failed to load shared emails';
      setSharedEmailError(errorMsg);
      setSharedEmails([]);
    } finally {
      setLoadingSharedEmails(false);
    }
  };

  const loadPendingInvites = async () => {
    try {
      setLoadingInvites(true);
      const response = await sharedEmailAPI.getPendingInvites();
      setPendingInvites(response.data.invites || []);
    } catch (error: any) {
      console.error('Pending invites load error:', error);
      setPendingInvites([]);
    } finally {
      setLoadingInvites(false);
    }
  };

  const handleAddAlias = async () => {
    try {
      setAliasError('');
      setAliasSuccess('');
      
      if (!newAlias.trim()) {
        setAliasError('Alias is required');
        return;
      }

      await emailAliasAPI.createAlias({
        alias: newAlias.trim(),
        display_name: newAliasDisplayName.trim() || undefined,
        description: newAliasDescription.trim() || undefined,
      });

      setAliasSuccess('Email alias created successfully');
      setNewAlias('');
      setNewAliasDisplayName('');
      setNewAliasDescription('');
      setShowAddAlias(false);
      loadAliases();
      setTimeout(() => setAliasSuccess(''), 3000);
    } catch (error: any) {
      setAliasError(error.response?.data?.detail || 'Failed to create email alias');
    }
  };

  const handleDeleteAlias = async (aliasId: number) => {
    if (!confirm('Are you sure you want to delete this email alias?')) {
      return;
    }

    try {
      setAliasError('');
      await emailAliasAPI.deleteAlias(aliasId);
      setAliasSuccess('Email alias deleted successfully');
      loadAliases();
      setTimeout(() => setAliasSuccess(''), 3000);
    } catch (error: any) {
      setAliasError(error.response?.data?.detail || 'Failed to delete email alias');
    }
  };

  const handleToggleActive = async (aliasId: number, isActive: boolean) => {
    try {
      setAliasError('');
      await emailAliasAPI.updateAlias(aliasId, { is_active: !isActive });
      setAliasSuccess(`Email alias ${!isActive ? 'activated' : 'deactivated'}`);
      loadAliases();
      setTimeout(() => setAliasSuccess(''), 3000);
    } catch (error: any) {
      setAliasError(error.response?.data?.detail || 'Failed to update email alias');
    }
  };

  // Define invoice functions BEFORE useEffect hooks
  const loadInvoices = useCallback(async () => {
    try {
      setInvoiceLoading(true);
      setInvoiceError('');
      
      // Calculate date range for the selected month/year
      const startDate = new Date(invoiceFilters.year, invoiceFilters.month - 1, 1);
      const endDate = new Date(invoiceFilters.year, invoiceFilters.month, 0);
      
      const params: any = {
        page: invoicePage,
        page_size: 10,
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      };
      
      if (invoiceFilters.status) params.status = invoiceFilters.status;
      if (invoiceFilters.search) params.search = invoiceFilters.search;
      
      console.log('Loading invoices with params:', params);
      const response = await invoicesAPI.getInvoices(params);
      console.log('Invoice response received:', response.data);
      setInvoices(response.data.invoices || []);
      setInvoiceTotalPages(response.data.total_pages || 1);
    } catch (error: any) {
      console.error('Invoice load error:', error);
      setInvoiceError(error.response?.data?.detail || error.message || 'Failed to load invoices');
      setInvoices([]);
    } finally {
      setInvoiceLoading(false);
    }
  }, [invoiceFilters, invoicePage]);

  const loadInvoiceStats = useCallback(async () => {
    try {
      const response = await invoicesAPI.getStatistics();
      setInvoiceStats(response.data);
    } catch (error: any) {
      console.error('Invoice stats error:', error);
    }
  }, []);

  const loadOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      setOrdersError('');
      console.log('Loading orders...');
      const response = await erpAPI.getMyOrders({ page: 1, page_size: 50 });
      console.log('Orders response:', response.data);
      setOrders(response.data.items || []);
    } catch (error: any) {
      console.error('Orders load error:', error);
      setOrdersError(error.response?.data?.detail || error.message || 'Failed to load orders');
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  // Load invoices when tab changes
  useEffect(() => {
    if (activeTab === 'invoices') {
      setInvoicePage(1);
      setInvoices([]);
      loadInvoices();
      loadInvoiceStats();
    }
  }, [activeTab, loadInvoices, loadInvoiceStats]);

  // Load orders when tab changes
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab, loadOrders]);

  // Reload invoices when filters change (but only if already on invoices tab)
  useEffect(() => {
    if (activeTab === 'invoices' && invoiceFilters) {
      setInvoicePage(1);
      loadInvoices();
    }
  }, [invoiceFilters, activeTab, loadInvoices]);

  const handleDownloadInvoice = async (invoiceId: number) => {
    try {
      setDownloadingInvoice(invoiceId);
      const response = await invoicesAPI.downloadInvoice(invoiceId);
      
      // Create a download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${invoiceId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error('Download error:', error);
      alert('Failed to download invoice');
    } finally {
      setDownloadingInvoice(null);
    }
  };

  const handleMarkPaid = async (invoiceId: number) => {
    try {
      await invoicesAPI.markInvoicePaid(invoiceId);
      loadInvoices();
      loadInvoiceStats();
    } catch (error: any) {
      console.error('Mark paid error:', error);
      alert('Failed to mark invoice as paid');
    }
  };

  const handleResendInvoice = async (invoiceId: number) => {
    try {
      await invoicesAPI.resendInvoice(invoiceId);
      alert('Invoice resent successfully');
      loadInvoices();
    } catch (error: any) {
      console.error('Resend error:', error);
      alert('Failed to resend invoice');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 via-blue-50 to-gray-100 dark:from-gray-950 dark:via-slate-950 dark:to-black">
      <Topbar />
      <Navbar />

      <main className="flex-1">
        <section className="container mx-auto px-4 sm:px-6 pt-40 sm:pt-44 pb-6 sm:pb-8 max-w-6xl">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100">My Profile</h1>
              <div className="flex gap-2">
                <Link to="/dashboard">
                  <button className="px-6 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 font-medium border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all flex items-center gap-2">
                    <FiGrid className="w-5 h-5" />
                    Dashboard
                  </button>
                </Link>
                <Link to="/workspace">
                  <button className="px-6 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 text-gray-800 dark:text-gray-100 font-medium border border-gray-200 dark:border-gray-700 hover:bg-white dark:hover:bg-gray-700 transition-all flex items-center gap-2">
                    <FiBriefcase className="w-5 h-5" />
                    Workspace
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* Sidebar Layout */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <aside className="lg:w-64 shrink-0">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-card rounded-2xl p-4 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm sticky top-24"
              >
                <nav className="space-y-1">
                  {/* Your Profile Category */}
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Your Profile
                  </div>
                  <button
                    onClick={() => setActiveTab('profile')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'profile'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiUser className="w-5 h-5" />
                    <span>Profile</span>
                  </button>
                  <MessagesButtonWithBadge 
                    activeTab={activeTab} 
                    onClick={() => setActiveTab('messages')} 
                  />
                  <button
                    onClick={() => setActiveTab('license')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'license'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiAward className="w-5 h-5" />
                    <span>License</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('usage')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'usage'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiActivity className="w-5 h-5" />
                    <span>Usage</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('email-aliases')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'email-aliases'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiMail className="w-5 h-5" />
                    <span>Email</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('settings')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'settings'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiSettings className="w-5 h-5" />
                    <span>Settings</span>
                  </button>

                  {/* Finance Category */}
                  <div className="px-3 py-2 pt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Finance
                  </div>
                  <button
                    onClick={() => setActiveTab('products')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'products'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiShoppingCart className="w-5 h-5" />
                    <span>Your Products</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'orders'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiPackage className="w-5 h-5" />
                    <span>Orders</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'invoices'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiFileText className="w-5 h-5" />
                    <span>Invoices</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('payments')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'payments'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiCreditCard className="w-5 h-5" />
                    <span>Payment Methods</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('subscriptions')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'subscriptions'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiRepeat className="w-5 h-5" />
                    <span>Subscriptions</span>
                  </button>

                  {/* Help Category */}
                  <div className="px-3 py-2 pt-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Help
                  </div>
                  <button
                    onClick={() => setActiveTab('tickets')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
                      activeTab === 'tickets'
                        ? 'bg-primary-500 text-white shadow-lg'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                    }`}
                  >
                    <FiAlertCircle className="w-5 h-5" />
                    <span>Tickets</span>
                  </button>
                </nav>
              </motion.div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">

          {activeTab === 'profile' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile Information</h2>
              {(() => {
                const roleInfo = getRoleInfo(user?.role || '');
                const iconColor = ROLE_COLORS[roleInfo.color] || 'bg-purple-500';
                console.log('Badge render:', { userRole: user?.role, roleInfo, iconColor });
                return (
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                    <div className={`w-8 h-8 rounded-lg ${iconColor} flex items-center justify-center text-white`}>
                      <FiShield className="w-4 h-4" />
                    </div>
                    <span className="font-medium text-gray-800 dark:text-gray-100">
                      {roleInfo.name}
                    </span>
                  </div>
                );
              })()}
            </div>
            {status !== 'idle' && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl px-3 py-2 text-sm ${status === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                {status === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                <span>{status === 'success' ? 'Profile updated successfully.' : 'Failed to update profile.'}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4" />
                    <span>Username</span>
                  </div>
                </label>
                <input type="text" value={user?.username || ''} className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-4 h-4" />
                    <span>Email</span>
                  </div>
                </label>
                <input type="email" value={user?.email || ''} className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70" readOnly />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center space-x-2">
                    <FiUser className="w-4 h-4" />
                    <span>Full Name</span>
                  </div>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                  placeholder="Enter your full name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-4 h-4" />
                    <span>Phone</span>
                  </div>
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter your phone number"
                  className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                />
              </div>
            </div>

            {/* Billing Information Section */}
            <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Billing Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>Address</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="Enter your address"
                    className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>City</span>
                    </div>
                  </label>
                  {country && availableCities.length > 0 ? (
                    <select
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      title="City"
                      aria-label="City"
                      className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                    >
                      <option value="">Select a city</option>
                      {availableCities.map((cityName) => (
                        <option key={cityName} value={cityName}>
                          {cityName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => handleCityChange(e.target.value)}
                      placeholder={
                        !country 
                          ? "Select a country first" 
                          : (PROVINCE_CITIES[country] && !province)
                            ? "Select a province/state first"
                            : "Enter your city"
                      }
                      disabled={!country || (PROVINCE_CITIES[country] && !province)}
                      className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70 disabled:opacity-50"
                    />
                  )}
                </div>
                
                {/* Province/State Field - Show if country has provinces */}
                {country && COUNTRY_METADATA[country]?.hasProvince && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>{COUNTRY_METADATA[country]?.provinceLabel || 'Province'}</span>
                      </div>
                    </label>
                    {availableProvinces.length > 0 ? (
                      <select
                        value={province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        title={COUNTRY_METADATA[country]?.provinceLabel || 'Province'}
                        aria-label={COUNTRY_METADATA[country]?.provinceLabel || 'Province'}
                        className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                      >
                        <option value="">Select {COUNTRY_METADATA[country]?.provinceLabel?.toLowerCase() || 'province'}</option>
                        {availableProvinces.map((provinceName) => (
                          <option key={provinceName} value={provinceName}>
                            {provinceName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={province}
                        onChange={(e) => handleProvinceChange(e.target.value)}
                        placeholder={`Enter ${COUNTRY_METADATA[country]?.provinceLabel?.toLowerCase() || 'province'}`}
                        className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                      />
                    )}
                  </div>
                )}
                
                {/* District Field - Show if country has districts */}
                {country && COUNTRY_METADATA[country]?.hasDistrict && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>{COUNTRY_METADATA[country]?.districtLabel || 'District'}</span>
                      </div>
                    </label>
                    {availableDistricts.length > 0 ? (
                      <select
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        title={COUNTRY_METADATA[country]?.districtLabel || 'District'}
                        aria-label={COUNTRY_METADATA[country]?.districtLabel || 'District'}
                        className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                      >
                        <option value="">Select {COUNTRY_METADATA[country]?.districtLabel?.toLowerCase() || 'district'}</option>
                        {availableDistricts.map((districtName) => (
                          <option key={districtName} value={districtName}>
                            {districtName}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder={`Enter ${COUNTRY_METADATA[country]?.districtLabel?.toLowerCase() || 'district'}`}
                        className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                      />
                    )}
                  </div>
                )}
                
                {/* Block/Neighborhood Field - Always show if city is selected */}
                {city && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      <div className="flex items-center space-x-2">
                        <FiMapPin className="w-4 h-4" />
                        <span>Block / Neighborhood</span>
                      </div>
                    </label>
                    <input
                      type="text"
                      value={block}
                      onChange={(e) => setBlock(e.target.value)}
                      placeholder="Enter block or neighborhood"
                      className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                    />
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>Country</span>
                    </div>
                  </label>
                  <select
                    value={country}
                    onChange={(e) => handleCountryChange(e.target.value)}
                    title="Country"
                    aria-label="Country"
                    className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                  >
                    <option value="">Select a country</option>
                    <option value="Afghanistan">Afghanistan</option>
                    <option value="Albania">Albania</option>
                    <option value="Algeria">Algeria</option>
                    <option value="Andorra">Andorra</option>
                    <option value="Angola">Angola</option>
                    <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                    <option value="Argentina">Argentina</option>
                    <option value="Armenia">Armenia</option>
                    <option value="Australia">Australia</option>
                    <option value="Austria">Austria</option>
                    <option value="Azerbaijan">Azerbaijan</option>
                    <option value="Bahamas">Bahamas</option>
                    <option value="Bahrain">Bahrain</option>
                    <option value="Bangladesh">Bangladesh</option>
                    <option value="Barbados">Barbados</option>
                    <option value="Belarus">Belarus</option>
                    <option value="Belgium">Belgium</option>
                    <option value="Belize">Belize</option>
                    <option value="Benin">Benin</option>
                    <option value="Bhutan">Bhutan</option>
                    <option value="Bolivia">Bolivia</option>
                    <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                    <option value="Botswana">Botswana</option>
                    <option value="Brazil">Brazil</option>
                    <option value="Brunei">Brunei</option>
                    <option value="Bulgaria">Bulgaria</option>
                    <option value="Burkina Faso">Burkina Faso</option>
                    <option value="Burundi">Burundi</option>
                    <option value="Cabo Verde">Cabo Verde</option>
                    <option value="Cambodia">Cambodia</option>
                    <option value="Cameroon">Cameroon</option>
                    <option value="Canada">Canada</option>
                    <option value="Central African Republic">Central African Republic</option>
                    <option value="Chad">Chad</option>
                    <option value="Chile">Chile</option>
                    <option value="China">China</option>
                    <option value="Colombia">Colombia</option>
                    <option value="Comoros">Comoros</option>
                    <option value="Congo">Congo</option>
                    <option value="Costa Rica">Costa Rica</option>
                    <option value="Croatia">Croatia</option>
                    <option value="Cuba">Cuba</option>
                    <option value="Cyprus">Cyprus</option>
                    <option value="Czech Republic">Czech Republic</option>
                    <option value="Denmark">Denmark</option>
                    <option value="Djibouti">Djibouti</option>
                    <option value="Dominica">Dominica</option>
                    <option value="Dominican Republic">Dominican Republic</option>
                    <option value="East Timor">East Timor</option>
                    <option value="Ecuador">Ecuador</option>
                    <option value="Egypt">Egypt</option>
                    <option value="El Salvador">El Salvador</option>
                    <option value="Equatorial Guinea">Equatorial Guinea</option>
                    <option value="Eritrea">Eritrea</option>
                    <option value="Estonia">Estonia</option>
                    <option value="Eswatini">Eswatini</option>
                    <option value="Ethiopia">Ethiopia</option>
                    <option value="Fiji">Fiji</option>
                    <option value="Finland">Finland</option>
                    <option value="France">France</option>
                    <option value="Gabon">Gabon</option>
                    <option value="Gambia">Gambia</option>
                    <option value="Georgia">Georgia</option>
                    <option value="Germany">Germany</option>
                    <option value="Ghana">Ghana</option>
                    <option value="Greece">Greece</option>
                    <option value="Grenada">Grenada</option>
                    <option value="Guatemala">Guatemala</option>
                    <option value="Guinea">Guinea</option>
                    <option value="Guinea-Bissau">Guinea-Bissau</option>
                    <option value="Guyana">Guyana</option>
                    <option value="Haiti">Haiti</option>
                    <option value="Honduras">Honduras</option>
                    <option value="Hungary">Hungary</option>
                    <option value="Iceland">Iceland</option>
                    <option value="India">India</option>
                    <option value="Indonesia">Indonesia</option>
                    <option value="Iran">Iran</option>
                    <option value="Iraq">Iraq</option>
                    <option value="Ireland">Ireland</option>
                    <option value="Israel">Israel</option>
                    <option value="Italy">Italy</option>
                    <option value="Ivory Coast">Ivory Coast</option>
                    <option value="Jamaica">Jamaica</option>
                    <option value="Japan">Japan</option>
                    <option value="Jordan">Jordan</option>
                    <option value="Kazakhstan">Kazakhstan</option>
                    <option value="Kenya">Kenya</option>
                    <option value="Kiribati">Kiribati</option>
                    <option value="Kosovo">Kosovo</option>
                    <option value="Kuwait">Kuwait</option>
                    <option value="Kyrgyzstan">Kyrgyzstan</option>
                    <option value="Laos">Laos</option>
                    <option value="Latvia">Latvia</option>
                    <option value="Lebanon">Lebanon</option>
                    <option value="Lesotho">Lesotho</option>
                    <option value="Liberia">Liberia</option>
                    <option value="Libya">Libya</option>
                    <option value="Liechtenstein">Liechtenstein</option>
                    <option value="Lithuania">Lithuania</option>
                    <option value="Luxembourg">Luxembourg</option>
                    <option value="Madagascar">Madagascar</option>
                    <option value="Malawi">Malawi</option>
                    <option value="Malaysia">Malaysia</option>
                    <option value="Maldives">Maldives</option>
                    <option value="Mali">Mali</option>
                    <option value="Malta">Malta</option>
                    <option value="Marshall Islands">Marshall Islands</option>
                    <option value="Mauritania">Mauritania</option>
                    <option value="Mauritius">Mauritius</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Micronesia">Micronesia</option>
                    <option value="Moldova">Moldova</option>
                    <option value="Monaco">Monaco</option>
                    <option value="Mongolia">Mongolia</option>
                    <option value="Montenegro">Montenegro</option>
                    <option value="Morocco">Morocco</option>
                    <option value="Mozambique">Mozambique</option>
                    <option value="Myanmar">Myanmar</option>
                    <option value="Namibia">Namibia</option>
                    <option value="Nauru">Nauru</option>
                    <option value="Nepal">Nepal</option>
                    <option value="Netherlands">Netherlands</option>
                    <option value="New Zealand">New Zealand</option>
                    <option value="Nicaragua">Nicaragua</option>
                    <option value="Niger">Niger</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="North Korea">North Korea</option>
                    <option value="North Macedonia">North Macedonia</option>
                    <option value="Norway">Norway</option>
                    <option value="Oman">Oman</option>
                    <option value="Pakistan">Pakistan</option>
                    <option value="Palau">Palau</option>
                    <option value="Palestine">Palestine</option>
                    <option value="Panama">Panama</option>
                    <option value="Papua New Guinea">Papua New Guinea</option>
                    <option value="Paraguay">Paraguay</option>
                    <option value="Peru">Peru</option>
                    <option value="Philippines">Philippines</option>
                    <option value="Poland">Poland</option>
                    <option value="Portugal">Portugal</option>
                    <option value="Qatar">Qatar</option>
                    <option value="Romania">Romania</option>
                    <option value="Russia">Russia</option>
                    <option value="Rwanda">Rwanda</option>
                    <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                    <option value="Saint Lucia">Saint Lucia</option>
                    <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                    <option value="Samoa">Samoa</option>
                    <option value="San Marino">San Marino</option>
                    <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                    <option value="Saudi Arabia">Saudi Arabia</option>
                    <option value="Senegal">Senegal</option>
                    <option value="Serbia">Serbia</option>
                    <option value="Seychelles">Seychelles</option>
                    <option value="Sierra Leone">Sierra Leone</option>
                    <option value="Singapore">Singapore</option>
                    <option value="Slovakia">Slovakia</option>
                    <option value="Slovenia">Slovenia</option>
                    <option value="Solomon Islands">Solomon Islands</option>
                    <option value="Somalia">Somalia</option>
                    <option value="South Africa">South Africa</option>
                    <option value="South Korea">South Korea</option>
                    <option value="South Sudan">South Sudan</option>
                    <option value="Spain">Spain</option>
                    <option value="Sri Lanka">Sri Lanka</option>
                    <option value="Sudan">Sudan</option>
                    <option value="Suriname">Suriname</option>
                    <option value="Sweden">Sweden</option>
                    <option value="Switzerland">Switzerland</option>
                    <option value="Syria">Syria</option>
                    <option value="Taiwan">Taiwan</option>
                    <option value="Tajikistan">Tajikistan</option>
                    <option value="Tanzania">Tanzania</option>
                    <option value="Thailand">Thailand</option>
                    <option value="Togo">Togo</option>
                    <option value="Tonga">Tonga</option>
                    <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                    <option value="Tunisia">Tunisia</option>
                    <option value="Turkey">Turkey</option>
                    <option value="Turkmenistan">Turkmenistan</option>
                    <option value="Tuvalu">Tuvalu</option>
                    <option value="Uganda">Uganda</option>
                    <option value="Ukraine">Ukraine</option>
                    <option value="United Arab Emirates">United Arab Emirates</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="United States">United States</option>
                    <option value="Uruguay">Uruguay</option>
                    <option value="Uzbekistan">Uzbekistan</option>
                    <option value="Vanuatu">Vanuatu</option>
                    <option value="Vatican City">Vatican City</option>
                    <option value="Venezuela">Venezuela</option>
                    <option value="Vietnam">Vietnam</option>
                    <option value="Yemen">Yemen</option>
                    <option value="Zambia">Zambia</option>
                    <option value="Zimbabwe">Zimbabwe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <div className="flex items-center space-x-2">
                      <FiMapPin className="w-4 h-4" />
                      <span>ZIP / Postal Code</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    placeholder={zipCodePlaceholder}
                    title={zipCodePattern ? `Format: ${zipCodePattern}` : undefined}
                    className="glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                  />
                  {zipCodePattern && (
                    <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                      Format: {zipCodePattern}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                className="glass-button px-8 py-3 rounded-xl text-white font-medium disabled:opacity-60"
                disabled={saving}
                onClick={async () => {
                  try {
                    setSaving(true);
                    setStatus('idle');
                    const res = await profileAPI.updateMe({ 
                      full_name: fullName || null, 
                      phone: phone || null,
                      address: address || null,
                      city: city || null,
                      country: country || null,
                      province: province || null,
                      district: district || null,
                      block: block || null,
                      zip_code: zipCode || null
                    });
                    const updated = res.data;
                    updateUser({ 
                      full_name: updated.full_name,
                      phone_number: phone || undefined,
                      address: address || undefined,
                      city: city || undefined,
                      country: country || undefined,
                      province: province || undefined,
                      district: district || undefined,
                      block: block || undefined,
                      zip_code: zipCode || undefined
                    });
                    setStatus('success');
                  } catch (e) {
                    setStatus('error');
                  } finally {
                    setSaving(false);
                  }
                }}
              >
                {saving ? 'Saving…' : 'Save Changes'}
              </button>
            </div>
          </motion.div>
          )}

          {activeTab === 'invoices' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            {/* Header */}
            <motion.div className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-500 dark:text-green-400">
                  <FiFileText className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Invoices</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">View and manage your billing history</p>
                </div>
              </div>

              {/* Statistics */}
              {invoiceStats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-900/40 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Invoices</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{invoiceStats.total_invoices}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-900/40 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Paid</p>
                    <p className="text-2xl font-bold text-green-600 dark:text-green-400">${invoiceStats.paid_amount.toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-900/40 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">${invoiceStats.pending_amount.toFixed(2)}</p>
                  </div>
                  <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-900/40 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Overdue</p>
                    <p className="text-2xl font-bold text-red-600 dark:text-red-400">{invoiceStats.overdue_invoices}</p>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Filters - Minimal Design with Month/Year */}
            <motion.div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-200 dark:border-gray-800">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {/* Month Dropdown */}
                <select
                  value={invoiceFilters.month}
                  onChange={(e) => setInvoiceFilters({ ...invoiceFilters, month: parseInt(e.target.value) })}
                  title="Filter by Month"
                  aria-label="Filter by Month"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value={1}>January</option>
                  <option value={2}>February</option>
                  <option value={3}>March</option>
                  <option value={4}>April</option>
                  <option value={5}>May</option>
                  <option value={6}>June</option>
                  <option value={7}>July</option>
                  <option value={8}>August</option>
                  <option value={9}>September</option>
                  <option value={10}>October</option>
                  <option value={11}>November</option>
                  <option value={12}>December</option>
                </select>

                {/* Year Dropdown */}
                <select
                  value={invoiceFilters.year}
                  onChange={(e) => setInvoiceFilters({ ...invoiceFilters, year: parseInt(e.target.value) })}
                  title="Filter by Year"
                  aria-label="Filter by Year"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {[new Date().getFullYear(), new Date().getFullYear() - 1, new Date().getFullYear() - 2, new Date().getFullYear() - 3, new Date().getFullYear() - 4].map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>

                {/* Status Filter */}
                <select
                  value={invoiceFilters.status}
                  onChange={(e) => setInvoiceFilters({ ...invoiceFilters, status: e.target.value })}
                  title="Filter by Status"
                  aria-label="Filter by Status"
                  className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="draft">Draft</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Search */}
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Invoice #"
                    value={invoiceFilters.search}
                    onChange={(e) => setInvoiceFilters({ ...invoiceFilters, search: e.target.value })}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Clear Button */}
                <button
                  onClick={() => setInvoiceFilters({ month: new Date().getMonth() + 1, year: new Date().getFullYear(), status: '', search: '' })}
                  className="px-3 py-2 text-sm rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
              </div>
            </motion.div>

            {/* Invoices List */}
            <motion.div className="glass-card p-6 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              {invoiceError && (
                <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                  {invoiceError}
                </div>
              )}

              {invoiceLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin w-12 h-12 border-4 border-gray-200 dark:border-gray-700 border-t-blue-500 rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-600 dark:text-gray-400">Loading invoices...</p>
                </div>
              ) : invoices.length > 0 ? (
                <>
                  <div className="space-y-3 mb-6">
                    {invoices.map((invoice) => (
                      <div key={invoice.id} className="flex flex-col p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30' :
                                invoice.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30' :
                                'bg-blue-100 dark:bg-blue-900/30'
                              }`}>
                                <FiFileText className={`w-5 h-5 ${
                                  invoice.status === 'paid' ? 'text-green-600 dark:text-green-400' :
                                  invoice.status === 'overdue' ? 'text-red-600 dark:text-red-400' :
                                  'text-blue-600 dark:text-blue-400'
                                }`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{invoice.invoice_number}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{new Date(invoice.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto mt-3 sm:mt-0">
                            <div className="flex-1 sm:flex-none text-right">
                              <p className="text-sm font-semibold text-gray-900 dark:text-white">${invoice.total_amount.toFixed(2)}</p>
                              <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full mt-1 ${
                                invoice.status === 'paid' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200' :
                                invoice.status === 'overdue' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200' :
                                'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200'
                              }`}>
                                {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                              </span>
                            </div>

                            <div className="flex gap-2">
                              {invoice.status !== 'paid' && (
                                <button
                                  onClick={() => handleMarkPaid(invoice.id)}
                                  className="px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 hover:bg-green-200 dark:hover:bg-green-900/50 text-green-600 dark:text-green-400 font-medium text-sm transition-colors"
                                >
                                  Mark Paid
                                </button>
                              )}
                              <button
                                onClick={() => handleDownloadInvoice(invoice.id)}
                                disabled={downloadingInvoice === invoice.id}
                                className="px-3 py-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-medium text-sm transition-colors disabled:opacity-50"
                              >
                                {downloadingInvoice === invoice.id ? (
                                  <span className="flex items-center gap-1">
                                    <div className="animate-spin w-4 h-4 border-2 border-blue-400 border-t-blue-600 rounded-full"></div>
                                  </span>
                                ) : (
                                  <span className="flex items-center gap-1">
                                    <FiDownload className="w-4 h-4" />
                                    Download
                                  </span>
                                )}
                              </button>
                              <button
                                onClick={() => handleResendInvoice(invoice.id)}
                                className="px-3 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 font-medium text-sm transition-colors"
                              >
                                Resend
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Products/Items section */}
                        {invoice.items && invoice.items.length > 0 && (
                          <div className="ml-13 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">Items:</div>
                            <div className="flex flex-wrap gap-2">
                              {invoice.items.map((item: any, idx: number) => (
                                <div key={idx} className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                                  <span className="text-xs text-gray-700 dark:text-gray-300">{item.product_name}</span>
                                  {item.quantity > 1 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">x{item.quantity}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Order detail section */}
                        {invoice.order_detail && (
                          <div className="ml-13 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs">
                              <span className="font-semibold text-gray-600 dark:text-gray-400">Order #{invoice.order_detail.order_number}</span>
                              <span className="text-gray-500 dark:text-gray-500 ml-2">• {new Date(invoice.order_detail.order_created_at).toLocaleDateString()}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pagination */}
                  {invoiceTotalPages > 1 && (
                    <div className="flex items-center justify-center gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
                      <button
                        onClick={() => setInvoicePage(Math.max(1, invoicePage - 1))}
                        disabled={invoicePage === 1}
                        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        Previous
                      </button>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Page {invoicePage} of {invoiceTotalPages}
                      </span>
                      <button
                        onClick={() => setInvoicePage(Math.min(invoiceTotalPages, invoicePage + 1))}
                        disabled={invoicePage === invoiceTotalPages}
                        className="px-3 py-2 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 font-medium hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <FiFileText className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No invoices found</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your invoices will appear here once you make a purchase or subscribe to a plan</p>
                </div>
              )}
            </motion.div>
          </motion.div>
          )}

          {activeTab === 'orders' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                <FiPackage className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">My Orders</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your product and service purchases</p>
              </div>
            </div>

            {ordersLoading && (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                <p className="text-gray-600 dark:text-gray-400 mt-4">Loading orders...</p>
              </div>
            )}

            {ordersError && (
              <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400">
                {ordersError}
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length === 0 && (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <FiPackage className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No orders yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Your orders will appear here once you make a purchase</p>
                <Link to="/shop">
                  <button className="glass-button px-6 py-3 rounded-xl text-white font-medium">Browse Products</button>
                </Link>
              </div>
            )}

            {!ordersLoading && !ordersError && orders.length > 0 && (
              <div className="space-y-4">
                {orders.map((order: any) => (
                  <div key={order.id} className="p-6 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Order {order.order_number}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {new Date(order.created_at).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${order.total_amount.toFixed(2)}
                        </div>
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' :
                          order.status === 'processing' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' :
                          'bg-gray-100 dark:bg-gray-900/30 text-gray-800 dark:text-gray-400'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>

                    {order.order_items && order.order_items.length > 0 && (
                      <div className="space-y-2 border-t border-gray-200 dark:border-gray-700 pt-4">
                        <p className="text-xs font-semibold text-gray-600 dark:text-gray-400">Items:</p>
                        {order.order_items.map((item: any, idx: number) => (
                          <div key={idx} className="flex justify-between items-center text-sm">
                            <span className="text-gray-700 dark:text-gray-300">
                              {item.quantity}x Product #{item.product_id}
                            </span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              ${item.total_price.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          )}

          {activeTab === 'payments' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 flex items-center justify-center text-teal-500 dark:text-teal-400">
                <FiCreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Payment Methods</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage saved cards and billing details</p>
              </div>
            </div>

            {/* Stripe Card Management */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Saved Cards (Stripe)</h3>
              {/* Replace with Stripe API integration */}
              <div className="space-y-4">
                {/* Example card list, replace with real data */}
                {[{id:1,brand:'Visa',last4:'4242',exp:'12/28'},{id:2,brand:'Mastercard',last4:'4444',exp:'09/27'}].map(card => (
                  <div key={card.id} className="flex items-center justify-between p-4 rounded-xl bg-white/80 dark:bg-gray-900/80 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <FiCreditCard className="w-6 h-6 text-teal-500 dark:text-teal-400" />
                      <span className="font-medium text-gray-800 dark:text-gray-100">{card.brand} **** {card.last4}</span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">Exp: {card.exp}</span>
                    </div>
                    <button className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white text-sm font-medium">Remove</button>
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <button className="glass-button px-6 py-3 rounded-xl text-white font-medium bg-primary-600 hover:bg-primary-700">
                  Add New Card
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">Card storage powered by Stripe. More providers coming soon.</p>
              </div>
            </div>

            {/* Other Providers Placeholder */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Other Payment Providers</h3>
              <div className="flex gap-3 flex-wrap">
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition-all">
                  <span className="text-lg">💳</span> PayPal
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-sm font-medium transition-all">
                  <span className="text-lg"></span> Apple Pay
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white text-sm font-medium transition-all">
                  <span className="text-lg">🅖</span> Google Pay
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium transition-all">
                  <span className="text-lg">💰</span> Adyen
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 text-white text-sm font-medium transition-all">
                  <span className="text-lg">💶</span> Wero
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">Support for these providers is coming soon.</p>
            </div>
          </motion.div>
          )}

          {activeTab === 'subscriptions' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                <FiRepeat className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Subscriptions</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage your recurring product and service subscriptions</p>
              </div>
            </div>

            {subscriptions.length > 0 ? (
              <>
                <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    <strong>Active Workspace Subscription:</strong> You have {subscriptions.length} active subscription(s).
                  </p>
                </div>

                {/* Subscriptions Table */}
                <div className="hidden md:block rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 relative">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
                      <tr>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white w-1/4">Subscription</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white w-[10%]">Price</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white w-[10%]">Status</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white w-[12%]">Billing</th>
                        <th className="px-3 py-3 text-left text-xs font-semibold text-gray-900 dark:text-white w-[8%]">Features</th>
                        <th className="px-3 py-3 text-right text-xs font-semibold text-gray-900 dark:text-white w-[20%]">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscriptions.map((sub, idx) => (
                        <tr key={sub.id} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors ${
                          idx % 2 === 0 ? 'bg-white dark:bg-gray-800/30' : 'bg-gray-50 dark:bg-gray-800/10'
                        }`}>
                          <td className="px-3 py-3">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                                <FiPackage className="w-4 h-4 text-green-600 dark:text-green-400" />
                              </div>
                              <div className="min-w-0">
                                <h3 className="text-xs font-semibold text-gray-900 dark:text-white truncate">{sub.name}</h3>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 text-xs">
                            <div className="font-semibold text-gray-900 dark:text-white">${sub.price}</div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">/{sub.cycle.charAt(0)}</div>
                          </td>
                          <td className="px-3 py-3 text-xs">
                            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium text-xs whitespace-nowrap">
                              <FiCheckCircle className="w-3 h-3" />
                              OK
                            </span>
                          </td>
                          <td className="px-3 py-3 text-xs text-gray-600 dark:text-gray-400 truncate">
                            {sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                          </td>
                          <td className="px-3 py-3 text-xs">
                            <span className="text-gray-600 dark:text-gray-400 font-medium">{sub.features.length}</span>
                          </td>
                          <td className="px-3 py-3 text-xs">
                            <div className="flex items-center gap-1 justify-end pr-2">
                              <button
                                title="View details"
                                className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                              >
                                <FiRefreshCw className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Update payment"
                                className="p-1.5 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                              >
                                <FiCreditCard className="w-3.5 h-3.5" />
                              </button>
                              <button
                                title="Pause"
                                className="p-1.5 rounded-md bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 transition-colors"
                              >
                                <FiClock className="w-3.5 h-3.5" />
                              </button>
                              {sub.canCancel && (
                                <button
                                  onClick={() => setCancelingSubscription(sub.id)}
                                  title="Cancel"
                                  className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                                >
                                  <FiXCircle className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Subscriptions Cards (mobile) */}
                <div className="md:hidden space-y-3">
                  {subscriptions.map((sub) => (
                    <div key={sub.id} className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 p-4 shadow-sm">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                          <FiPackage className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{sub.name}</p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">${sub.price}/{sub.cycle.charAt(0)}</p>
                        </div>
                        <span className="ml-auto inline-flex items-center gap-1 px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 font-medium text-xs whitespace-nowrap">
                          <FiCheckCircle className="w-3 h-3" />
                          OK
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-3 text-xs text-gray-700 dark:text-gray-300 mb-3">
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Next Billing</div>
                          <div className="font-semibold">{sub.nextBillingDate ? new Date(sub.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}</div>
                        </div>
                        <div>
                          <div className="text-gray-500 dark:text-gray-400">Features</div>
                          <div className="font-semibold">{sub.features.length}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 justify-end">
                        <button
                          title="View details"
                          className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <FiRefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          title="Update payment"
                          className="p-2 rounded-md bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-900/50 text-blue-600 dark:text-blue-400 transition-colors"
                        >
                          <FiCreditCard className="w-4 h-4" />
                        </button>
                        <button
                          title="Pause"
                          className="p-2 rounded-md bg-amber-100 dark:bg-amber-900/30 hover:bg-amber-200 dark:hover:bg-amber-900/50 text-amber-600 dark:text-amber-400 transition-colors"
                        >
                          <FiClock className="w-4 h-4" />
                        </button>
                        {sub.canCancel && (
                          <button
                            title="Cancel"
                            onClick={() => setCancelingSubscription(sub.id)}
                            className="p-2 rounded-md bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors"
                          >
                            <FiTrash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cancel Confirmation Modal */}
                <AnimatePresence>
                  {cancelingSubscription && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                      onClick={() => setCancelingSubscription(null)}
                    >
                      <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        onClick={e => e.stopPropagation()}
                        className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full border border-gray-200 dark:border-gray-700"
                      >
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                            <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                          </div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Cancel Subscription?</h3>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                          You'll lose access to all features. This action cannot be undone. Are you sure?
                        </p>
                        <div className="flex gap-3">
                          <button
                            onClick={() => {
                              setCancelingSubscription(null);
                              // Handle cancellation
                            }}
                            className="flex-1 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium transition-colors"
                          >
                            Cancel Subscription
                          </button>
                          <button
                            onClick={() => setCancelingSubscription(null)}
                            className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition-colors"
                          >
                            Keep It
                          </button>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Unlimited Workspace (System Admin) */}
                {showUnlimitedInfo && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-6 rounded-lg overflow-hidden border border-purple-200 dark:border-purple-700/50"
                  >
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                            <FiZap className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Unlimited Workspace</h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Premium subscription</p>
                          </div>
                        </div>
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                          PREMIUM
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 pb-6 border-b border-purple-200 dark:border-purple-700/50">
                        {['Unlimited storage', 'All workspace apps', 'Priority support', 'Custom domains'].map((f, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <FiCheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-gray-700 dark:text-gray-300">{f}</span>
                          </div>
                        ))}
                      </div>

                      {/* Action Icons */}
                      <div className="flex items-center gap-2">
                        <button
                          title="View account details"
                          className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition-colors"
                        >
                          <FiRefreshCw className="w-4 h-4" />
                        </button>
                        <button
                          title="View billing history"
                          className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition-colors"
                        >
                          <FiCreditCard className="w-4 h-4" />
                        </button>
                        <button
                          title="Premium settings"
                          className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 hover:bg-purple-200 dark:hover:bg-purple-900/50 text-purple-600 dark:text-purple-400 transition-colors"
                        >
                          <FiSettings className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                  <FiRepeat className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No subscriptions yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Subscribe to a product package to see it listed here</p>
                <Link to="/shop">
                  <button className="glass-button px-6 py-3 rounded-xl text-white font-medium">
                    Browse Subscription Plans
                  </button>
                </Link>
              </div>
            )}
          </motion.div>
          )}

          {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                <FiShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Your Products</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Manage products you've purchased or activated</p>
              </div>
            </div>
            
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <FiShoppingCart className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No products yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Your products will appear here after purchase or activation</p>
              <Link to="/shop">
                <button className="glass-button px-6 py-3 rounded-xl text-white font-medium">Explore Products</button>
              </Link>
            </div>
          </motion.div>
          )}

          {activeTab === 'usage' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                <FiActivity className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Premium Request Usage</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your monthly Premium Request allocation</p>
              </div>
            </div>

            {/* What are Premium Requests */}
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center text-white flex-shrink-0">
                  <FiAlertCircle className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">What are Premium Requests?</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Premium Requests are usage credits included with certain product packages. Each Premium Request lets you perform advanced operations and access premium features within your purchased product — independent of the CITRICLOUD Workspace.
                  </p>
                  <div className="mt-4 bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Premium Requests power our AI assistance for your plan: the AI can utilize, examine, fix, and diagnose your code directly in terminals (bash) and editors. This helps automate troubleshooting and accelerate development within your product package context.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Pricing: After you reach your monthly included usage, each additional Premium Request costs <strong className="text-indigo-600 dark:text-indigo-400">$0.04 per request</strong>.
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Notifications: If your purchased product is in development and your Premium Request usage becomes full, you'll receive an email with options to buy additional requests or wait until the end of the month when your quota resets.
                    </p>
                  </div>
                  <div className="bg-white/60 dark:bg-gray-800/60 rounded-lg p-4 space-y-3">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      <strong className="text-gray-900 dark:text-white">Example:</strong> When you purchase a product like the <strong className="text-indigo-600 dark:text-indigo-400">Full Enterprise Package</strong>, you receive <strong className="text-indigo-600 dark:text-indigo-400">1,500 Premium Requests per month</strong>.
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      • Each Premium Request is consumed when you use premium features<br />
                      • Your usage counter resets monthly on the 1st<br />
                      • Unused requests do not roll over to the next month
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* What's Coming Soon Section */}
            <div className="mb-8 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-purple-500 flex items-center justify-center text-white flex-shrink-0">
                  <FiClock className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">What's Coming to Usage</h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-3">
                    Once you purchase a product package, this page will display:
                  </p>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <span><strong className="text-gray-900 dark:text-white">Real-time usage counter</strong> showing remaining Premium Requests for the current month</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <span><strong className="text-gray-900 dark:text-white">Monthly allocation details</strong> based on your purchased product package</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <span><strong className="text-gray-900 dark:text-white">Usage history and analytics</strong> to track your consumption patterns</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <span><strong className="text-gray-900 dark:text-white">Reset countdown timer</strong> showing when your requests will refresh</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                      <span><strong className="text-gray-900 dark:text-white">Upgrade options</strong> if you need additional Premium Requests</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Coming Soon State */}
            <div className="p-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/50 dark:to-gray-900/50 border-2 border-dashed border-gray-300 dark:border-gray-600">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white shadow-lg">
                  <FiShoppingCart className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-3">No Products Yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-2 max-w-lg mx-auto">
                  You haven't purchased any product packages yet. Premium Request tracking will appear here once you own a product.
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
                  Browse our shop to find the perfect package for your needs and start using premium features today.
                </p>
                <Link
                  to="/shop"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <FiShoppingCart className="w-5 h-5" />
                  Browse Products
                </Link>
              </div>
            </div>
          </motion.div>
          )}

          {activeTab === 'messages' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500 dark:text-primary-400">
                <FiMessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Messages</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Your inbox and notifications</p>
              </div>
            </div>

            <MessagesContent />
          </motion.div>
          )}

          {activeTab === 'license' && (
          <>
            {/* License Information */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500 dark:text-primary-400">
                  <FiAward className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Workspace License</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Your CITRICLOUD Workspace access status</p>
                </div>
              </div>

              {/* License Status Card */}
              <div className="bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                {user?.role === 'system_admin' ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-green-500 flex items-center justify-center text-white">
                          <FiCheckCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Unlimited License</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">System Administrator</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-sm font-medium">
                        Active
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">License Type</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">System Admin - Unlimited</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Workspace Access</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Full Access</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Storage</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Unlimited</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Expiration</p>
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">Never</p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> As a System Administrator, you have unlimited access to all Workspace features at no cost.
                      </p>
                    </div>
                  </>
                ) : ['developer', 'administrator', 'manager', 'user'].includes(user?.role || '') ? (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white">
                          <FiClock className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Coming Soon</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Workspace License</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm font-medium">
                        Pending
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="text-center py-6">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Workspace licensing for your role is currently being prepared.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">You will be notified once licenses become available for purchase.</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        <strong>Status:</strong> Workspace access will be available soon. Check back later or contact support for more information.
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-gray-500 flex items-center justify-center text-white">
                          <FiXCircle className="w-6 h-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white">Not Available</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Workspace License</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 rounded-full bg-gray-500/10 text-gray-700 dark:text-gray-400 text-sm font-medium">
                        N/A
                      </div>
                    </div>
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                      <div className="text-center py-6">
                        <p className="text-gray-600 dark:text-gray-400 mb-4">Workspace access is not available for your account type.</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">Please contact your administrator or upgrade your account to access Workspace features.</p>
                      </div>
                    </div>
                    <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
                      <p className="text-sm text-gray-700 dark:text-gray-400">
                        <strong>Note:</strong> Workspace features require a valid license. Contact support to learn more about licensing options.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Workspace Features List */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Workspace Features</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { name: 'Email', icon: FiMail },
                    { name: 'Words & Sheets', icon: FiFileText },
                    { name: 'Drive Storage', icon: FiGrid },
                    { name: 'Projects & Planning', icon: FiBriefcase },
                    { name: 'Forms & Lists', icon: FiFileText },
                    { name: 'Collaboration Tools', icon: FiUser }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                      <feature.icon className="w-5 h-5 text-primary-500 dark:text-primary-400" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{feature.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
          )}

          {activeTab === 'tickets' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 dark:bg-yellow-500/20 flex items-center justify-center text-yellow-500 dark:text-yellow-400">
                <FiAlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Support Tickets</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Track your support requests and issues</p>
              </div>
            </div>
            {ticketSuccessMsg && (
              <div className="mb-4 rounded-lg px-4 py-3 text-sm bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300">
                {ticketSuccessMsg}
              </div>
            )}
            
            <div className="text-center py-12">
              <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <FiAlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No tickets found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">You haven't created any support tickets yet</p>
              <button onClick={() => setShowCreateTicket(true)} className="glass-button px-6 py-3 rounded-xl text-white font-medium">
                Create New Ticket
              </button>
            </div>

            {showCreateTicket && (
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
                <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Create Support Ticket</h4>
                    <button onClick={() => setShowCreateTicket(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
                  </div>
                  <div className="px-6 py-5 space-y-4">
                    {createTicketError && (
                      <div className="rounded-lg px-4 py-3 text-sm bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300">
                        {createTicketError}
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Subject</label>
                      <input
                        type="text"
                        value={newTicketSubject}
                        onChange={(e) => setNewTicketSubject(e.target.value)}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Briefly describe your issue"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                      <select
                        value={newTicketPriority}
                        onChange={(e) => setNewTicketPriority(e.target.value as 'low' | 'medium' | 'high')}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                      <textarea
                        value={newTicketDescription}
                        onChange={(e) => setNewTicketDescription(e.target.value)}
                        rows={5}
                        className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="Provide details, steps to reproduce, and any relevant links"
                      />
                    </div>
                  </div>
                  <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-end gap-3">
                    <button
                      onClick={() => setShowCreateTicket(false)}
                      className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                      disabled={creatingTicket}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={async () => {
                        setCreateTicketError(null);
                        if (!newTicketSubject.trim() || !newTicketDescription.trim()) {
                          setCreateTicketError('Please provide subject and description.');
                          return;
                        }
                        try {
                          setCreatingTicket(true);
                          await erpAPI.createTicket({
                            subject: newTicketSubject.trim(),
                            description: newTicketDescription.trim(),
                            priority: newTicketPriority,
                          });
                          setShowCreateTicket(false);
                          setNewTicketSubject('');
                          setNewTicketDescription('');
                          setNewTicketPriority('medium');
                          setTicketSuccessMsg('Ticket created successfully. You can track it here or in the CRM dashboard.');
                        } catch (err: any) {
                          const d = err?.response?.data?.detail;
                          const msg = typeof d === 'string' ? d : (Array.isArray(d) && d[0]?.msg ? d[0].msg : 'Failed to create ticket. Please try again.');
                          setCreateTicketError(msg);
                        } finally {
                          setCreatingTicket(false);
                        }
                      }}
                      className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-medium disabled:opacity-60"
                      disabled={creatingTicket}
                    >
                      {creatingTicket ? 'Creating…' : 'Create Ticket'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
          )}

          {activeTab === 'email-aliases' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
            
            {/* Email Sub-Tabs */}
            <div className="flex items-center gap-4 mb-6 border-b border-gray-200 dark:border-gray-700 pb-2">
              <button
                onClick={() => setEmailSubTab('aliases')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all border-b-2 -mb-2 ${
                  emailSubTab === 'aliases'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <FiAtSign className="w-5 h-5" />
                Email Aliases
              </button>
              <button
                onClick={() => setEmailSubTab('shared')}
                className={`flex items-center gap-2 px-4 py-2 font-medium transition-all border-b-2 -mb-2 ${
                  emailSubTab === 'shared'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                }`}
              >
                <FiUsers className="w-5 h-5" />
                Shared Email
              </button>
            </div>

            {/* Email Aliases Tab Content */}
            {emailSubTab === 'aliases' && (
            <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <FiAtSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Email Aliases</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Personal email addresses with individual passwords</p>
                </div>
              </div>
              {hasWorkspaceLicense && !showAddAlias && (
                <button
                  onClick={() => setShowAddAlias(true)}
                  disabled={user?.role !== 'system_admin' && aliases.length >= 5}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiPlus className="w-5 h-5" />
                  Add Alias
                </button>
              )}
            </div>

            {/* Workspace License Required Notice */}
            {!hasWorkspaceLicense && (
              <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white flex-shrink-0">
                    <FiAlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Workspace License Required</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Email Aliases is a premium feature that requires an active Workspace License. Purchase a license to create and manage multiple email addresses for your account.
                    </p>
                    <Link to="/shop">
                      <button className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all">
                        Get Workspace License
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {hasWorkspaceLicense && (aliasSuccess || aliasError) && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${aliasSuccess ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                {aliasSuccess ? <FiCheckCircle /> : <FiXCircle />}
                <span>{aliasSuccess || aliasError}</span>
              </div>
            )}

            {/* Add Alias Form */}
            {hasWorkspaceLicense && showAddAlias && (
              <div className="mb-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Create New Email Alias</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Alias <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newAlias}
                        onChange={(e) => setNewAlias(e.target.value.toLowerCase())}
                        placeholder="sales"
                        className="flex-1 glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                      />
                      <span className="text-gray-600 dark:text-gray-400">@citricloud.com</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Lowercase letters, numbers, dots, hyphens, and underscores only</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newAliasDisplayName}
                      onChange={(e) => setNewAliasDisplayName(e.target.value)}
                      placeholder="Sales Team"
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newAliasDescription}
                      onChange={(e) => setNewAliasDescription(e.target.value)}
                      placeholder="Purpose of this alias..."
                      rows={3}
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500/70"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleAddAlias}
                      className="flex-1 px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all"
                    >
                      Create Alias
                    </button>
                    <button
                      onClick={() => {
                        setShowAddAlias(false);
                        setNewAlias('');
                        setNewAliasDisplayName('');
                        setNewAliasDescription('');
                        setAliasError('');
                      }}
                      className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Alias Limits Info */}
            {hasWorkspaceLicense && (
              <div className="mb-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                <div className="flex items-start gap-3">
                  <FiAlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    {user?.role === 'system_admin' ? (
                      <p><strong>System Admin:</strong> You have unlimited email aliases. Create as many as you need.</p>
                    ) : (
                      <p><strong>Alias Limit:</strong> You can create up to 5 email aliases. Currently: <strong>{aliases.length}/5</strong></p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Aliases List */}
            {hasWorkspaceLicense && (
              <>
                {loadingAliases ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading aliases...</p>
                  </div>
                ) : aliases.length > 0 ? (
                  <div className="space-y-3">
                    {aliases.map((alias: any) => (
                      <div key={alias.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {alias.full_email}
                              </h3>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                alias.is_active
                                  ? 'bg-green-500/10 text-green-700 dark:text-green-400'
                                  : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'
                              }`}>
                                {alias.is_active ? 'Active' : 'Inactive'}
                              </span>
                              {alias.is_verified && (
                                <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400">
                                  Verified
                                </span>
                              )}
                            </div>
                            {alias.display_name && (
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {alias.display_name}
                              </p>
                            )}
                            {alias.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {alias.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Created: {new Date(alias.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleActive(alias.id, alias.is_active)}
                              className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-all"
                              title={alias.is_active ? 'Deactivate' : 'Activate'}
                            >
                              {alias.is_active ? <FiXCircle className="w-5 h-5" /> : <FiCheckCircle className="w-5 h-5" />}
                            </button>
                            <button
                              onClick={() => handleDeleteAlias(alias.id)}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all"
                              title="Delete"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <FiAtSign className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Email Aliases Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first email alias to receive emails at multiple addresses</p>
                  </div>
                )}
              </>
            )}

            {/* How it Works */}
            {hasWorkspaceLicense && (
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  How Email Aliases Work
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>All emails sent to your aliases will appear in your Workspace Email inbox</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>You can reply using any of your active aliases</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Inactive aliases will not receive emails until reactivated</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Use aliases for different purposes: sales, support, info, etc.</span>
                  </li>
                </ul>
              </div>
            )}
            </>
            )}

            {/* Shared Email Tab Content */}
            {emailSubTab === 'shared' && (
            <>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                  <FiUsers className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Shared Email</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Role-based and department-based shared mailboxes</p>
                </div>
              </div>
              {hasWorkspaceLicense && !showAddSharedEmail && (user?.role === 'system_admin' || user?.role === 'admin') && (
                <button
                  onClick={() => setShowAddSharedEmail(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all"
                >
                  <FiPlus className="w-5 h-5" />
                  Create Shared Email
                </button>
              )}
            </div>

            {/* Workspace License Required Notice */}
            {!hasWorkspaceLicense && (
              <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center text-white flex-shrink-0">
                    <FiAlertCircle className="w-6 h-6" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Workspace License Required</h3>
                    <p className="text-gray-700 dark:text-gray-300 mb-4">
                      Shared Email is a premium feature that requires an active Workspace License. Create role-based and department-based shared mailboxes for your team.
                    </p>
                    <Link to="/shop">
                      <button className="px-6 py-3 rounded-xl bg-yellow-500 hover:bg-yellow-600 text-white font-medium transition-all">
                        Get Workspace License
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Success/Error Messages */}
            {hasWorkspaceLicense && (sharedEmailSuccess || sharedEmailError) && (
              <div className={`mb-4 flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
                sharedEmailSuccess ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'
              }`}>
                {sharedEmailSuccess ? <FiCheckCircle /> : <FiXCircle />}
                <span>{sharedEmailSuccess || sharedEmailError}</span>
              </div>
            )}

            {/* Add Shared Email Form */}
            {hasWorkspaceLicense && showAddSharedEmail && (
              <div className="mb-6 p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Create Shared Email Group</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Email Name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={newSharedEmailName}
                        onChange={(e) => setNewSharedEmailName(e.target.value.toLowerCase())}
                        placeholder="administrator, crm, support"
                        className="flex-1 glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/70"
                      />
                      <span className="text-gray-600 dark:text-gray-400">@citricloud.com</span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Examples: administrator, crm, support, sales, hr</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={newSharedEmailDisplayName}
                      onChange={(e) => setNewSharedEmailDisplayName(e.target.value)}
                      placeholder="Administrator Team"
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/70"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={newSharedEmailDescription}
                      onChange={(e) => setNewSharedEmailDescription(e.target.value)}
                      placeholder="Purpose of this shared mailbox..."
                      rows={3}
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500/70"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={async () => {
                        if (!newSharedEmailName) {
                          setSharedEmailError('Email name is required');
                          return;
                        }
                        
                        try {
                          setLoadingSharedEmails(true);
                          setSharedEmailError('');
                          await sharedEmailAPI.createSharedEmail({
                            email_name: newSharedEmailName,
                            display_name: newSharedEmailDisplayName || undefined,
                            description: newSharedEmailDescription || undefined,
                          });
                          
                          setSharedEmailSuccess('Shared email created successfully');
                          setShowAddSharedEmail(false);
                          setNewSharedEmailName('');
                          setNewSharedEmailDisplayName('');
                          setNewSharedEmailDescription('');
                          
                          // Reload shared emails
                          await loadSharedEmails();
                          
                          // Clear success message after 3 seconds
                          setTimeout(() => setSharedEmailSuccess(''), 3000);
                        } catch (error: any) {
                          console.error('Failed to create shared email:', error);
                          const errorMsg = error.response?.data?.detail || error.message || 'Failed to create shared email';
                          setSharedEmailError(errorMsg);
                        } finally {
                          setLoadingSharedEmails(false);
                        }
                      }}
                      disabled={loadingSharedEmails || !newSharedEmailName}
                      className="flex-1 px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium transition-all"
                    >
                      {loadingSharedEmails ? 'Creating...' : 'Create Shared Email'}
                    </button>
                    <button
                      onClick={() => {
                        setShowAddSharedEmail(false);
                        setNewSharedEmailName('');
                        setNewSharedEmailDisplayName('');
                        setNewSharedEmailDescription('');
                        setSharedEmailError('');
                      }}
                      className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100 font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Shared Email List */}
            {hasWorkspaceLicense && (
              <>
                {loadingSharedEmails ? (
                  <div className="text-center py-12">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-400">Loading shared emails...</p>
                  </div>
                ) : sharedEmails.length > 0 ? (
                  <div className="space-y-3">
                    {sharedEmails.map((email: any) => (
                      <div key={email.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                                {email.full_email}
                              </h3>
                              <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-500/10 text-purple-700 dark:text-purple-400">
                                {email.member_count || 0} Members
                              </span>
                            </div>
                            {email.display_name && (
                              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                {email.display_name}
                              </p>
                            )}
                            {email.description && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                {email.description}
                              </p>
                            )}
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              Created: {new Date(email.created_at).toLocaleDateString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Link
                              to={`/shared-inbox/${email.id}`}
                              className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 transition-all"
                              title="Open Inbox"
                            >
                              <FiMail className="w-5 h-5" />
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedSharedEmail(email);
                                setSharedEmailError('');
                                setShowInviteUser(true);
                              }}
                              className="p-2 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 transition-all"
                              title="Invite User"
                            >
                              <FiPlus className="w-5 h-5" />
                            </button>
                            <button
                              onClick={async () => {
                                if (confirm(`Are you sure you want to delete ${email.full_email}? This action cannot be undone.`)) {
                                  try {
                                    await sharedEmailAPI.deleteSharedEmail(email.id);
                                    setSharedEmailSuccess('Shared email deleted successfully');
                                    await loadSharedEmails();
                                    setTimeout(() => setSharedEmailSuccess(''), 3000);
                                  } catch (error: any) {
                                    const errorMsg = error.response?.data?.detail || 'Failed to delete shared email';
                                    setSharedEmailError(errorMsg);
                                  }
                                }
                              }}
                              className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all"
                              title="Delete"
                            >
                              <FiTrash2 className="w-5 h-5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                      <FiUsers className="w-10 h-10 text-gray-400 dark:text-gray-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-100 mb-2">No Shared Emails Yet</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">Create shared mailboxes for teams and departments</p>
                    {(user?.role === 'system_admin' || user?.role === 'admin') && (
                      <button
                        onClick={() => setShowAddSharedEmail(true)}
                        className="px-6 py-3 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-medium transition-all"
                      >
                        Create Shared Email
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Pending Invites */}
            {hasWorkspaceLicense && pendingInvites.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <FiBell className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  Pending Invitations
                </h3>
                <div className="space-y-3">
                  {pendingInvites.map((invite: any) => (
                    <div key={invite.id} className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="text-base font-semibold text-gray-800 dark:text-gray-100">
                              {invite.shared_email_name}
                            </h4>
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400">
                              Pending
                            </span>
                          </div>
                          {invite.shared_email_display_name && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                              {invite.shared_email_display_name}
                            </p>
                          )}
                          {invite.shared_email_description && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                              {invite.shared_email_description}
                            </p>
                          )}
                          <p className="text-xs text-gray-500 dark:text-gray-500">
                            Invited by: {invite.invited_by?.full_name || 'Unknown'} ({invite.invited_by?.email})
                          </p>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={async () => {
                              try {
                                await sharedEmailAPI.acceptInvite(invite.id);
                                setSharedEmailSuccess('Invitation accepted! You can now access this shared email.');
                                await loadSharedEmails();
                                await loadPendingInvites();
                                setTimeout(() => setSharedEmailSuccess(''), 3000);
                              } catch (error: any) {
                                const errorMsg = error.response?.data?.detail || 'Failed to accept invitation';
                                setSharedEmailError(errorMsg);
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition-all flex items-center gap-2"
                            title="Accept"
                          >
                            <FiCheckCircle className="w-4 h-4" />
                            Accept
                          </button>
                          <button
                            onClick={async () => {
                              if (confirm('Are you sure you want to decline this invitation?')) {
                                try {
                                  await sharedEmailAPI.declineInvite(invite.id);
                                  setSharedEmailSuccess('Invitation declined');
                                  await loadPendingInvites();
                                  setTimeout(() => setSharedEmailSuccess(''), 3000);
                                } catch (error: any) {
                                  const errorMsg = error.response?.data?.detail || 'Failed to decline invitation';
                                  setSharedEmailError(errorMsg);
                                }
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white font-medium transition-all flex items-center gap-2"
                            title="Decline"
                          >
                            <FiXCircle className="w-4 h-4" />
                            Decline
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* How Shared Email Works */}
            {hasWorkspaceLicense && (
              <div className="mt-6 p-6 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <FiAlertCircle className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  How Shared Email Works
                </h3>
                <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Shared mailboxes are accessible by all invited members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Only admins and role-based users can create and invite members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>Perfect for department emails: support@, sales@, hr@, admin@</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 mt-0.5 text-purple-500 flex-shrink-0" />
                    <span>All members can read and reply to emails in the shared mailbox</span>
                  </li>
                </ul>
              </div>
            )}
            </>
            )}
          </motion.div>
          )}

          {activeTab === 'settings' && (
          <>
            {/* Settings Tabs with Navigation Arrows */}
            <div className="flex items-center gap-2 mb-6">
              {/* Left Arrow */}
              {showLeftArrow && (
                <button
                  onClick={() => scrollTabs('left')}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-all shadow-md"
                >
                  <FiChevronRight className="w-5 h-5 rotate-180 text-white" />
                </button>
              )}
              
              {/* Scrollable Tabs Container */}
              <div
                id="settings-tabs-container"
                className="flex gap-3 overflow-x-auto scrollbar-hide scroll-smooth flex-1"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                <button
                  onClick={() => setSettingsTab('appearance')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'appearance'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiMoon className="w-4 h-4" />
                  <span>Appearance</span>
                </button>
                <button
                  onClick={() => setSettingsTab('notifications')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'notifications'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiBell className="w-4 h-4" />
                  <span>Notifications</span>
                </button>
                <button
                  onClick={() => setSettingsTab('language')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'language'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiGlobe className="w-4 h-4" />
                  <span>Language & Region</span>
                </button>
                <button
                  onClick={() => setSettingsTab('security')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'security'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiLock className="w-4 h-4" />
                  <span>Security</span>
                </button>
                <button
                  onClick={() => setSettingsTab('privacy')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'privacy'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiShield className="w-4 h-4" />
                  <span>Privacy</span>
                </button>
                <button
                  onClick={() => setSettingsTab('accessibility')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'accessibility'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiUser className="w-4 h-4" />
                  <span>Accessibility</span>
                </button>
                <button
                  onClick={() => setSettingsTab('data')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'data'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiActivity className="w-4 h-4" />
                  <span>Data & Storage</span>
                </button>
                <button
                  onClick={() => setSettingsTab('account')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all whitespace-nowrap ${
                    settingsTab === 'account'
                      ? 'bg-primary-500 text-white'
                      : 'bg-white/60 dark:bg-gray-800/60 text-gray-700 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <FiAlertCircle className="w-4 h-4" />
                  <span>Account</span>
                </button>
              </div>

              {/* Right Arrow */}
              {showRightArrow && (
                <button
                  onClick={() => scrollTabs('right')}
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-primary-500 hover:bg-primary-600 flex items-center justify-center transition-all shadow-md"
                >
                  <FiChevronRight className="w-5 h-5 text-white" />
                </button>
              )}
            </div>

            {/* Appearance */}
            {settingsTab === 'appearance' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-500/10 dark:bg-primary-500/20 flex items-center justify-center text-primary-500 dark:text-primary-400">
                  <FiMoon className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Appearance</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customize how CITRICLOUD looks on your device</p>
                </div>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Theme Mode</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button onClick={() => setMode('light')} className={`p-4 rounded-xl border transition-all ${mode === 'light' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <FiSun className="w-6 h-6 mx-auto mb-2 text-gray-800 dark:text-gray-200" />
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Light</div>
                    </button>
                    <button onClick={() => setMode('dark')} className={`p-4 rounded-xl border transition-all ${mode === 'dark' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <FiMoon className="w-6 h-6 mx-auto mb-2 text-gray-800 dark:text-gray-200" />
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Dark</div>
                    </button>
                    <button onClick={() => setMode('auto')} className={`p-4 rounded-xl border transition-all ${mode === 'auto' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                      <FiClock className="w-6 h-6 mx-auto mb-2 text-gray-800 dark:text-gray-200" />
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Auto</div>
                    </button>
                  </div>
                </div>
                {mode === 'auto' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Auto Mode Source</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button onClick={() => setAutoSource('sun')} className={`p-4 rounded-xl border transition-all text-left ${autoSource === 'sun' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">Sunrise/Sunset</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Based on your location</div>
                      </button>
                      <button onClick={() => setAutoSource('system')} className={`p-4 rounded-xl border transition-all text-left ${autoSource === 'system' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100 mb-1">System Preference</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Follow device settings</div>
                      </button>
                    </div>
                  </div>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Primary Color</label>
                  <div className="space-y-4">
                    <div className="grid grid-cols-8 gap-3">
                      {[
                        { name: 'Violet', color: '#8b5cf6' },
                        { name: 'Blue', color: '#3b82f6' },
                        { name: 'Cyan', color: '#06b6d4' },
                        { name: 'Teal', color: '#14b8a6' },
                        { name: 'Green', color: '#10b981' },
                        { name: 'Lime', color: '#84cc16' },
                        { name: 'Yellow', color: '#eab308' },
                        { name: 'Orange', color: '#f97316' },
                        { name: 'Red', color: '#ef4444' },
                        { name: 'Pink', color: '#ec4899' },
                        { name: 'Rose', color: '#f43f5e' },
                        { name: 'Indigo', color: '#6366f1' },
                        { name: 'Purple', color: '#a855f7' },
                        { name: 'Fuchsia', color: '#d946ef' },
                        { name: 'Amber', color: '#f59e0b' },
                        { name: 'Emerald', color: '#059669' },
                      ].map((colorOption) => (
                        <button
                          key={colorOption.color}
                          onClick={() => setPrimaryColor(colorOption.color)}
                          className={`w-12 h-12 rounded-xl transition-all hover:scale-110 ${
                            primaryColor === colorOption.color
                              ? 'ring-4 ring-offset-2 ring-gray-400 dark:ring-gray-500 scale-110'
                              : 'hover:ring-2 ring-offset-2 ring-gray-300 dark:ring-gray-600'
                          }`}
                          style={{ backgroundColor: colorOption.color }}
                          title={colorOption.name}
                        />
                      ))}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Custom Color</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={primaryColor}
                            onChange={(e) => setPrimaryColor(e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-gray-200 dark:border-gray-700"
                          />
                          <input
                            type="text"
                            value={primaryColor}
                            onChange={(e) => {
                              const hex = e.target.value;
                              if (/^#[0-9A-F]{6}$/i.test(hex)) {
                                setPrimaryColor(hex);
                              }
                            }}
                            placeholder="#8b5cf6"
                            className="flex-1 glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 font-mono text-sm"
                          />
                        </div>
                      </div>
                      
                      <button
                        onClick={() => setPrimaryColor(defaultPrimaryColor)}
                        className="mt-6 px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
                      >
                        Reset to Default
                      </button>
                    </div>
                    
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{primaryColor}</span>
                      </div>
                      <div className="flex gap-2">
                        <button className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all" style={{ backgroundColor: primaryColor }}>
                          Primary Button
                        </button>
                        <button className="flex-1 px-4 py-2 rounded-lg font-medium transition-all" style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}>
                          Secondary
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Typography</label>
                  <div className="space-y-4">
                    {/* Font Family Selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* H1 Font */}
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Heading 1 (H1)</label>
                        <select
                          value={fontH1}
                          onChange={(e) => setFontH1(e.target.value)}
                          className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 text-sm"
                        >
                          <option value="Montserrat, sans-serif">Montserrat (Default)</option>
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Open Sans, sans-serif">Open Sans</option>
                          <option value="Lato, sans-serif">Lato</option>
                          <option value="Poppins, sans-serif">Poppins</option>
                          <option value="Raleway, sans-serif">Raleway</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="Merriweather, serif">Merriweather</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Courier New, monospace">Courier New</option>
                        </select>
                      </div>
                      
                      {/* H2 Font */}
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Heading 2 (H2)</label>
                        <select
                          value={fontH2}
                          onChange={(e) => setFontH2(e.target.value)}
                          className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 text-sm"
                        >
                          <option value="Montserrat, sans-serif">Montserrat (Default)</option>
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Open Sans, sans-serif">Open Sans</option>
                          <option value="Lato, sans-serif">Lato</option>
                          <option value="Poppins, sans-serif">Poppins</option>
                          <option value="Raleway, sans-serif">Raleway</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="Merriweather, serif">Merriweather</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Courier New, monospace">Courier New</option>
                        </select>
                      </div>
                      
                      {/* H3 Font */}
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Heading 3 (H3)</label>
                        <select
                          value={fontH3}
                          onChange={(e) => setFontH3(e.target.value)}
                          className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 text-sm"
                        >
                          <option value="Montserrat, sans-serif">Montserrat (Default)</option>
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Open Sans, sans-serif">Open Sans</option>
                          <option value="Lato, sans-serif">Lato</option>
                          <option value="Poppins, sans-serif">Poppins</option>
                          <option value="Raleway, sans-serif">Raleway</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="Merriweather, serif">Merriweather</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Courier New, monospace">Courier New</option>
                        </select>
                      </div>
                      
                      {/* H4 Font */}
                      <div>
                        <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Heading 4 (H4)</label>
                        <select
                          value={fontH4}
                          onChange={(e) => setFontH4(e.target.value)}
                          className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 text-sm"
                        >
                          <option value="Montserrat, sans-serif">Montserrat (Default)</option>
                          <option value="Inter, sans-serif">Inter</option>
                          <option value="Roboto, sans-serif">Roboto</option>
                          <option value="Open Sans, sans-serif">Open Sans</option>
                          <option value="Lato, sans-serif">Lato</option>
                          <option value="Poppins, sans-serif">Poppins</option>
                          <option value="Raleway, sans-serif">Raleway</option>
                          <option value="Playfair Display, serif">Playfair Display</option>
                          <option value="Merriweather, serif">Merriweather</option>
                          <option value="Georgia, serif">Georgia</option>
                          <option value="Courier New, monospace">Courier New</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Body Font */}
                    <div>
                      <label className="block text-xs text-gray-600 dark:text-gray-400 mb-2">Body Text</label>
                      <select
                        value={fontBody}
                        onChange={(e) => setFontBody(e.target.value)}
                        className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 text-sm"
                      >
                        <option value="-apple-system, BlinkMacSystemFont, San Francisco, Segoe UI, Roboto, Helvetica Neue, sans-serif">System Font (Default)</option>
                        <option value="Inter, sans-serif">Inter</option>
                        <option value="Roboto, sans-serif">Roboto</option>
                        <option value="Open Sans, sans-serif">Open Sans</option>
                        <option value="Lato, sans-serif">Lato</option>
                        <option value="Poppins, sans-serif">Poppins</option>
                        <option value="Raleway, sans-serif">Raleway</option>
                        <option value="Georgia, serif">Georgia</option>
                        <option value="Courier New, monospace">Courier New</option>
                      </select>
                    </div>
                    
                    <button
                      onClick={() => {
                        setFontH1(defaultFonts.h1);
                        setFontH2(defaultFonts.h2);
                        setFontH3(defaultFonts.h3);
                        setFontH4(defaultFonts.h4);
                        setFontBody(defaultFonts.body);
                      }}
                      className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm font-medium transition-all"
                    >
                      Reset Fonts to Default
                    </button>
                    
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="space-y-3">
                        <div>
                          <h1 className="text-2xl font-bold mb-1" style={{ fontFamily: fontH1 }}>Heading 1 Preview</h1>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{fontH1}</span>
                        </div>
                        <div>
                          <h2 className="text-xl font-bold mb-1" style={{ fontFamily: fontH2 }}>Heading 2 Preview</h2>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{fontH2}</span>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: fontH3 }}>Heading 3 Preview</h3>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{fontH3}</span>
                        </div>
                        <div>
                          <h4 className="text-base font-bold mb-1" style={{ fontFamily: fontH4 }}>Heading 4 Preview</h4>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{fontH4}</span>
                        </div>
                        <div>
                          <p className="text-sm mb-1" style={{ fontFamily: fontBody }}>Body text preview: The quick brown fox jumps over the lazy dog.</p>
                          <span className="text-xs text-gray-500 dark:text-gray-400">{fontBody}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )}

            {/* Notifications */}
            {settingsTab === 'notifications' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center text-blue-500 dark:text-blue-400">
                  <FiBell className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage how you receive updates</p>
                </div>
              </div>
              <div className="space-y-6">
                {/* Notification Channels */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Channels</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-100">Email Notifications</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Receive email updates about your account</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <FiBell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-100">Push Notifications</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Get push notifications in your browser</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={pushNotifications} onChange={e => setPushNotifications(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center gap-3">
                        <FiMail className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <div className="font-medium text-gray-800 dark:text-gray-100">Marketing Emails</div>
                          <div className="text-sm text-gray-600 dark:text-gray-400">Receive news, updates, and offers</div>
                        </div>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={marketingEmails} onChange={e => setMarketingEmails(e.target.checked)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Notification Categories */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">Categories</h3>
                  <div className="space-y-3">
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">Account Activity</div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Login attempts, password changes, security alerts</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">Messages & Comments</div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">New messages, replies, mentions</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">Billing & Payments</div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Invoices, payment confirmations, subscription updates</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">Product Updates</div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">New features, improvements, changelogs</div>
                    </div>
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">System Maintenance</div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Scheduled maintenance, service updates</div>
                    </div>
                  </div>
                </div>

                {/* Quiet Hours */}
                <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <FiBell className="w-4 h-4" />
                    Do Not Disturb
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Mute notifications during specific hours</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Start Time</label>
                      <input type="time" defaultValue="22:00" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">End Time</label>
                      <input type="time" defaultValue="08:00" className="w-full px-3 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            )}

            {/* Language & Region */}
            {settingsTab === 'language' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-green-500/10 dark:bg-green-500/20 flex items-center justify-center text-green-500 dark:text-green-400">
                  <FiGlobe className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Language & Region</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Set your language and regional preferences</p>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Display Language</label>
                  <select value={language} onChange={e => setLanguage(e.target.value)} title="Display Language" aria-label="Display Language" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                    <option value="tr">Türkçe</option>
                    <option value="it">Italiano</option>
                    <option value="pt">Português</option>
                    <option value="ru">Русский</option>
                    <option value="zh">中文</option>
                    <option value="ja">日本語</option>
                    <option value="ar">العربية</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Timezone</label>
                  <select defaultValue="UTC" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="UTC">UTC (Coordinated Universal Time)</option>
                    <option value="America/New_York">Eastern Time (ET)</option>
                    <option value="America/Chicago">Central Time (CT)</option>
                    <option value="America/Denver">Mountain Time (MT)</option>
                    <option value="America/Los_Angeles">Pacific Time (PT)</option>
                    <option value="Europe/London">London (GMT/BST)</option>
                    <option value="Europe/Paris">Paris (CET)</option>
                    <option value="Europe/Istanbul">Istanbul (TRT)</option>
                    <option value="Asia/Dubai">Dubai (GST)</option>
                    <option value="Asia/Tokyo">Tokyo (JST)</option>
                    <option value="Asia/Shanghai">Shanghai (CST)</option>
                    <option value="Australia/Sydney">Sydney (AEST)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Date Format</label>
                  <select defaultValue="MM/DD/YYYY" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="MM/DD/YYYY">MM/DD/YYYY (12/27/2025)</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY (27/12/2025)</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD (2025-12-27)</option>
                    <option value="DD MMM YYYY">DD MMM YYYY (27 Dec 2025)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Time Format</label>
                  <div className="grid grid-cols-2 gap-4">
                    <button className="p-4 rounded-xl border-2 border-primary-500 bg-primary-50 dark:bg-primary-500/10 text-gray-800 dark:text-gray-100 font-medium">
                      12-hour (2:30 PM)
                    </button>
                    <button className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-100">
                      24-hour (14:30)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Number Format</label>
                  <select defaultValue="1,234.56" className="w-full px-4 py-3 rounded-xl bg-white/60 dark:bg-gray-800/60 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="1,234.56">1,234.56 (Comma separator, period decimal)</option>
                    <option value="1.234,56">1.234,56 (Period separator, comma decimal)</option>
                    <option value="1 234.56">1 234.56 (Space separator, period decimal)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiGlobe className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <div className="font-semibold text-gray-900 dark:text-white">Current Time</div>
                  </div>
                  <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{new Date().toLocaleString()}</div>
                </div>
              </div>
            </motion.div>
            )}

            {/* Security */}
            {settingsTab === 'security' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400">
                  <FiLock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Security</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account security settings</p>
                </div>
                {securitySection !== 'overview' && (
                  <button onClick={() => setSecuritySection('overview')} className="px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 text-sm font-medium transition-all">
                    ← Back
                  </button>
                )}
              </div>

              {securitySection === 'overview' && (
                <div className="space-y-3">
                  <button onClick={() => setSecuritySection('change-password')} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between group">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">Change Password</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Update your password regularly for security</div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </button>
                  <button onClick={() => setSecuritySection('2fa')} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between group">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="font-medium text-gray-800 dark:text-gray-100">Two-Factor Authentication</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${twoFactorEnabled ? 'bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-gray-500/10 text-gray-700 dark:text-gray-400'}`}>
                          {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Add an extra layer of security to your account</div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </button>
                  <button onClick={() => setSecuritySection('sessions')} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between group">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">Active Sessions</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">View and manage your active login sessions ({activeSessions.length})</div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </button>
                  <button onClick={() => setSecuritySection('privacy')} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between group">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">Privacy Settings</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Control your data and privacy preferences</div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </button>
                  <button onClick={() => setSecuritySection('recovery')} className="w-full text-left px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all flex items-center justify-between group">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">Account Recovery</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Set up recovery options for your account</div>
                    </div>
                    <FiChevronRight className="w-5 h-5 text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300" />
                  </button>
                </div>
              )}

              {/* Change Password Section */}
              {securitySection === 'change-password' && (
                <div className="space-y-6">
                  {passwordSuccess && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400 text-sm">
                      <FiCheckCircle className="w-5 h-5" />
                      <span>{passwordSuccess}</span>
                    </div>
                  )}
                  {passwordError && (
                    <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
                      <FiXCircle className="w-5 h-5" />
                      <span>{passwordError}</span>
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password (min 12 characters)"
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Must contain uppercase, lowercase, number, and special character</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Confirm New Password</label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                    />
                  </div>
                  <button
                    onClick={async () => {
                      setPasswordError('');
                      setPasswordSuccess('');
                      if (!currentPassword || !newPassword || !confirmPassword) {
                        setPasswordError('All fields are required');
                        return;
                      }
                      if (newPassword.length < 8) {
                        setPasswordError('Password must be at least 8 characters');
                        return;
                      }
                      if (newPassword !== confirmPassword) {
                        setPasswordError('Passwords do not match');
                        return;
                      }
                      
                      try {
                        await authAPI.changePassword({
                          current_password: currentPassword,
                          new_password: newPassword,
                        });
                        setPasswordSuccess('Password changed successfully!');
                        toast.success('Password updated successfully');
                        setCurrentPassword('');
                        setNewPassword('');
                        setConfirmPassword('');
                        setTimeout(() => setSecuritySection('overview'), 2000);
                      } catch (error: any) {
                        console.error('Password change error:', error);
                        setPasswordError(error.response?.data?.detail || 'Failed to change password');
                        toast.error(error.response?.data?.detail || 'Failed to change password');
                      }
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all"
                  >
                    Update Password
                  </button>
                </div>
              )}

              {/* Two-Factor Authentication Section */}
              {securitySection === '2fa' && (
                <div className="space-y-6">
                  {!twoFactorEnabled ? (
                    <>
                      <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Enable Two-Factor Authentication</h3>
                        <p className="text-gray-700 dark:text-gray-300 text-sm mb-4">
                          Two-Factor Authentication adds an extra layer of security by requiring a code from your phone in addition to your password.
                        </p>
                        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-start gap-2">
                            <FiCheckCircle className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                            <span>Download Google Authenticator or Authy on your phone</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FiCheckCircle className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                            <span>Scan the QR code with your authenticator app</span>
                          </div>
                          <div className="flex items-start gap-2">
                            <FiCheckCircle className="w-4 h-4 mt-0.5 text-blue-500 flex-shrink-0" />
                            <span>Enter the 6-digit code to verify</span>
                          </div>
                        </div>
                      </div>

                      {!showQRCode ? (
                        <button
                          onClick={() => {
                            const secret = generateTOTPSecret();
                            setTotpSecret(secret);
                            setShowQRCode(true);
                          }}
                          className="w-full px-6 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-medium transition-all"
                        >
                          Enable 2FA
                        </button>
                      ) : (
                        <>
                          <div className="text-center">
                            <div className="inline-block p-4 rounded-xl bg-white dark:bg-gray-800">
                              <QRCodeSVG 
                                value={`otpauth://totp/CITRICLOUD:${user?.email}?secret=${totpSecret}&issuer=CITRICLOUD`}
                                size={192}
                                level="H"
                                includeMargin={true}
                                className="rounded-lg"
                              />
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4">Scan this QR code with your authenticator app</p>
                            <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Secret Key: {totpSecret}</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Verification Code</label>
                            <input
                              type="text"
                              value={twoFactorCode}
                              onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                              placeholder="Enter 6-digit code"
                              className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 text-center text-2xl tracking-widest"
                              maxLength={6}
                            />
                          </div>
                          <button
                            onClick={async () => {
                              if (twoFactorCode.length === 6) {
                                try {
                                  // First verify the code with the backend before enabling
                                  const codes = ['ABCD-1234', 'EFGH-5678', 'IJKL-9012', 'MNOP-3456', 'QRST-7890'];
                                  
                                  // Save to backend with verification
                                  await profileAPI.updatePreferences({
                                    two_factor_enabled: true,
                                    totp_secret: totpSecret,
                                    backup_codes: codes,
                                    verify_code: twoFactorCode, // Send code for verification
                                  });
                                  
                                  // Only update local state if backend verification succeeds
                                  setTwoFactorEnabled(true);
                                  setBackupCodes(codes);
                                  setTwoFactorCode('');
                                  setShowQRCode(false);
                                  toast.success('Two-Factor Authentication enabled successfully');
                                } catch (error: any) {
                                  console.error('Failed to enable 2FA:', error);
                                  const errorMsg = error.response?.data?.detail || 'Invalid verification code or failed to save settings';
                                  toast.error(errorMsg);
                                  // Don't clear the code so user can try again
                                }
                              }
                            }}
                            disabled={twoFactorCode.length !== 6}
                            className="w-full px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Verify & Enable
                          </button>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="p-6 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                        <div className="flex items-center gap-3 mb-2">
                          <FiCheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">2FA Enabled</h3>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300 text-sm">
                          Your account is protected with Two-Factor Authentication.
                        </p>
                      </div>

                      {backupCodes.length > 0 && (
                        <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Backup Codes</h3>
                          <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                            Save these backup codes in a secure location. Each code can only be used once.
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {backupCodes.map((code, idx) => (
                              <div key={idx} className="px-4 py-2 rounded-lg bg-white dark:bg-gray-800 font-mono text-sm text-center">
                                {code}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={async () => {
                          if (confirm('Are you sure you want to disable Two-Factor Authentication?')) {
                            // Persist disable to database first
                            try {
                              await profileAPI.updatePreferences({
                                two_factor_enabled: false,
                                totp_secret: '',
                                backup_codes: [],
                              });
                              
                              setTwoFactorEnabled(false);
                              setBackupCodes([]);
                              setTotpSecret('');
                              setSecuritySection('overview');
                              toast.success('Two-Factor Authentication disabled');
                            } catch (error) {
                              console.error('Failed to disable 2FA:', error);
                              toast.error('Failed to disable 2FA. Please try again.');
                            }
                          }
                        }}
                        className="w-full px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
                      >
                        Disable 2FA
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Active Sessions Section */}
              {securitySection === 'sessions' && (
                <div className="space-y-4">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      These devices are currently logged into your account. If you see any unfamiliar devices, sign them out immediately.
                    </p>
                  </div>
                  {activeSessions.map((session) => (
                    <div key={session.id} className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{session.device}</h3>
                            {session.current && (
                              <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-700 dark:text-green-400 text-xs font-medium">
                                Current
                              </span>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                            <p>📍 {session.location}</p>
                            <p>🌐 IP: {session.ip}</p>
                            <p>⏰ Last active: {session.lastActive}</p>
                          </div>
                        </div>
                        {!session.current && (
                          <button
                            onClick={() => {
                              if (confirm('Sign out this device?')) {
                                setActiveSessions(sessions => sessions.filter(s => s.id !== session.id));
                              }
                            }}
                            className="px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 text-sm font-medium transition-all"
                          >
                            Sign Out
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      if (confirm('Sign out all other devices? You will remain logged in on this device.')) {
                        setActiveSessions(sessions => sessions.filter(s => s.current));
                      }
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-all"
                  >
                    Sign Out All Other Devices
                  </button>
                </div>
              )}

              {/* Privacy Settings Section */}
              {securitySection === 'privacy' && (
                <div className="space-y-6">
                  <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Control how your information is shared and used on CITRICLOUD.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Visibility</label>
                    <select
                      value={profileVisibility}
                      onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'friends' | 'private')}
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activity Visibility</label>
                    <select
                      value={activityVisibility}
                      onChange={(e) => setActivityVisibility(e.target.value as 'public' | 'friends' | 'private')}
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                    >
                      <option value="public">Public - Anyone can see</option>
                      <option value="friends">Friends Only</option>
                      <option value="private">Private - Only me</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">Data Sharing</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Share analytics to help improve CITRICLOUD</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={dataSharing} onChange={(e) => setDataSharing(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                    <div>
                      <div className="font-medium text-gray-800 dark:text-gray-100">Analytics</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Allow collection of usage data</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" checked={analyticsEnabled} onChange={(e) => setAnalyticsEnabled(e.target.checked)} className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                    </label>
                  </div>

                  <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                    <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <FiLock className="w-4 h-4" />
                      GDPR Compliance
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                      We comply with GDPR regulations. You have the right to:
                    </p>
                    <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                      <li>• Access your data</li>
                      <li>• Request data deletion</li>
                      <li>• Export your data</li>
                      <li>• Withdraw consent</li>
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      setSaveStatus('success');
                      setTimeout(() => {
                        setSaveStatus('idle');
                        setSecuritySection('overview');
                      }, 2000);
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all"
                  >
                    Enable Two-Factor Authentication
                  </button>
                </div>
              )}

              {/* Account Recovery Section */}
              {securitySection === 'recovery' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Account Recovery Options</h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Set up recovery methods to regain access if you forget your password or lose access to 2FA.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recovery Email</label>
                    <input
                      type="email"
                      value={recoveryEmail}
                      onChange={(e) => setRecoveryEmail(e.target.value)}
                      placeholder="recovery@example.com"
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Used for password reset and account recovery</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recovery Phone (Optional)</label>
                    <input
                      type="tel"
                      value={recoveryPhone}
                      onChange={(e) => setRecoveryPhone(e.target.value)}
                      placeholder="+31 6 12345678"
                      className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Receive SMS codes for account recovery</p>
                  </div>

                  <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Common Recovery Issues</h3>
                    
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">🔒 Locked Account</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          If your account is locked due to multiple failed login attempts:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                          <li>• Wait 30 minutes before trying again</li>
                          <li>• Check your email for security alerts</li>
                          <li>• Use the "Forgot Password" option</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">🔑 Forgotten Password</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          To reset your password:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                          <li>• Go to the login page</li>
                          <li>• Click "Forgot Password"</li>
                          <li>• Check your email for the reset link</li>
                          <li>• Create a new strong password</li>
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">📱 Lost 2FA Access</h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                          If you've lost access to your authenticator:
                        </p>
                        <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1 ml-4">
                          <li>• Use one of your backup codes</li>
                          <li>• Contact support with verification proof</li>
                          <li>• Complete identity verification</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      Still Need Help?
                    </h3>
                    <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                      If the above options don't help, contact our support team:
                    </p>
                    <a
                      href="mailto:support@citricloud.com"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
                    >
                      <FiMail className="w-5 h-5" />
                      Email Support: support@citricloud.com
                    </a>
                  </div>

                  <button
                    onClick={() => {
                      setSaveStatus('success');
                      setTimeout(() => {
                        setSaveStatus('idle');
                        setSecuritySection('overview');
                      }, 2000);
                    }}
                    className="w-full px-6 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-medium transition-all"
                  >
                    Save Recovery Options
                  </button>
                </div>
              )}
            </motion.div>
            )}

            {/* Privacy */}
            {settingsTab === 'privacy' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center text-purple-500 dark:text-purple-400">
                  <FiShield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Privacy & Data</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Control who can see your information</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Profile Visibility</label>
                  <select
                    value={profileVisibility}
                    onChange={(e) => setProfileVisibility(e.target.value as 'public' | 'friends' | 'private')}
                    className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private - Only me</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Activity Visibility</label>
                  <select
                    value={activityVisibility}
                    onChange={(e) => setActivityVisibility(e.target.value as 'public' | 'friends' | 'private')}
                    className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100"
                  >
                    <option value="public">Public - Anyone can see</option>
                    <option value="friends">Friends Only</option>
                    <option value="private">Private - Only me</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">Data Sharing</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Share analytics to help improve CITRICLOUD</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={dataSharing} onChange={(e) => setDataSharing(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">Analytics</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Allow collection of usage data</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={analyticsEnabled} onChange={(e) => setAnalyticsEnabled(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {/* Cookie Preferences */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Cookie Preferences</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Essential Cookies</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Required for site functionality</div>
                      </div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">Always On</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Analytics Cookies</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Help us improve performance</div>
                      </div>
                      <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Marketing Cookies</div>
                        <div className="text-xs text-gray-600 dark:text-gray-400">Personalized content and ads</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                    </div>
                  </div>
                </div>

                {/* Blocked Users */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Blocked Users</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">Blocked users cannot contact you or see your profile</p>
                  <div className="text-center py-6">
                    <FiUser className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No blocked users</p>
                  </div>
                </div>

                {/* Search Privacy */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Search & Indexing</h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Allow Search Engines</div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">Let search engines index your public profile</div>
                    </div>
                    <input type="checkbox" defaultChecked className="w-5 h-5 rounded border-gray-300 text-primary-500 focus:ring-primary-500" />
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiLock className="w-4 h-4" />
                    GDPR Compliance
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                    We comply with GDPR regulations. You have the right to:
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-4">
                    <li>• Access your data</li>
                    <li>• Request data deletion</li>
                    <li>• Export your data</li>
                    <li>• Withdraw consent</li>
                  </ul>
                  <button className="w-full px-4 py-2 rounded-lg bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-sm font-medium text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-700 transition-all">
                    Request Data Deletion
                  </button>
                </div>
              </div>
            </motion.div>
            )}

            {/* Accessibility */}
            {settingsTab === 'accessibility' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center text-indigo-500 dark:text-indigo-400">
                  <FiUser className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Accessibility</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Customize display and navigation options</p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Text Size</label>
                  <div className="grid grid-cols-4 gap-3">
                    <button
                      onClick={() => setFontSize('small')}
                      className={`p-4 rounded-xl border transition-all ${fontSize === 'small' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <div className="text-xs font-medium text-gray-800 dark:text-gray-100">Small</div>
                    </button>
                    <button
                      onClick={() => setFontSize('medium')}
                      className={`p-4 rounded-xl border transition-all ${fontSize === 'medium' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <div className="text-sm font-medium text-gray-800 dark:text-gray-100">Medium</div>
                    </button>
                    <button
                      onClick={() => setFontSize('large')}
                      className={`p-4 rounded-xl border transition-all ${fontSize === 'large' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <div className="text-base font-medium text-gray-800 dark:text-gray-100">Large</div>
                    </button>
                    <button
                      onClick={() => setFontSize('extra-large')}
                      className={`p-4 rounded-xl border transition-all ${fontSize === 'extra-large' ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10' : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'}`}
                    >
                      <div className="text-lg font-medium text-gray-800 dark:text-gray-100">X-Large</div>
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">High Contrast Mode</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Increase visual contrast for better readability</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">Reduce Motion</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Minimize animations and transitions</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={reduceMotion} onChange={(e) => setReduceMotion(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50">
                  <div>
                    <div className="font-medium text-gray-800 dark:text-gray-100">Screen Reader Support</div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">Optimize for screen reader navigation</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={screenReader} onChange={(e) => setScreenReader(e.target.checked)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-500"></div>
                  </label>
                </div>

                {/* Keyboard Navigation */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Keyboard Shortcuts</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Search</span>
                      <kbd className="px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-mono text-xs">Ctrl + K</kbd>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Toggle Theme</span>
                      <kbd className="px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-mono text-xs">Ctrl + Shift + D</kbd>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-gray-600 dark:text-gray-400">Navigate Sections</span>
                      <kbd className="px-2 py-1 rounded bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-mono text-xs">Tab / Shift + Tab</kbd>
                    </div>
                  </div>
                </div>

                {/* Color Blindness Support */}
                <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Color Vision</h3>
                  <select defaultValue="normal" className="w-full px-4 py-3 rounded-xl bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-100">
                    <option value="normal">Normal Vision</option>
                    <option value="protanopia">Protanopia (Red-Blind)</option>
                    <option value="deuteranopia">Deuteranopia (Green-Blind)</option>
                    <option value="tritanopia">Tritanopia (Blue-Blind)</option>
                    <option value="achromatopsia">Achromatopsia (Total Color Blind)</option>
                  </select>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <div className="flex items-center gap-2 mb-2">
                    <FiUser className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">Accessibility Info</h3>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    These settings improve accessibility for users with visual or motor impairments. Changes will be saved to your preferences.
                  </p>
                </div>
              </div>
            </motion.div>
            )}

            {/* Data & Storage */}
            {settingsTab === 'data' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/10 dark:bg-cyan-500/20 flex items-center justify-center text-cyan-500 dark:text-cyan-400">
                  <FiActivity className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Data & Storage</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your data and storage usage</p>
                </div>
              </div>

              <div className="space-y-6">
                {/* Storage Overview */}
                <div className="p-6 rounded-xl bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-900/20 dark:to-blue-900/20 border border-cyan-200 dark:border-cyan-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Storage Overview</h3>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Used Storage</span>
                      <span className="text-lg font-bold text-gray-800 dark:text-gray-100">2.4 GB / 10 GB</span>
                    </div>
                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{width: '24%'}}></div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="text-gray-600 dark:text-gray-400">Files</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">1.8 GB</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="text-gray-600 dark:text-gray-400">Messages</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">350 MB</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="text-gray-600 dark:text-gray-400">Cache</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">{cacheSize}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/50 dark:bg-gray-800/50">
                      <div className="text-gray-600 dark:text-gray-400">Other</div>
                      <div className="text-lg font-bold text-gray-800 dark:text-gray-100">150 MB</div>
                    </div>
                  </div>
                </div>

                {/* Clear Cache */}
                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Clear Data</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Browser Cache</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">{cacheSize}</span>
                    </div>
                    <button
                      onClick={async () => {
                        if (!confirm('Clear all cached data? This may temporarily slow down the application.')) return;
                        try {
                          await profileAPI.updatePreferences({ clear_cache: true });
                          setCacheSize('0 MB');
                          toast.success('Cache cleared successfully');
                        } catch (error) {
                          toast.error('Failed to clear cache');
                        }
                      }}
                      className="w-full px-4 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 font-medium transition-all"
                    >
                      Clear Cache
                    </button>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Data Retention</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Control how long your data is stored.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Activity History</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">90 days</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Message History</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">1 year</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-white dark:bg-gray-900">
                      <span className="text-sm text-gray-600 dark:text-gray-400">File Uploads</span>
                      <span className="text-sm font-medium text-gray-800 dark:text-gray-100">Unlimited</span>
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Download Your Data</h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Export all your data including profile, messages, and activity history. Data will be provided in JSON format for easy portability.
                  </p>
                  <button
                    onClick={async () => {
                      try {
                        setDownloadingData(true);
                        // Export comprehensive data from local state
                        const exportData = {
                          profile: user,
                          preferences: {
                            theme_mode: mode,
                            theme_auto_source: autoSource,
                            language,
                            notifications: { email: emailNotifications, push: pushNotifications, marketing: marketingEmails },
                            privacy: { profile_visibility: profileVisibility, activity_visibility: activityVisibility, data_sharing: dataSharing, analytics_enabled: analyticsEnabled },
                            accessibility: { font_size: fontSize, high_contrast: highContrast, reduce_motion: reduceMotion, screen_reader: screenReader },
                          },
                          exported_at: new Date().toISOString(),
                          export_version: '1.0',
                        };
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
                        const url = window.URL.createObjectURL(blob);
                        const link = document.createElement('a');
                        link.href = url;
                        link.download = `citricloud-data-${new Date().toISOString().split('T')[0]}.json`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        window.URL.revokeObjectURL(url);
                        toast.success('Data exported successfully');
                      } catch (error) {
                        toast.error('Failed to export data');
                      } finally {
                        setDownloadingData(false);
                      }
                    }}
                    disabled={downloadingData}
                    className="flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiDownload className="w-5 h-5" />
                    {downloadingData ? 'Exporting...' : 'Download Data'}
                  </button>
                </div>
              </div>
            </motion.div>
            )}

            {/* Account Management */}
            {settingsTab === 'account' && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl mb-6 bg-white/85 dark:bg-gray-800/95 border border-white/30 dark:border-gray-700/60 shadow-sm dark:shadow-[0_0_0_1px_rgba(255,255,255,0.05)] backdrop-blur-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center text-red-500 dark:text-red-400">
                  <FiAlertCircle className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Account Management</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your account settings</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="p-6 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    Deactivate Account
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Temporarily deactivate your account. You can reactivate it anytime by logging in.
                  </p>
                  <button
                    className="px-6 py-3 rounded-xl bg-yellow-600 hover:bg-yellow-700 text-white font-medium transition-all"
                    onClick={() => toast.info('Account deactivation feature coming soon')}
                  >
                    Deactivate Account
                  </button>
                </div>

                <div className="p-6 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700">
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                    <FiAlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                    Delete Account
                  </h3>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 text-white font-medium transition-all"
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            </motion.div>
            )}

            {/* Save Preferences */}
            <div className="flex items-center justify-between">
              {saveStatus !== 'idle' && (
                <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm ${saveStatus === 'success' ? 'bg-green-50 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                  {saveStatus === 'success' ? <FiCheckCircle /> : <FiXCircle />}
                  <span>{saveStatus === 'success' ? 'Settings saved successfully' : 'Failed to save settings'}</span>
                </div>
              )}
              <button onClick={handleSavePreferences} className="ml-auto glass-button px-8 py-3 rounded-xl text-white font-medium">Save Preferences</button>
            </div>
          </>
          )}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-md w-full shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 dark:bg-red-500/20 flex items-center justify-center">
                <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Delete Account?</h3>
            </div>
            <p className="text-gray-700 dark:text-gray-300 mb-6">
              This action is permanent and cannot be undone. All your data, including messages, files, and settings will be permanently deleted.
            </p>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Type <span className="font-bold text-red-600 dark:text-red-400">DELETE</span> to confirm
              </label>
              <input
                type="text"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100"
                placeholder="Type DELETE"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                }}
                className="flex-1 px-6 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-100 font-medium transition-all"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  if (deleteConfirmation === 'DELETE') {
                    try {
                      await authAPI.deleteAccount();
                      toast.success('Account deleted successfully');
                      logout();
                      window.location.href = '/';
                    } catch (error) {
                      toast.error('Failed to delete account');
                    }
                  } else {
                    toast.error('Please type DELETE to confirm');
                  }
                }}
                disabled={deleteConfirmation !== 'DELETE'}
                className="flex-1 px-6 py-3 rounded-xl bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 text-white font-medium transition-all disabled:cursor-not-allowed"
              >
                Delete Account
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Invite User to Shared Email Modal */}
      <AnimatePresence>
        {showInviteUser && selectedSharedEmail && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={() => {
              setShowInviteUser(false);
              setInviteUserEmail('');
              setSharedEmailError('');
            }}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full border border-gray-200 dark:border-gray-700"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <FiUsers className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Invite User</h3>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Add a user to <strong>{selectedSharedEmail.full_email}</strong>
              </p>
              {sharedEmailError && (
                <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 text-sm">
                  <FiXCircle />
                  <span>{sharedEmailError}</span>
                </div>
              )}
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  User Email Address
                </label>
                <input
                  type="email"
                  value={inviteUserEmail}
                  onChange={(e) => setInviteUserEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="w-full glass-input dark:bg-gray-700/70 dark:border-gray-600 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={async () => {
                    if (!inviteUserEmail) {
                      setSharedEmailError('Please enter an email address');
                      return;
                    }
                    try {
                      await sharedEmailAPI.addMember(selectedSharedEmail.id, {
                        user_email: inviteUserEmail
                      });
                      setSharedEmailSuccess('User invited successfully');
                      setShowInviteUser(false);
                      setInviteUserEmail('');
                      setSharedEmailError('');
                      await loadSharedEmails();
                      setTimeout(() => setSharedEmailSuccess(''), 3000);
                    } catch (error: any) {
                      const errorMsg = error.response?.data?.detail || 'Failed to invite user';
                      setSharedEmailError(errorMsg);
                    }
                  }}
                  disabled={!inviteUserEmail}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium transition-colors"
                >
                  Send Invite
                </button>
                <button
                  onClick={() => {
                    setShowInviteUser(false);
                    setInviteUserEmail('');
                    setSharedEmailError('');
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
