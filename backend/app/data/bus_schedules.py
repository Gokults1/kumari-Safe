"""
Comprehensive Bus Schedule Database for Kanniyakumari District
Covers KSRTC (Kerala State Road Transport Corporation) and TNSTC / SETC (Tamil Nadu State Transport Corporation).
Includes routes departing from and arriving at Nagercoil Vadasery, Kanyakumari, Marthandam, Thuckalay, and Kaliyakkavilai.
"""

BUS_HUBS = {
    "VADASERY": {"code": "VADASERY", "name": "Nagercoil Christopher Bus Stand (Vadasery)", "lat": 8.1923, "lon": 77.4300},
    "ANNA": {"code": "ANNA", "name": "Nagercoil Anna Bus Stand (Meenakshipuram)", "lat": 8.1812, "lon": 77.4332},
    "CAPE": {"code": "CAPE", "name": "Kanyakumari Bus Stand", "lat": 8.0864, "lon": 77.5502},
    "MRTD": {"code": "MRTD", "name": "Marthandam New Bus Stand", "lat": 8.3039, "lon": 77.2185},
    "THUCK": {"code": "THUCK", "name": "Thuckalay Bus Stand", "lat": 8.2482, "lon": 77.3298},
    "KLKV": {"code": "KLKV", "name": "Kaliyakkavilai Bus Stand (Border)", "lat": 8.3262, "lon": 77.1601},
}

BUS_DESTINATION_KEYWORDS = {
    "trivandrum": ["TVC", "THIRUVANANTHAPURAM", "TRIVANDRUM", "THAMPANOOR", "ATTINGAL", "NEYYATTINKARA", "PARASALA", "BALARAMAPURAM"],
    "ernakulam": ["ERS", "ERN", "ERNAKULAM", "KOCHI", "COCHIN", "ALUVA", "VYTILLA", "EDAPPALLY"],
    "kollam": ["QLN", "KOLLAM", "QUILON", "KAYAMKULAM", "KARUNAGAPPALLY", "KOTTARAKKARA"],
    "alappuzha": ["ALLP", "ALAPPUZHA", "ALLEPPEY", "CHERTHALA", "HARIPAD", "AMBALAPUZHA"],
    "kozhikode": ["CLT", "KOZHIKODE", "CALICUT", "MALAPPURAM", "KOTTAKKAL", "EDAPPAL"],
    "thrissur": ["TCR", "THRISSUR", "TRICHUR", "GURUVAYUR", "CHALAKUDY"],
    "kottayam": ["KTYM", "KOTTAYAM", "CHENGANNUR", "TIRUVALLA", "CHANGANASSERY", "ADOOR"],
    "palakkad": ["PGT", "PALAKKAD", "PALGHAT", "VADAKKENCHERRY"],
    "marthandam": ["MARTHANDAM", "KUZHITHURAI", "MRTD"],
    "thuckalay": ["THUCKALAY", "PADMANABHAPURAM", "VILLUKURI", "CHUNKANKADAI"],
    "kaliyakkavilai": ["KALIYAKKAVILAI", "PARASSALA", "BORDER"],
    "chennai": ["CHENNAI", "EGMORE", "CENTRAL", "KOYAMBEDU", "CMBT", "KILAMBAKKAM", "KCBT", "TAMBARAM", "PERUNGALATHUR"],
    "madurai": ["MADURAI", "MATTUTHAVANI", "ARAPPALAYAM", "VIRUDHUNAGAR", "DINDIGUL"],
    "tirunelveli": ["TIRUNELVELI", "NELLAI", "VALLIYUR", "NANGUNERI", "PANAGUDI", "KOVILPATTI", "SATTUR"],
    "coimbatore": ["COIMBATORE", "CBE", "GANDHIPURAM", "TIRUPPUR", "POLLACHI", "DHARAPURAM"],
    "bangalore": ["BENGALURU", "BANGALORE", "SHANTHINAGAR", "MAJESTIC", "ELECTRONIC CITY", "SILK BOARD", "HOSUR", "SALEM"],
    "kanyakumari": ["KANYAKUMARI", "CAPE", "SUCHINDRAM", "AGASTEESWARAM"],
    "nagercoil": ["NAGERCOIL", "VADASERY", "ANNA STAND", "KOTTAR"],
    "tiruchendur": ["TIRUCHENDUR", "THISAYANVILAI", "UDANGUDI", "ANJUGRAMAM"],
    "rameswaram": ["RAMESWARAM", "RAMANATHAPURAM", "TUTICORIN", "THOOTHUKUDI"],
    "colachel": ["COLACHEL", "KULACHEL", "THINGALNAGAR", "MONDAY MARKET"]
}

BUS_SCHEDULES = [
    # ========================================================
    # ===== KSRTC KERALA GOVT BUSES (From Nagercoil / Kanyakumari) =====
    # ========================================================
    {
        "route_number": "KSRTC-TRV-FP",
        "bus_name": "Kanyakumari / Nagercoil - Trivandrum Fast Passenger",
        "agency": "KSRTC",
        "bus_type": "Fast Passenger (FP)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Christopher Bus Stand (Vadasery)",
        "to_station": "Trivandrum Central (Thampanoor)",
        "departure": "05:00 AM - 10:30 PM",
        "arrival": "2.5 Hours Journey",
        "frequency": "Every 20-30 mins (Continuous High Frequency)",
        "fare": "₹75 - ₹95",
        "kanniyakumari_station": "Vadasery / Thuckalay / Marthandam",
        "stops": [
            "Kanyakumari Stand", "Nagercoil Vadasery", "Chunkankadai", "Villukuri",
            "Thuckalay", "Marthandam New Stand", "Kaliyakkavilai Border", "Parasala",
            "Neyyattinkara", "Balaramapuram", "Pravachambalam", "Trivandrum Central (Thampanoor)"
        ],
        "destination_keywords": ["trivandrum", "thiruvananthapuram", "thampanoor", "marthandam", "thuckalay", "kaliyakkavilai", "neyyattinkara", "parasala", "balaramapuram"]
    },
    {
        "route_number": "KSRTC-TRV-SF01",
        "bus_name": "Nagercoil - Trivandrum Super Fast",
        "agency": "KSRTC",
        "bus_type": "Super Fast (SF)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Trivandrum Central (Thampanoor)",
        "departure": "06:15 AM",
        "arrival": "08:15 AM",
        "frequency": "Hourly Daily",
        "fare": "₹95",
        "kanniyakumari_station": "Vadasery / Marthandam",
        "stops": [
            "Nagercoil Vadasery 06:15", "Thuckalay 06:40", "Marthandam 07:00",
            "Kaliyakkavilai 07:15", "Neyyattinkara 07:45", "Trivandrum Thampanoor 08:15"
        ],
        "destination_keywords": ["trivandrum", "thiruvananthapuram", "thampanoor", "marthandam", "thuckalay", "kaliyakkavilai", "neyyattinkara"]
    },
    {
        "route_number": "KSRTC-TRV-SF02",
        "bus_name": "Kanyakumari - Trivandrum Super Fast",
        "agency": "KSRTC",
        "bus_type": "Super Fast (SF)",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Central Bus Stand",
        "to_station": "Trivandrum Central (Thampanoor)",
        "departure": "07:30 AM",
        "arrival": "10:00 AM",
        "frequency": "Daily",
        "fare": "₹110",
        "kanniyakumari_station": "Kanyakumari / Vadasery / Marthandam",
        "stops": [
            "Kanyakumari 07:30", "Nagercoil Vadasery 08:00", "Thuckalay 08:30",
            "Marthandam 08:50", "Kaliyakkavilai 09:05", "Neyyattinkara 09:30", "Trivandrum Central 10:00"
        ],
        "destination_keywords": ["trivandrum", "thiruvananthapuram", "thampanoor", "kanyakumari", "marthandam", "thuckalay", "kaliyakkavilai"]
    },
    {
        "route_number": "KSRTC-EKM-SWIFT",
        "bus_name": "Kanyakumari - Ernakulam KSRTC Swift Deluxe",
        "agency": "KSRTC",
        "bus_type": "KSRTC Swift Deluxe (Air Suspension)",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Bus Stand",
        "to_station": "Ernakulam (KSRTC Central Stand / Vytilla Hub)",
        "departure": "06:15 AM",
        "arrival": "01:30 PM",
        "frequency": "Daily",
        "fare": "₹340",
        "kanniyakumari_station": "Kanyakumari / Vadasery / Marthandam",
        "stops": [
            "Kanyakumari 06:15", "Nagercoil Vadasery 06:45", "Marthandam 07:25",
            "Trivandrum Central 08:35", "Attingal 09:15", "Kollam 10:15",
            "Kayamkulam 11:00", "Alappuzha 12:00", "Cherthala 12:40", "Ernakulam Vytilla 13:30"
        ],
        "destination_keywords": ["ernakulam", "kochi", "trivandrum", "kollam", "alappuzha", "kayamkulam", "cherthala", "marthandam"]
    },
    {
        "route_number": "KSRTC-EKM-SF01",
        "bus_name": "Nagercoil - Ernakulam Super Fast",
        "agency": "KSRTC",
        "bus_type": "Super Fast (SF)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Ernakulam (South Bus Stand)",
        "departure": "09:00 AM",
        "arrival": "04:30 PM",
        "frequency": "Daily",
        "fare": "₹280",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil Vadasery 09:00", "Marthandam 09:40", "Trivandrum Central 10:45",
            "Kollam 12:15", "Kayamkulam 13:00", "Alappuzha 14:15", "Ernakulam 16:30"
        ],
        "destination_keywords": ["ernakulam", "kochi", "trivandrum", "kollam", "alappuzha", "kayamkulam", "marthandam"]
    },
    {
        "route_number": "KSRTC-EKM-SF02",
        "bus_name": "Kanyakumari - Ernakulam Evening Super Fast",
        "agency": "KSRTC",
        "bus_type": "Super Fast (SF)",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Central Stand",
        "to_station": "Ernakulam",
        "departure": "05:00 PM",
        "arrival": "11:45 PM",
        "frequency": "Daily",
        "fare": "₹290",
        "kanniyakumari_station": "Kanyakumari / Vadasery",
        "stops": [
            "Kanyakumari 05:00", "Nagercoil Vadasery 05:30", "Marthandam 06:15",
            "Trivandrum Central 07:30", "Kollam 09:00", "Alappuzha 10:30", "Ernakulam 11:45"
        ],
        "destination_keywords": ["ernakulam", "kochi", "trivandrum", "kollam", "alappuzha", "marthandam"]
    },
    {
        "route_number": "KSRTC-KTM-SF",
        "bus_name": "Nagercoil - Kottayam Super Fast",
        "agency": "KSRTC",
        "bus_type": "Super Fast (SF)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Kottayam KSRTC Bus Stand",
        "departure": "07:00 AM",
        "arrival": "01:00 PM",
        "frequency": "Daily",
        "fare": "₹220",
        "kanniyakumari_station": "Nagercoil Vadasery / Marthandam",
        "stops": [
            "Nagercoil Vadasery 07:00", "Marthandam 07:40", "Trivandrum Central 08:45",
            "Venjaramoodu 09:30", "Kottarakkara 10:30", "Adoor 11:15", "Chengannur 11:50", "Tiruvalla 12:15", "Kottayam 13:00"
        ],
        "destination_keywords": ["kottayam", "trivandrum", "kottarakkara", "adoor", "chengannur", "tiruvalla", "marthandam"]
    },
    {
        "route_number": "KSRTC-CLT-MINNAL",
        "bus_name": "Nagercoil - Kozhikode Minnal Lightning Express",
        "agency": "KSRTC",
        "bus_type": "Minnal Super Deluxe (Night Express)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Kozhikode (Calicut KSRTC Stand)",
        "departure": "08:30 PM",
        "arrival": "06:15 AM +1",
        "frequency": "Daily Night Express",
        "fare": "₹520",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil Vadasery 20:30", "Marthandam 21:10", "Trivandrum Central 22:15",
            "Kollam 23:45", "Alappuzha 01:15", "Ernakulam Vytilla 02:30",
            "Thrissur 03:45", "Kottakkal 05:15", "Kozhikode (Calicut) 06:15"
        ],
        "destination_keywords": ["kozhikode", "calicut", "ernakulam", "thrissur", "kollam", "alappuzha", "trivandrum", "malappuram"]
    },
    {
        "route_number": "KSRTC-GUR-SF",
        "bus_name": "Nagercoil - Guruvayur Super Fast",
        "agency": "KSRTC",
        "bus_type": "Super Fast (SF)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Guruvayur Temple Bus Stand",
        "departure": "01:30 PM",
        "arrival": "10:30 PM",
        "frequency": "Daily",
        "fare": "₹360",
        "kanniyakumari_station": "Nagercoil Vadasery / Marthandam",
        "stops": [
            "Nagercoil Vadasery 13:30", "Marthandam 14:15", "Trivandrum Central 15:30",
            "Kollam 17:00", "Alappuzha 18:30", "Ernakulam 20:00", "Thrissur 21:30", "Guruvayur 22:30"
        ],
        "destination_keywords": ["guruvayur", "thrissur", "ernakulam", "alappuzha", "kollam", "trivandrum"]
    },
    {
        "route_number": "KSRTC-PLK-SF",
        "bus_name": "Nagercoil - Palakkad Super Fast",
        "agency": "KSRTC",
        "bus_type": "Super Fast (SF)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Palakkad KSRTC Stand",
        "departure": "07:45 AM",
        "arrival": "05:15 PM",
        "frequency": "Daily",
        "fare": "₹380",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil 07:45", "Trivandrum 09:30", "Kottarakkara 11:00",
            "Kottayam 12:45", "Muvattupuzha 14:00", "Thrissur 15:30", "Palakkad 17:15"
        ],
        "destination_keywords": ["palakkad", "thrissur", "kottayam", "trivandrum", "kottarakkara"]
    },
    {
        "route_number": "KSRTC-BLR-SWIFT",
        "bus_name": "Kanyakumari - Bengaluru KSRTC Swift Gajaraj Sleeper",
        "agency": "KSRTC",
        "bus_type": "Swift Gajaraj AC Sleeper",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Central Stand",
        "to_station": "Bengaluru (Shanthinagar / Majestic)",
        "departure": "06:30 PM",
        "arrival": "07:15 AM +1",
        "frequency": "Daily Night AC Sleeper",
        "fare": "₹1,150",
        "kanniyakumari_station": "Kanyakumari / Nagercoil Vadasery",
        "stops": [
            "Kanyakumari 18:30", "Nagercoil Vadasery 19:10", "Tirunelveli 20:30",
            "Madurai 22:30", "Dindigul 23:30", "Salem 02:30", "Hosur 05:45",
            "Electronic City 06:15", "Silk Board 06:45", "Bengaluru Majestic 07:15"
        ],
        "destination_keywords": ["bangalore", "bengaluru", "salem", "madurai", "tirunelveli", "hosur"]
    },

    # ========================================================
    # ===== TNSTC & SETC TAMIL NADU GOVT BUSES =====
    # ========================================================
    {
        "route_number": "SETC-MS-01",
        "bus_name": "Nagercoil - Chennai SETC Non-Stop Ultra Deluxe",
        "agency": "SETC (TN Govt)",
        "bus_type": "Ultra Deluxe (2+2 Push Back)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Christopher Bus Stand (Vadasery)",
        "to_station": "Chennai Kilambakkam (KCBT) / Koyambedu (CMBT)",
        "departure": "04:30 PM",
        "arrival": "05:45 AM +1",
        "frequency": "Daily Afternoon / Night",
        "fare": "₹680",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil Vadasery 16:30", "Valliyur 17:15", "Tirunelveli 18:15",
            "Madurai Bypass 20:45", "Trichy Tollgate 23:30", "Villupuram 02:30",
            "Chengalpattu 04:30", "Tambaram 05:15", "Chennai KCBT / CMBT 05:45"
        ],
        "destination_keywords": ["chennai", "madurai", "trichy", "villupuram", "tirunelveli", "tambaram", "chengalpattu"]
    },
    {
        "route_number": "SETC-MS-02",
        "bus_name": "Kanyakumari - Chennai SETC AC Sleeper",
        "agency": "SETC (TN Govt)",
        "bus_type": "AC Sleeper (2+1)",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Bus Stand",
        "to_station": "Chennai Kilambakkam (KCBT)",
        "departure": "05:30 PM",
        "arrival": "06:30 AM +1",
        "frequency": "Daily Night AC Sleeper",
        "fare": "₹990",
        "kanniyakumari_station": "Kanyakumari / Nagercoil Vadasery",
        "stops": [
            "Kanyakumari 17:30", "Nagercoil Vadasery 18:15", "Tirunelveli 19:30",
            "Madurai Bypass 22:00", "Trichy 00:30", "Villupuram 03:30",
            "Tambaram 05:45", "Chennai KCBT 06:30"
        ],
        "destination_keywords": ["chennai", "kanyakumari", "madurai", "trichy", "villupuram", "tambaram"]
    },
    {
        "route_number": "TNSTC-MDU-FREQ",
        "bus_name": "Nagercoil - Madurai TNSTC Superfast",
        "agency": "TNSTC",
        "bus_type": "Superfast 3+2",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Madurai Mattuthavani Bus Stand",
        "departure": "04:30 AM - 11:30 PM",
        "arrival": "4.5 Hours Journey",
        "frequency": "Every 15-20 mins (24x7 High Frequency)",
        "fare": "₹165",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil Vadasery", "Panagudi", "Valliyur", "Nanguneri",
            "Tirunelveli New Bus Stand", "Kayathar", "Kovilpatti", "Sattur",
            "Virudhunagar", "Madurai Mattuthavani"
        ],
        "destination_keywords": ["madurai", "tirunelveli", "kovilpatti", "sattur", "virudhunagar", "valliyur"]
    },
    {
        "route_number": "TNSTC-TEN-FREQ",
        "bus_name": "Nagercoil - Tirunelveli Point-to-Point Express",
        "agency": "TNSTC",
        "bus_type": "Point-to-Point Non-Stop Express",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Tirunelveli Junction / New Bus Stand",
        "departure": "Round-the-clock 24x7",
        "arrival": "1.5 Hours Journey",
        "frequency": "Every 10 mins (Non-Stop / Point-to-Point)",
        "fare": "₹60",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil Vadasery", "Aralvaimozhi", "Panagudi", "Valliyur Bypass", "Nanguneri", "Tirunelveli New Stand"
        ],
        "destination_keywords": ["tirunelveli", "nellai", "valliyur", "panagudi", "aralvaimozhi"]
    },
    {
        "route_number": "TNSTC-CBE-01",
        "bus_name": "Nagercoil - Coimbatore TNSTC Ultra Deluxe",
        "agency": "TNSTC",
        "bus_type": "Ultra Deluxe (Push Back)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Coimbatore Gandhipuram Bus Stand",
        "departure": "08:30 AM, 01:30 PM, 08:30 PM, 09:45 PM",
        "arrival": "8 Hours Journey",
        "frequency": "4 Daily Trips (Morning, Noon & Night)",
        "fare": "₹420",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil Vadasery", "Tirunelveli", "Madurai", "Dindigul",
            "Ottanchathiram", "Dharapuram", "Tiruppur Bypass", "Coimbatore Gandhipuram"
        ],
        "destination_keywords": ["coimbatore", "tiruppur", "dharapuram", "dindigul", "madurai", "tirunelveli"]
    },
    {
        "route_number": "SETC-BLR-01",
        "bus_name": "Kanyakumari / Nagercoil - Bengaluru SETC AC Sleeper",
        "agency": "SETC (TN Govt)",
        "bus_type": "AC Sleeper (2+1)",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Central Stand",
        "to_station": "Bengaluru (Shanthinagar Bus Station)",
        "departure": "05:00 PM",
        "arrival": "06:45 AM +1",
        "frequency": "Daily Night AC Sleeper",
        "fare": "₹1,020",
        "kanniyakumari_station": "Kanyakumari / Nagercoil Vadasery",
        "stops": [
            "Kanyakumari 17:00", "Nagercoil Vadasery 17:45", "Tirunelveli 19:00",
            "Madurai 21:15", "Dindigul 22:15", "Salem 01:30", "Hosur 05:15",
            "Electronic City 05:45", "Bengaluru Shanthinagar 06:45"
        ],
        "destination_keywords": ["bangalore", "bengaluru", "salem", "madurai", "tirunelveli", "hosur"]
    },
    {
        "route_number": "TNSTC-TCR-FREQ",
        "bus_name": "Nagercoil - Tiruchendur Express",
        "agency": "TNSTC",
        "bus_type": "Express",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Tiruchendur Temple Bus Stand",
        "departure": "05:30 AM - 08:30 PM",
        "arrival": "2.5 Hours Journey",
        "frequency": "Every 30 mins",
        "fare": "₹70",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil Vadasery", "Anjugramam", "Koodankulam", "Radhapuram",
            "Thisayanvilai", "Udangudi", "Tiruchendur Murugan Temple"
        ],
        "destination_keywords": ["tiruchendur", "thisayanvilai", "udangudi", "radhapuram", "anjugramam"]
    },
    {
        "route_number": "TNSTC-RMM-01",
        "bus_name": "Kanyakumari - Rameswaram TNSTC Express",
        "agency": "TNSTC",
        "bus_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Bus Stand",
        "to_station": "Rameswaram Temple Bus Stand",
        "departure": "06:00 AM & 02:00 PM",
        "arrival": "7 Hours Journey",
        "frequency": "2 Daily Direct Trips",
        "fare": "₹280",
        "kanniyakumari_station": "Kanyakumari / Nagercoil Vadasery",
        "stops": [
            "Kanyakumari 06:00", "Nagercoil Vadasery 06:45", "Tirunelveli 08:00",
            "Tuticorin 09:15", "Sayalkudi 10:45", "Ramanathapuram 11:45", "Mandapam 12:30", "Rameswaram 13:00"
        ],
        "destination_keywords": ["rameswaram", "ramanathapuram", "tuticorin", "thoothukudi", "tirunelveli"]
    },
    {
        "route_number": "TNSTC-CAPE-CITY",
        "bus_name": "Nagercoil Anna Stand - Kanyakumari Beach (City Bus 1 & 2)",
        "agency": "TNSTC",
        "bus_type": "City Bus (Route 1 / 2)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Anna Stand",
        "from_station_name": "Nagercoil Anna Bus Stand",
        "to_station": "Kanyakumari Beach / Vivekananda Rock",
        "departure": "05:00 AM - 10:30 PM",
        "arrival": "40 Minutes Journey",
        "frequency": "Every 5-10 mins (Non-Stop Frequent City Service)",
        "fare": "₹15",
        "kanniyakumari_station": "Anna Stand / Kottar / Suchindram / Kanyakumari",
        "stops": [
            "Nagercoil Anna Stand", "Kottar Police Station", "Edalakudy",
            "Suchindram Temple", "Vazhukkamparai", "Agasteeswaram", "Kovalam", "Kanyakumari Beach"
        ],
        "destination_keywords": ["kanyakumari", "suchindram", "kottar", "nagercoil", "agasteeswaram"]
    },
    {
        "route_number": "TNSTC-MRTD-301",
        "bus_name": "Nagercoil Vadasery - Marthandam - Kaliyakkavilai (District 301)",
        "agency": "TNSTC",
        "bus_type": "District Express (Route 301 / 302)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Kaliyakkavilai Border Bus Stand",
        "departure": "05:00 AM - 10:45 PM",
        "arrival": "1 Hour 15 Mins",
        "frequency": "Every 10 mins (Continuous High Frequency)",
        "fare": "₹32",
        "kanniyakumari_station": "Vadasery / Thuckalay / Marthandam / Kaliyakkavilai",
        "stops": [
            "Nagercoil Vadasery", "Chunkankadai", "Villukuri", "Thuckalay",
            "Padmanabhapuram", "Marthandam", "Kuzhithurai", "Kaliyakkavilai"
        ],
        "destination_keywords": ["marthandam", "thuckalay", "kaliyakkavilai", "padmanabhapuram", "kuzhithurai"]
    },
    {
        "route_number": "TNSTC-KUL-05",
        "bus_name": "Nagercoil Vadasery - Thingalnagar - Colachel (Route 5)",
        "agency": "TNSTC",
        "bus_type": "Town / District Bus",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Colachel Port Bus Stand",
        "departure": "05:30 AM - 10:00 PM",
        "arrival": "50 Minutes Journey",
        "frequency": "Every 15 mins",
        "fare": "₹22",
        "kanniyakumari_station": "Vadasery / Thingalnagar / Colachel",
        "stops": [
            "Nagercoil Vadasery", "Chettikulam", "Thingalnagar (Monday Market)", "Eraniel", "Colachel Port"
        ],
        "destination_keywords": ["colachel", "kulachel", "thingalnagar", "monday market", "eraniel"]
    },
    {
        "route_number": "SETC-TPTY-01",
        "bus_name": "Kanyakumari / Nagercoil - Tirupati SETC Ultra Deluxe",
        "agency": "SETC (TN Govt)",
        "bus_type": "Ultra Deluxe (Push Back)",
        "direction": "DEPARTING",
        "from_station": "Kanyakumari Stand",
        "from_station_name": "Kanyakumari Central Stand",
        "to_station": "Tirupati Central Bus Stand (APSCTC/TNSTC)",
        "departure": "03:00 PM",
        "arrival": "07:30 AM +1",
        "frequency": "Daily Direct Service",
        "fare": "₹820",
        "kanniyakumari_station": "Kanyakumari / Nagercoil Vadasery",
        "stops": [
            "Kanyakumari 15:00", "Nagercoil Vadasery 15:45", "Tirunelveli 17:00",
            "Madurai 19:30", "Trichy 22:15", "Villupuram 01:15",
            "Vellore 04:30", "Chittoor 05:45", "Tirupati 07:30"
        ],
        "destination_keywords": ["tirupati", "vellore", "chittoor", "madurai", "trichy"]
    },
    {
        "route_number": "SETC-PDY-01",
        "bus_name": "Nagercoil - Puducherry SETC Classic Express",
        "agency": "SETC (TN Govt)",
        "bus_type": "Classic Express",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Puducherry (Pondicherry New Bus Stand)",
        "departure": "05:15 PM",
        "arrival": "06:45 AM +1",
        "frequency": "Daily",
        "fare": "₹610",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil 17:15", "Tirunelveli 18:30", "Madurai 21:00",
            "Trichy 23:45", "Thanjavur 01:15", "Kumbakonam 02:30",
            "Cuddalore 05:30", "Puducherry 06:45"
        ],
        "destination_keywords": ["puducherry", "pondicherry", "cuddalore", "thanjavur", "kumbakonam", "trichy"]
    },
    {
        "route_number": "SETC-VEL-01",
        "bus_name": "Nagercoil - Velankanni SETC Super Deluxe",
        "agency": "SETC (TN Govt)",
        "bus_type": "Super Deluxe",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Velankanni Shrine Bus Stand",
        "departure": "06:30 PM",
        "arrival": "05:00 AM +1",
        "frequency": "Daily Pilgrim Service",
        "fare": "₹490",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil 18:30", "Tirunelveli 19:45", "Tuticorin 21:00",
            "Ramanathapuram 23:30", "Pattukkottai 02:45", "Nagapattinam 04:30", "Velankanni 05:00"
        ],
        "destination_keywords": ["velankanni", "nagapattinam", "pattukkottai", "ramanathapuram", "tuticorin"]
    },
    {
        "route_number": "SETC-OOTY-01",
        "bus_name": "Nagercoil - Ooty (Nilgiris) SETC Ultra Deluxe",
        "agency": "SETC (TN Govt)",
        "bus_type": "Ultra Deluxe (Hill Service)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Ooty Central Bus Stand (Udhagamandalam)",
        "departure": "07:00 PM",
        "arrival": "07:30 AM +1",
        "frequency": "Daily Overnight Service",
        "fare": "₹640",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil 19:00", "Tirunelveli 20:15", "Madurai 22:45",
            "Dindigul 23:45", "Coimbatore 03:30", "Mettupalayam 04:45",
            "Coonoor 06:15", "Ooty 07:30"
        ],
        "destination_keywords": ["ooty", "nilgiris", "udhagamandalam", "coonoor", "mettupalayam", "coimbatore"]
    },
    {
        "route_number": "SETC-TPJ-01",
        "bus_name": "Nagercoil - Trichy Central SETC Express",
        "agency": "SETC (TN Govt)",
        "bus_type": "Ultra Deluxe (Push Back)",
        "direction": "DEPARTING",
        "from_station": "Nagercoil Vadasery",
        "from_station_name": "Nagercoil Vadasery Bus Stand",
        "to_station": "Tiruchirappalli (Trichy Central Bus Stand)",
        "departure": "09:30 AM & 10:15 PM",
        "arrival": "6.5 Hours Journey",
        "frequency": "Daily (Day & Night Trips)",
        "fare": "₹370",
        "kanniyakumari_station": "Nagercoil Vadasery",
        "stops": [
            "Nagercoil 22:15", "Tirunelveli 23:30", "Madurai Bypass 01:45",
            "Dindigul 02:45", "Manapparai 04:00", "Trichy Central 04:45"
        ],
        "destination_keywords": ["trichy", "tiruchirappalli", "dindigul", "madurai", "tirunelveli"]
    }
]

def search_buses(
    query: str = "",
    agency: str = "ALL",
    bus_type: str = "ALL",
    station: str = "ALL"
) -> list[dict]:
    """
    Search bus schedules by destination, agency (KSRTC vs TNSTC vs ALL),
    intermediate stops, or bus types.
    """
    clean_query = (query or "").strip().lower()
    results = []

    # Map aliases
    target_keywords = set()
    if clean_query:
        target_keywords.add(clean_query)
        for canon, aliases in BUS_DESTINATION_KEYWORDS.items():
            if clean_query in canon or any(clean_query in a.lower() for a in aliases):
                target_keywords.add(canon)
                for a in aliases:
                    target_keywords.add(a.lower())

    for bus in BUS_SCHEDULES:
        # Agency filter (KSRTC, TNSTC, SETC)
        if agency and agency != "ALL":
            bus_agency = bus.get("agency", "").upper()
            if agency.upper() == "KSRTC" and "KSRTC" not in bus_agency:
                continue
            elif agency.upper() in ["TNSTC", "SETC"] and ("TNSTC" not in bus_agency and "SETC" not in bus_agency):
                continue

        # Station / Hub filter
        if station and station != "ALL":
            hub_match = False
            for k in ["from_station", "from_station_name", "kanniyakumari_station"]:
                val = bus.get(k, "").upper()
                if station.upper() in val:
                    hub_match = True
                    break
            if not hub_match:
                continue

        # Text query matching
        if clean_query:
            matched = False
            bus_dest_keys = [k.lower() for k in bus.get("destination_keywords", [])]
            for kw in target_keywords:
                if any(kw in bdk for bdk in bus_dest_keys):
                    matched = True
                    break

            if not matched:
                fields_to_check = [
                    bus.get("bus_name", ""),
                    bus.get("to_station", ""),
                    bus.get("from_station", ""),
                    bus.get("from_station_name", ""),
                    bus.get("bus_type", ""),
                    bus.get("agency", ""),
                    " ".join(bus.get("stops", []))
                ]
                full_text = " ".join(fields_to_check).lower()
                if any(kw in full_text for kw in target_keywords):
                    matched = True

            if not matched:
                continue

        results.append(bus)

    return results

def get_all_buses(agency: str = "ALL", station: str = "ALL") -> list[dict]:
    return search_buses(query="", agency=agency, station=station)
