"""
Complete Train Schedule Database for Kanniyakumari District
Covers Nagercoil Junction (NCJ), Kanyakumari (CAPE), and Nagercoil Town (NCT).
Includes all COMING (Arriving) and GOING (Departing) trains with full stop lists,
timings, days of operation, and searchable route places.

Source: Southern Railway / Indian Railways (IRCTC National Timetable Data).
"""

STATIONS = {
    "NCJ": {"code": "NCJ", "name": "Nagercoil Junction", "lat": 8.1691, "lon": 77.4265},
    "CAPE": {"code": "CAPE", "name": "Kanyakumari", "lat": 8.0898, "lon": 77.5458},
    "NCT": {"code": "NCT", "name": "Nagercoil Town", "lat": 8.1810, "lon": 77.4340},
}

DESTINATION_KEYWORDS = {
    "chennai": ["MAS", "MS", "TBM", "CHENNAI", "EGMORE", "CENTRAL", "TAMBARAM", "CHENGALPATTU"],
    "bangalore": ["SBC", "KSR BENGALURU", "BENGALURU", "BANGALORE", "YPR", "YESVANTPUR", "SMVB", "SMVT"],
    "mumbai": ["CSMT", "LTT", "MUMBAI", "BOMBAY", "DADAR", "KALYAN", "PANVEL", "THANE"],
    "trivandrum": ["TVC", "THIRUVANANTHAPURAM", "TRIVANDRUM", "KOCHUVELI", "KCVL", "KAZHAKUTTAM"],
    "ernakulam": ["ERS", "ERN", "ERNAKULAM", "KOCHI", "COCHIN", "ALUVA"],
    "madurai": ["MDU", "MADURAI", "DINDIGUL", "VIRUDHUNAGAR"],
    "tirunelveli": ["TEN", "TIRUNELVELI", "VALLIYUR", "VANCHI MANIYACHCHI", "KOVILPATTI", "SATTUR"],
    "coimbatore": ["CBE", "COIMBATORE", "TIRUPPUR", "POLLACHI"],
    "delhi": ["NDLS", "NZM", "NEW DELHI", "DELHI", "H NIZAMUDDIN", "AGRA", "GWALIOR", "JHANSI", "BHOPAL"],
    "kolkata": ["HWH", "HOWRAH", "KOLKATA", "SHALIMAR", "KHARAGPUR"],
    "hyderabad": ["SC", "SECUNDERABAD", "HYDERABAD", "KACHEGUDA", "KCG"],
    "pune": ["PUNE", "DAUND", "SOLAPUR"],
    "mangalore": ["MAQ", "MAJN", "MANGALURU", "MANGALORE", "UDUPI", "KASARAGOD"],
    "salem": ["SA", "SALEM", "ERODE", "KARUR", "NAMAKKAL"],
    "trichy": ["TPJ", "TIRUCHIRAPPALLI", "TRICHY", "THANJAVUR", "KUMBAKONAM", "MAYILADUTHURAI"],
    "nagpur": ["NGP", "NAGPUR", "BALHARSHAH", "ITARSI"],
    "jammu": ["JAT", "JAMMU TAWI", "JAMMU", "KATRA", "SVDK", "LUDHIANA", "JALANDHAR"],
    "dibrugarh": ["DBRG", "DIBRUGARH", "GUWAHATI", "GHY", "ASSAM", "DIMAPUR", "NEW JALPAIGURI", "MALDA"],
    "bhubaneswar": ["BBS", "BHUBANESWAR", "CUTTACK", "VIZAG", "VISAKHAPATNAM", "VSKP"],
    "goa": ["MAO", "MADGAON", "GOA", "KARWAR"],
    "kanyakumari": ["CAPE", "KANYAKUMARI", "VIVEKANANDA ROCK"],
    "nagercoil": ["NCJ", "NCT", "NAGERCOIL"],
    "kollam": ["QLN", "KOLLAM", "QUILON", "VARKALA", "KAYAMKULAM"],
    "kozhikode": ["CLT", "KOZHIKODE", "CALICUT", "SHORANUR", "TIRUR", "KANNUR", "THALASSERY"],
    "thrissur": ["TCR", "THRISSUR", "GURUVAYUR", "GUV"],
    "palakkad": ["PGT", "PALAKKAD", "PALGHAT"],
    "tirupati": ["TPTY", "RU", "RENIGUNTA", "TIRUPATI", "KATPADI"],
    "villupuram": ["VM", "VILLUPURAM", "TINDIVANAM", "VRIDDHACHALAM"],
    "rameswaram": ["RMM", "RAMESWARAM", "MANDAPAM", "RAMANATHAPURAM"],
    "puducherry": ["PDY", "PUDUCHERRY", "PONDICHERRY", "CUDDALORE"],
    "kottayam": ["KTYM", "KOTTAYAM", "CHENGANNUR", "TIRUVALLA", "CHANGANASSERY"],
    "alappuzha": ["ALLP", "ALAPPUZHA", "ALLEPPEY", "CHERTHALA"],
    "gandhidham": ["GIMB", "GANDHIDHAM", "AHMEDABAD", "SURAT", "VADODARA", "RAJKOT"],
}

TRAIN_SCHEDULES = [
    # ========================================================
    # ===== DEPARTING / GOING TRAINS (From NCJ / CAPE / NCT) =====
    # ========================================================
    {
        "train_number": "20628",
        "train_name": "Nagercoil - Chennai Egmore Vande Bharat Express",
        "train_type": "Vande Bharat Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Chennai Egmore (MS)",
        "departure": "14:15",
        "arrival": "23:00",
        "days": "Daily (Except Wed)",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 14:15", "Tirunelveli (TEN) 15:10", "Virudhunagar (VPT) 16:22",
            "Madurai (MDU) 17:05", "Dindigul (DG) 17:55", "Trichy (TPJ) 19:15",
            "Villupuram (VM) 21:30", "Tambaram (TBM) 22:38", "Chennai Egmore (MS) 23:00"
        ],
        "destination_keywords": ["chennai", "madurai", "trichy", "villupuram", "tirunelveli", "dindigul", "tambaram"]
    },
    {
        "train_number": "12634",
        "train_name": "Kanyakumari - Chennai Egmore Superfast Express",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Chennai Egmore (MS)",
        "departure": "17:50",
        "arrival": "06:10 +1",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 17:50", "Nagercoil Jn (NCJ) 18:15", "Valliyur (VLY) 18:45",
            "Tirunelveli (TEN) 19:35", "Kovilpatti (CVP) 20:30", "Sattur (SRT) 20:50",
            "Virudhunagar (VPT) 21:18", "Madurai (MDU) 22:05", "Dindigul (DG) 23:05",
            "Trichy (TPJ) 00:30", "Vriddhachalam (VRI) 02:00", "Villupuram (VM) 03:00",
            "Tindivanam (TMV) 03:35", "Melmaruvathur (MLMR) 04:00", "Chengalpattu (CGL) 04:40",
            "Tambaram (TBM) 05:10", "Chennai Egmore (MS) 06:10"
        ],
        "destination_keywords": ["chennai", "madurai", "trichy", "villupuram", "tirunelveli", "dindigul", "tambaram", "chengalpattu"]
    },
    {
        "train_number": "12633",
        "train_name": "Chennai Egmore - Kanyakumari Superfast Express",
        "train_type": "Superfast Express",
        "direction": "ARRIVING",
        "from_station": "Chennai Egmore (MS)",
        "from_station_name": "Chennai Egmore",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "17:20",
        "arrival": "05:45 +1",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Chennai Egmore (MS) 17:20", "Tambaram (TBM) 17:48", "Chengalpattu (CGL) 18:18",
            "Villupuram (VM) 19:50", "Vriddhachalam (VRI) 20:30", "Trichy (TPJ) 22:30",
            "Dindigul (DG) 23:50", "Madurai (MDU) 00:55", "Virudhunagar (VPT) 01:40",
            "Tirunelveli (TEN) 03:20", "Valliyur (VLY) 04:00", "Nagercoil Jn (NCJ) 05:00",
            "Kanyakumari (CAPE) 05:45"
        ],
        "destination_keywords": ["chennai", "madurai", "trichy", "villupuram", "tirunelveli", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "20627",
        "train_name": "Chennai Egmore - Nagercoil Vande Bharat Express",
        "train_type": "Vande Bharat Express",
        "direction": "ARRIVING",
        "from_station": "Chennai Egmore (MS)",
        "from_station_name": "Chennai Egmore",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "05:00",
        "arrival": "13:50",
        "days": "Daily (Except Wed)",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Chennai Egmore (MS) 05:00", "Tambaram (TBM) 05:25", "Villupuram (VM) 06:40",
            "Trichy (TPJ) 08:45", "Dindigul (DG) 09:48", "Madurai (MDU) 10:35",
            "Virudhunagar (VPT) 11:15", "Tirunelveli (TEN) 12:40", "Nagercoil Jn (NCJ) 13:50"
        ],
        "destination_keywords": ["chennai", "madurai", "trichy", "villupuram", "tirunelveli", "nagercoil"]
    },
    {
        "train_number": "20636",
        "train_name": "Ananthapuri Superfast Express (via Nagercoil Town)",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "NCT",
        "from_station_name": "Nagercoil Town",
        "to_station": "Chennai Egmore (MS)",
        "departure": "16:55",
        "arrival": "06:05 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCT",
        "stops": [
            "Kollam (QLN) 14:50", "Trivandrum Central (TVC) 16:00", "Nagercoil Town (NCT) 16:55",
            "Valliyur (VLY) 17:35", "Tirunelveli (TEN) 18:25", "Kovilpatti (CVP) 19:20",
            "Sattur (SRT) 19:40", "Virudhunagar (VPT) 20:08", "Madurai (MDU) 21:00",
            "Dindigul (DG) 22:05", "Trichy (TPJ) 23:25", "Vriddhachalam (VRI) 01:00",
            "Villupuram (VM) 02:20", "Tindivanam (TMV) 03:00", "Chengalpattu (CGL) 04:30",
            "Tambaram (TBM) 05:05", "Chennai Egmore (MS) 06:05"
        ],
        "destination_keywords": ["chennai", "madurai", "trichy", "villupuram", "tirunelveli", "trivandrum", "kollam", "tambaram"]
    },
    {
        "train_number": "16723",
        "train_name": "Ananthapuri Express (Chennai -> Kollam via Nagercoil Town)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Chennai Egmore (MS)",
        "from_station_name": "Chennai Egmore",
        "to_station": "Kollam Junction (QLN)",
        "departure": "20:10",
        "arrival": "13:00 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCT",
        "stops": [
            "Chennai Egmore (MS) 20:10", "Tambaram (TBM) 20:38", "Villupuram (VM) 22:50",
            "Trichy (TPJ) 01:30", "Madurai (MDU) 03:50", "Tirunelveli (TEN) 06:15",
            "Valliyur (VLY) 07:00", "Nagercoil Town (NCT) 09:25", "Kulitturai (KZT) 10:00",
            "Neyyattinkara (NYY) 10:25", "Trivandrum Central (TVC) 11:20", "Varkala (VAK) 12:00",
            "Kollam (QLN) 13:00"
        ],
        "destination_keywords": ["chennai", "madurai", "trichy", "tirunelveli", "trivandrum", "kollam", "nagercoil"]
    },
    {
        "train_number": "12689",
        "train_name": "Nagercoil - MGR Chennai Central Weekly Superfast Express",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "MGR Chennai Central (MAS)",
        "departure": "17:45",
        "arrival": "08:30 +1",
        "days": "Thu",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 17:45", "Tirunelveli (TEN) 19:00", "Madurai (MDU) 21:30",
            "Dindigul (DG) 22:35", "Karur (KRR) 00:05", "Erode (ED) 01:25",
            "Salem (SA) 02:25", "Jolarpettai (JTJ) 04:15", "Katpadi (KPD) 05:25",
            "Arakkonam (AJJ) 06:15", "MGR Chennai Central (MAS) 08:30"
        ],
        "destination_keywords": ["chennai", "salem", "erode", "katpadi", "madurai", "tirunelveli"]
    },
    {
        "train_number": "12690",
        "train_name": "MGR Chennai Central - Nagercoil Weekly Superfast Express",
        "train_type": "Superfast Express",
        "direction": "ARRIVING",
        "from_station": "MGR Chennai Central (MAS)",
        "from_station_name": "MGR Chennai Central",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "19:00",
        "arrival": "11:15 +1",
        "days": "Mon",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "MGR Chennai Central (MAS) 19:00", "Arakkonam (AJJ) 19:55", "Katpadi (KPD) 20:50",
            "Jolarpettai (JTJ) 22:05", "Salem (SA) 23:45", "Erode (ED) 00:50",
            "Karur (KRR) 01:50", "Dindigul (DG) 03:15", "Madurai (MDU) 04:30",
            "Tirunelveli (TEN) 07:15", "Nagercoil Jn (NCJ) 11:15"
        ],
        "destination_keywords": ["chennai", "salem", "erode", "katpadi", "madurai", "tirunelveli", "nagercoil"]
    },
    {
        "train_number": "16525",
        "train_name": "Island Express (Kanyakumari - KSR Bengaluru Express)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "KSR Bengaluru (SBC)",
        "departure": "10:10",
        "arrival": "06:40 +1",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 10:10", "Nagercoil Jn (NCJ) 10:40", "Eraniel (ERL) 11:00",
            "Kulitturai (KZT) 11:15", "Parassala (PASA) 11:28", "Trivandrum Central (TVC) 12:40",
            "Varkala (VAK) 13:20", "Kollam (QLN) 13:50", "Kayamkulam (KYJ) 14:30",
            "Chengannur (CNGR) 14:55", "Tiruvalla (TRVL) 15:05", "Kottayam (KTYM) 15:40",
            "Ernakulam Town (ERN) 17:10", "Aluva (AWY) 17:35", "Thrissur (TCR) 18:30",
            "Palakkad (PGT) 20:15", "Coimbatore (CBE) 21:55", "Tiruppur (TUP) 22:45",
            "Erode (ED) 23:40", "Salem (SA) 00:45", "Bangarapet (BWT) 04:30",
            "Whitefield (WFD) 05:20", "KR Puram (KJM) 05:35", "Bengaluru Cantt (BNC) 06:05",
            "KSR Bengaluru (SBC) 06:40"
        ],
        "destination_keywords": ["bangalore", "coimbatore", "salem", "erode", "trivandrum", "kottayam", "ernakulam", "thrissur", "palakkad", "kollam"]
    },
    {
        "train_number": "16526",
        "train_name": "Island Express (KSR Bengaluru - Kanyakumari Express)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "KSR Bengaluru (SBC)",
        "from_station_name": "KSR Bengaluru",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "20:10",
        "arrival": "12:10 +1",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "KSR Bengaluru (SBC) 20:10", "Bengaluru Cantt (BNC) 20:20", "KR Puram (KJM) 20:35",
            "Salem (SA) 01:50", "Erode (ED) 02:50", "Tiruppur (TUP) 03:40",
            "Coimbatore (CBE) 04:45", "Palakkad (PGT) 05:45", "Thrissur (TCR) 07:10",
            "Ernakulam Town (ERN) 08:35", "Kottayam (KTYM) 10:00", "Kollam (QLN) 12:15",
            "Trivandrum Central (TVC) 14:00", "Nagercoil Jn (NCJ) 11:20", "Kanyakumari (CAPE) 12:10"
        ],
        "destination_keywords": ["bangalore", "coimbatore", "salem", "erode", "trivandrum", "ernakulam", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "17236",
        "train_name": "Nagercoil - KSR Bengaluru Express (via Madurai & Salem)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "KSR Bengaluru (SBC)",
        "departure": "19:15",
        "arrival": "09:15 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 19:15", "Valliyur (VLY) 19:48", "Tirunelveli (TEN) 20:35",
            "Kovilpatti (CVP) 21:30", "Sattur (SRT) 21:50", "Virudhunagar (VPT) 22:15",
            "Madurai (MDU) 23:10", "Dindigul (DG) 00:15", "Karur (KRR) 01:30",
            "Namakkal (NMKL) 02:10", "Salem (SA) 03:20", "Dharmapuri (DPJ) 05:00",
            "Hosur (HSRA) 07:15", "Carmelaram (CRLM) 07:55", "Bengaluru Cantt (BNC) 08:40",
            "KSR Bengaluru (SBC) 09:15"
        ],
        "destination_keywords": ["bangalore", "salem", "hosur", "madurai", "tirunelveli", "namakkal", "dindigul"]
    },
    {
        "train_number": "17235",
        "train_name": "KSR Bengaluru - Nagercoil Express (via Salem & Madurai)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "KSR Bengaluru (SBC)",
        "from_station_name": "KSR Bengaluru",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "17:15",
        "arrival": "07:45 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "KSR Bengaluru (SBC) 17:15", "Bengaluru Cantt (BNC) 17:28", "Hosur (HSRA) 18:25",
            "Dharmapuri (DPJ) 20:00", "Salem (SA) 22:15", "Namakkal (NMKL) 23:10",
            "Karur (KRR) 23:55", "Dindigul (DG) 01:25", "Madurai (MDU) 02:35",
            "Tirunelveli (TEN) 05:15", "Valliyur (VLY) 06:05", "Nagercoil Jn (NCJ) 07:45"
        ],
        "destination_keywords": ["bangalore", "salem", "hosur", "madurai", "tirunelveli", "nagercoil"]
    },
    {
        "train_number": "16382",
        "train_name": "Kanyakumari - Pune Express (Jayanti Janata Exp)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Pune Junction (PUNE)",
        "departure": "08:40",
        "arrival": "22:20 +1",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 08:40", "Nagercoil Jn (NCJ) 09:10", "Eraniel (ERL) 09:30",
            "Kulitturai (KZT) 09:48", "Trivandrum Central (TVC) 10:45", "Kollam (QLN) 11:55",
            "Kottayam (KTYM) 13:45", "Ernakulam Town (ERN) 15:05", "Thrissur (TCR) 16:25",
            "Palakkad (PGT) 18:05", "Coimbatore (CBE) 19:45", "Erode (ED) 21:20",
            "Salem (SA) 22:20", "Jolarpettai (JTJ) 00:20", "Katpadi (KPD) 01:30",
            "Tirupati (TPTY) 03:50", "Renigunta (RU) 04:15", "Guntakal (GTL) 09:45",
            "Raichur (RC) 11:35", "Wadi (WADI) 13:45", "Kalaburagi (KLBG) 14:35",
            "Solapur (SUR) 16:30", "Daund (DD) 19:40", "Pune Jn (PUNE) 22:20"
        ],
        "destination_keywords": ["pune", "mumbai", "tirupati", "coimbatore", "salem", "erode", "trivandrum", "ernakulam", "solapur"]
    },
    {
        "train_number": "16381",
        "train_name": "Pune - Kanyakumari Jayanti Janata Express",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Pune Junction (PUNE)",
        "from_station_name": "Pune Junction",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "23:50",
        "arrival": "12:30 +2",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Pune Jn (PUNE) 23:50", "Solapur (SUR) 03:45", "Kalaburagi (KLBG) 05:40",
            "Wadi (WADI) 06:45", "Guntakal (GTL) 10:50", "Renigunta (RU) 16:30",
            "Tirupati (TPTY) 17:00", "Katpadi (KPD) 18:55", "Jolarpettai (JTJ) 20:30",
            "Salem (SA) 22:15", "Erode (ED) 23:20", "Coimbatore (CBE) 01:05",
            "Palakkad (PGT) 02:25", "Thrissur (TCR) 03:50", "Ernakulam Town (ERN) 05:15",
            "Kottayam (KTYM) 06:45", "Kollam (QLN) 08:45", "Trivandrum (TVC) 10:05",
            "Nagercoil Jn (NCJ) 11:45", "Kanyakumari (CAPE) 12:30"
        ],
        "destination_keywords": ["pune", "mumbai", "tirupati", "coimbatore", "salem", "trivandrum", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "16352",
        "train_name": "Nagercoil - Mumbai CSMT Express (via Tirunelveli & Renigunta)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Mumbai CSMT (CSMT)",
        "departure": "06:15",
        "arrival": "19:15 +1",
        "days": "Thu, Sun",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 06:15", "Tirunelveli (TEN) 07:30", "Kovilpatti (CVP) 08:25",
            "Virudhunagar (VPT) 09:10", "Madurai (MDU) 10:05", "Dindigul (DG) 11:05",
            "Trichy (TPJ) 12:35", "Karur (KRR) 13:50", "Namakkal (NMKL) 14:30",
            "Salem (SA) 15:40", "Katpadi (KPD) 18:45", "Tirupati (TPTY) 20:45",
            "Renigunta (RU) 21:10", "Cuddapah (HX) 22:55", "Guntakal (GTL) 02:40",
            "Raichur (RC) 04:30", "Wadi (WADI) 06:30", "Kalaburagi (KLBG) 07:20",
            "Solapur (SUR) 09:15", "Pune (PUNE) 14:15", "Kalyan (KYN) 17:35",
            "Dadar (DR) 18:35", "Mumbai CSMT (CSMT) 19:15"
        ],
        "destination_keywords": ["mumbai", "pune", "tirupati", "madurai", "trichy", "salem", "tirunelveli", "solapur", "kalyan"]
    },
    {
        "train_number": "16351",
        "train_name": "Mumbai CSMT - Nagercoil Express (via Renigunta & Tirunelveli)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Mumbai CSMT (CSMT)",
        "from_station_name": "Mumbai CSMT",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "20:35",
        "arrival": "15:30 +2",
        "days": "Tue, Sat",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Mumbai CSMT (CSMT) 20:35", "Dadar (DR) 20:48", "Kalyan (KYN) 21:30",
            "Pune (PUNE) 00:35", "Solapur (SUR) 05:25", "Kalaburagi (KLBG) 07:15",
            "Wadi (WADI) 08:20", "Raichur (RC) 10:05", "Guntakal (GTL) 12:15",
            "Renigunta (RU) 17:45", "Tirupati (TPTY) 18:15", "Katpadi (KPD) 20:30",
            "Salem (SA) 23:45", "Karur (KRR) 01:10", "Trichy (TPJ) 02:45",
            "Madurai (MDU) 05:15", "Tirunelveli (TEN) 08:45", "Nagercoil Jn (NCJ) 15:30"
        ],
        "destination_keywords": ["mumbai", "pune", "tirupati", "madurai", "trichy", "salem", "tirunelveli", "nagercoil"]
    },
    {
        "train_number": "16340",
        "train_name": "Nagercoil - Mumbai CSMT Express (via Madurai & Erode)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Mumbai CSMT (CSMT)",
        "departure": "06:15",
        "arrival": "20:30 +1",
        "days": "Mon, Tue, Wed, Fri",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 06:15", "Tirunelveli (TEN) 07:30", "Madurai (MDU) 10:05",
            "Dindigul (DG) 11:05", "Karur (KRR) 12:35", "Erode (ED) 13:50",
            "Salem (SA) 14:50", "Bangarapet (BWT) 18:05", "Dharmavaram (DMM) 21:20",
            "Guntakal (GTL) 23:35", "Raichur (RC) 01:25", "Wadi (WADI) 03:30",
            "Solapur (SUR) 06:15", "Pune (PUNE) 11:45", "Kalyan (KYN) 18:40",
            "Mumbai CSMT (CSMT) 20:30"
        ],
        "destination_keywords": ["mumbai", "pune", "salem", "erode", "madurai", "tirunelveli", "solapur"]
    },
    {
        "train_number": "16339",
        "train_name": "Mumbai CSMT - Nagercoil Express (via Pune & Madurai)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Mumbai CSMT (CSMT)",
        "from_station_name": "Mumbai CSMT",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "20:35",
        "arrival": "03:30 +2",
        "days": "Tue, Wed, Thu, Sun",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Mumbai CSMT (CSMT) 20:35", "Pune (PUNE) 00:35", "Solapur (SUR) 05:25",
            "Guntakal (GTL) 12:15", "Bangarapet (BWT) 17:30", "Salem (SA) 20:45",
            "Erode (ED) 21:55", "Karur (KRR) 23:10", "Dindigul (DG) 00:40",
            "Madurai (MDU) 01:45", "Tirunelveli (TEN) 04:30", "Nagercoil Jn (NCJ) 03:30"
        ],
        "destination_keywords": ["mumbai", "pune", "salem", "erode", "madurai", "tirunelveli", "nagercoil"]
    },
    {
        "train_number": "12641",
        "train_name": "Thirukkural Superfast Express (Kanyakumari - Delhi NZM)",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Hazrat Nizamuddin (NZM) (Delhi)",
        "departure": "19:10",
        "arrival": "18:00 +2",
        "days": "Wed, Fri",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 19:10", "Nagercoil Jn (NCJ) 19:35", "Tirunelveli (TEN) 20:55",
            "Kovilpatti (CVP) 21:48", "Sattur (SRT) 22:08", "Virudhunagar (VPT) 22:30",
            "Madurai (MDU) 23:25", "Dindigul (DG) 00:30", "Trichy (TPJ) 02:00",
            "Vriddhachalam (VRI) 03:40", "Villupuram (VM) 04:45", "Chengalpattu (CGL) 06:20",
            "Tambaram (TBM) 06:50", "Chennai Egmore (MS) 07:45", "Vijayawada (BZA) 15:40",
            "Balharshah (BPQ) 22:30", "Nagpur (NGP) 01:30", "Bhopal (BPL) 06:45",
            "Jhansi (VGLJ) 10:25", "Gwalior (GWL) 11:40", "Agra Cantt (AGC) 13:45",
            "Hazrat Nizamuddin (NZM) 18:00"
        ],
        "destination_keywords": ["delhi", "chennai", "nagpur", "bhopal", "agra", "jhansi", "madurai", "trichy", "tirunelveli", "vijayawada"]
    },
    {
        "train_number": "12642",
        "train_name": "Thirukkural Superfast Express (Delhi NZM - Kanyakumari)",
        "train_type": "Superfast Express",
        "direction": "ARRIVING",
        "from_station": "Hazrat Nizamuddin (NZM)",
        "from_station_name": "Hazrat Nizamuddin (Delhi)",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "05:20",
        "arrival": "04:40 +2",
        "days": "Mon, Sat",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Hazrat Nizamuddin (NZM) 05:20", "Agra Cantt (AGC) 08:00", "Gwalior (GWL) 09:30",
            "Jhansi (VGLJ) 11:00", "Bhopal (BPL) 15:00", "Nagpur (NGP) 21:15",
            "Vijayawada (BZA) 07:15", "Chennai Egmore (MS) 15:45", "Tambaram (TBM) 16:15",
            "Villupuram (VM) 18:25", "Trichy (TPJ) 21:00", "Madurai (MDU) 23:25",
            "Tirunelveli (TEN) 02:15", "Nagercoil Jn (NCJ) 03:45", "Kanyakumari (CAPE) 04:40"
        ],
        "destination_keywords": ["delhi", "chennai", "nagpur", "bhopal", "agra", "madurai", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "15905",
        "train_name": "Vivek Express (Kanyakumari - Dibrugarh) - India's Longest Train",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Dibrugarh (DBRG) (Assam)",
        "departure": "17:20",
        "arrival": "20:50 +3",
        "days": "Thu, Sun",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 17:20", "Nagercoil Jn (NCJ) 17:50", "Trivandrum Central (TVC) 19:15",
            "Kollam (QLN) 20:25", "Kottayam (KTYM) 22:20", "Ernakulam Town (ERN) 23:45",
            "Thrissur (TCR) 01:00", "Palakkad (PGT) 02:40", "Coimbatore (CBE) 04:15",
            "Erode (ED) 05:55", "Salem (SA) 06:55", "Katpadi (KPD) 10:30",
            "Renigunta (RU) 12:20", "Vijayawada (BZA) 19:40", "Visakhapatnam (VSKP) 02:30",
            "Bhubaneswar (BBS) 09:20", "Cuttack (CTC) 10:05", "Kharagpur (KGP) 15:45",
            "Malda Town (MLDT) 01:30", "New Jalpaiguri (NJP) 06:15", "Guwahati (GHY) 15:00",
            "Dimapur (DMV) 19:00", "Dibrugarh (DBRG) 20:50"
        ],
        "destination_keywords": ["dibrugarh", "guwahati", "kolkata", "bhubaneswar", "visakhapatnam", "vijayawada", "coimbatore", "salem", "trivandrum", "ernakulam", "kollam"]
    },
    {
        "train_number": "15906",
        "train_name": "Vivek Express (Dibrugarh - Kanyakumari) - India's Longest Train",
        "train_type": "Superfast Express",
        "direction": "ARRIVING",
        "from_station": "Dibrugarh (DBRG)",
        "from_station_name": "Dibrugarh (Assam)",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "19:25",
        "arrival": "22:00 +3",
        "days": "Wed, Sat",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Dibrugarh (DBRG) 19:25", "Dimapur (DMV) 23:30", "Guwahati (GHY) 04:30",
            "New Jalpaiguri (NJP) 12:45", "Malda Town (MLDT) 17:30", "Kharagpur (KGP) 03:40",
            "Bhubaneswar (BBS) 08:35", "Visakhapatnam (VSKP) 16:30", "Vijayawada (BZA) 23:45",
            "Renigunta (RU) 06:15", "Katpadi (KPD) 08:05", "Salem (SA) 11:35",
            "Coimbatore (CBE) 14:15", "Ernakulam Town (ERN) 18:15", "Kollam (QLN) 20:45",
            "Trivandrum Central (TVC) 21:55", "Nagercoil Jn (NCJ) 21:30", "Kanyakumari (CAPE) 22:00"
        ],
        "destination_keywords": ["dibrugarh", "guwahati", "kolkata", "bhubaneswar", "visakhapatnam", "coimbatore", "trivandrum", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "16317",
        "train_name": "Himsagar Express (Kanyakumari - SMVD Katra / Jammu)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "SMVD Katra (SVDK) (Jammu & Kashmir)",
        "departure": "14:15",
        "arrival": "10:40 +3",
        "days": "Fri",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 14:15", "Nagercoil Jn (NCJ) 14:45", "Trivandrum Central (TVC) 16:10",
            "Kollam (QLN) 17:15", "Kottayam (KTYM) 19:10", "Ernakulam Town (ERN) 20:40",
            "Thrissur (TCR) 22:00", "Palakkad (PGT) 23:40", "Coimbatore (CBE) 01:15",
            "Erode (ED) 02:55", "Salem (SA) 03:55", "Katpadi (KPD) 07:30",
            "Tirupati (TPTY) 09:20", "Vijayawada (BZA) 16:45", "Warangal (WL) 20:10",
            "Nagpur (NGP) 03:15", "Bhopal (BPL) 09:40", "Jhansi (VGLJ) 14:15",
            "Gwalior (GWL) 15:30", "Agra Cantt (AGC) 17:35", "Hazrat Nizamuddin (NZM) 21:00",
            "New Delhi (NDLS) 21:40", "Ludhiana (LDH) 03:20", "Jammu Tawi (JAT) 08:35",
            "SMVD Katra (SVDK) 10:40"
        ],
        "destination_keywords": ["jammu", "delhi", "katra", "nagpur", "bhopal", "agra", "tirupati", "coimbatore", "salem", "trivandrum", "ernakulam", "kollam"]
    },
    {
        "train_number": "16318",
        "train_name": "Himsagar Express (SMVD Katra / Jammu - Kanyakumari)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "SMVD Katra (SVDK)",
        "from_station_name": "SMVD Katra (Jammu & Kashmir)",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "22:30",
        "arrival": "23:20 +3",
        "days": "Mon",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "SMVD Katra (SVDK) 22:30", "Jammu Tawi (JAT) 00:10", "Ludhiana (LDH) 05:40",
            "New Delhi (NDLS) 13:45", "Agra Cantt (AGC) 17:00", "Gwalior (GWL) 18:30",
            "Jhansi (VGLJ) 20:00", "Bhopal (BPL) 01:25", "Nagpur (NGP) 08:30",
            "Vijayawada (BZA) 19:40", "Tirupati (TPTY) 02:45", "Katpadi (KPD) 04:30",
            "Salem (SA) 08:00", "Coimbatore (CBE) 10:40", "Ernakulam Town (ERN) 14:45",
            "Kollam (QLN) 18:00", "Trivandrum Central (TVC) 19:45", "Nagercoil Jn (NCJ) 22:30",
            "Kanyakumari (CAPE) 23:20"
        ],
        "destination_keywords": ["jammu", "delhi", "katra", "nagpur", "bhopal", "agra", "tirupati", "coimbatore", "trivandrum", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "12666",
        "train_name": "Kanyakumari - Howrah Superfast Express (via Chennai)",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Howrah Junction (HWH) (Kolkata)",
        "departure": "05:50",
        "arrival": "23:55 +1",
        "days": "Sat",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 05:50", "Nagercoil Jn (NCJ) 06:15", "Tirunelveli (TEN) 07:45",
            "Madurai (MDU) 10:25", "Dindigul (DG) 11:25", "Trichy (TPJ) 13:00",
            "Thanjavur (TJ) 14:00", "Kumbakonam (KMU) 14:40", "Mayiladuthurai (MV) 15:15",
            "Chidambaram (CDM) 15:55", "Cuddalore Port (CUPJ) 16:35", "Villupuram (VM) 17:40",
            "Chengalpattu (CGL) 19:15", "Tambaram (TBM) 19:45", "Chennai Egmore (MS) 20:45",
            "Vijayawada (BZA) 04:30", "Visakhapatnam (VSKP) 11:20", "Bhubaneswar (BBS) 17:45",
            "Cuttack (CTC) 18:25", "Kharagpur (KGP) 21:55", "Howrah Jn (HWH) 23:55"
        ],
        "destination_keywords": ["kolkata", "chennai", "bhubaneswar", "visakhapatnam", "trichy", "thanjavur", "madurai", "tirunelveli", "villupuram"]
    },
    {
        "train_number": "12665",
        "train_name": "Howrah - Kanyakumari Superfast Express",
        "train_type": "Superfast Express",
        "direction": "ARRIVING",
        "from_station": "Howrah Junction (HWH)",
        "from_station_name": "Howrah Junction (Kolkata)",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "16:15",
        "arrival": "21:20 +1",
        "days": "Wed",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Howrah Jn (HWH) 16:15", "Kharagpur (KGP) 18:05", "Bhubaneswar (BBS) 22:20",
            "Visakhapatnam (VSKP) 04:45", "Vijayawada (BZA) 11:30", "Chennai Egmore (MS) 19:50",
            "Villupuram (VM) 22:20", "Trichy (TPJ) 00:55", "Madurai (MDU) 03:20",
            "Tirunelveli (TEN) 06:10", "Nagercoil Jn (NCJ) 20:30", "Kanyakumari (CAPE) 21:20"
        ],
        "destination_keywords": ["kolkata", "chennai", "bhubaneswar", "visakhapatnam", "madurai", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "22667",
        "train_name": "Nagercoil - Coimbatore Superfast Express",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Coimbatore Junction (CBE)",
        "departure": "21:55",
        "arrival": "07:15 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 21:55", "Valliyur (VLY) 22:28", "Tirunelveli (TEN) 23:15",
            "Kovilpatti (CVP) 00:10", "Sattur (SRT) 00:30", "Virudhunagar (VPT) 00:55",
            "Madurai (MDU) 01:50", "Dindigul (DG) 02:55", "Karur (KRR) 04:20",
            "Erode (ED) 05:40", "Tiruppur (TUP) 06:25", "Coimbatore Jn (CBE) 07:15"
        ],
        "destination_keywords": ["coimbatore", "madurai", "tirunelveli", "erode", "dindigul", "tiruppur"]
    },
    {
        "train_number": "22668",
        "train_name": "Coimbatore - Nagercoil Superfast Express",
        "train_type": "Superfast Express",
        "direction": "ARRIVING",
        "from_station": "Coimbatore Junction (CBE)",
        "from_station_name": "Coimbatore Junction",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "19:30",
        "arrival": "04:45 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Coimbatore Jn (CBE) 19:30", "Tiruppur (TUP) 20:15", "Erode (ED) 21:05",
            "Karur (KRR) 22:15", "Dindigul (DG) 23:35", "Madurai (MDU) 00:45",
            "Virudhunagar (VPT) 01:30", "Tirunelveli (TEN) 03:00", "Valliyur (VLY) 03:45",
            "Nagercoil Jn (NCJ) 04:45"
        ],
        "destination_keywords": ["coimbatore", "madurai", "tirunelveli", "erode", "nagercoil"]
    },
    {
        "train_number": "16336",
        "train_name": "Gandhidham Express (Nagercoil - Gandhidham via Konkan)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Gandhidham Junction (GIMB) (Gujarat)",
        "departure": "14:45",
        "arrival": "12:00 +2",
        "days": "Tue",
        "kanniyakumari_station": "NCJ / NCT",
        "stops": [
            "Nagercoil Jn (NCJ) 14:45", "Nagercoil Town (NCT) 14:55", "Kulitturai (KZT) 15:20",
            "Trivandrum Central (TVC) 16:15", "Kollam (QLN) 17:25", "Alappuzha (ALLP) 18:50",
            "Ernakulam Jn (ERS) 20:15", "Thrissur (TCR) 21:40", "Shoranur (SRR) 22:45",
            "Kozhikode (CLT) 00:15", "Kannur (CAN) 01:40", "Mangaluru Jn (MAJN) 04:10",
            "Udupi (UD) 05:40", "Karwar (KAWR) 08:30", "Madgaon (MAO) (Goa) 09:50",
            "Ratnagiri (RN) 14:40", "Panvel (PNVL) 21:20", "Vasai Road (BSR) 22:45",
            "Surat (ST) 02:40", "Vadodara (BRC) 04:30", "Ahmedabad (ADI) 06:45",
            "Gandhidham (GIMB) 12:00"
        ],
        "destination_keywords": ["gandhidham", "goa", "mumbai", "ahmedabad", "surat", "mangalore", "kozhikode", "ernakulam", "trivandrum", "kollam"]
    },
    {
        "train_number": "16335",
        "train_name": "Gandhidham - Nagercoil Express (via Konkan Railway)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Gandhidham Junction (GIMB)",
        "from_station_name": "Gandhidham (Gujarat)",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "10:45",
        "arrival": "06:15 +2",
        "days": "Fri",
        "kanniyakumari_station": "NCJ / NCT",
        "stops": [
            "Gandhidham (GIMB) 10:45", "Ahmedabad (ADI) 15:40", "Surat (ST) 19:35",
            "Vasai Road (BSR) 22:50", "Panvel (PNVL) 00:20", "Madgaon (MAO) (Goa) 12:30",
            "Mangaluru Jn (MAJN) 18:15", "Kozhikode (CLT) 21:55", "Ernakulam Jn (ERS) 02:20",
            "Kollam (QLN) 04:30", "Trivandrum Central (TVC) 05:45", "Nagercoil Town (NCT) 06:05",
            "Nagercoil Jn (NCJ) 06:15"
        ],
        "destination_keywords": ["gandhidham", "goa", "mumbai", "ahmedabad", "surat", "mangalore", "trivandrum", "nagercoil"]
    },
    {
        "train_number": "16354",
        "train_name": "Nagercoil - Kacheguda (Hyderabad) Express",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Kacheguda (KCG) (Hyderabad)",
        "departure": "09:15",
        "arrival": "13:25 +1",
        "days": "Sat",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 09:15", "Tirunelveli (TEN) 10:30", "Virudhunagar (VPT) 12:00",
            "Madurai (MDU) 13:00", "Dindigul (DG) 14:05", "Trichy (TPJ) 15:35",
            "Karur (KRR) 16:50", "Namakkal (NMKL) 17:35", "Salem (SA) 18:45",
            "Jolarpettai (JTJ) 20:45", "Katpadi (KPD) 22:00", "Chittoor (CTO) 22:45",
            "Tirupati (TPTY) 00:15", "Renigunta (RU) 00:40", "Kurnool City (KRNT) 07:15",
            "Mahbubnagar (MBNR) 09:30", "Kacheguda (KCG) 13:25"
        ],
        "destination_keywords": ["hyderabad", "tirupati", "salem", "trichy", "madurai", "tirunelveli", "katpadi"]
    },
    {
        "train_number": "16353",
        "train_name": "Kacheguda (Hyderabad) - Nagercoil Express",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Kacheguda (KCG)",
        "from_station_name": "Kacheguda (Hyderabad)",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "15:45",
        "arrival": "20:45 +1",
        "days": "Sun",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Kacheguda (KCG) 15:45", "Mahbubnagar (MBNR) 17:15", "Kurnool City (KRNT) 19:30",
            "Renigunta (RU) 02:40", "Tirupati (TPTY) 03:05", "Katpadi (KPD) 05:25",
            "Salem (SA) 08:35", "Karur (KRR) 10:15", "Trichy (TPJ) 11:45",
            "Madurai (MDU) 14:20", "Tirunelveli (TEN) 17:15", "Nagercoil Jn (NCJ) 20:45"
        ],
        "destination_keywords": ["hyderabad", "tirupati", "salem", "trichy", "madurai", "tirunelveli", "nagercoil"]
    },
    {
        "train_number": "16650",
        "train_name": "Parasuram Express (Nagercoil - Mangaluru Central)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Mangaluru Central (MAQ)",
        "departure": "03:45",
        "arrival": "21:00",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 03:45", "Eraniel (ERL) 04:05", "Kulitturai (KZT) 04:20",
            "Parassala (PASA) 04:35", "Neyyattinkara (NYY) 04:50", "Trivandrum Central (TVC) 06:05",
            "Varkala (VAK) 06:45", "Kollam (QLN) 07:25", "Kayamkulam (KYJ) 08:05",
            "Chengannur (CNGR) 08:30", "Tiruvalla (TRVL) 08:40", "Kottayam (KTYM) 09:20",
            "Ernakulam Town (ERN) 10:55", "Aluva (AWY) 11:20", "Thrissur (TCR) 12:15",
            "Shoranur (SRR) 13:30", "Tirur (TIR) 14:15", "Kozhikode (CLT) 15:00",
            "Vadakara (BDJ) 15:45", "Thalassery (TLY) 16:10", "Kannur (CAN) 16:35",
            "Payyanur (PAY) 17:10", "Kasaragod (KGQ) 18:30", "Mangaluru Central (MAQ) 21:00"
        ],
        "destination_keywords": ["mangalore", "kozhikode", "kannur", "thrissur", "ernakulam", "kottayam", "kollam", "trivandrum"]
    },
    {
        "train_number": "16649",
        "train_name": "Parasuram Express (Mangaluru Central - Nagercoil)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Mangaluru Central (MAQ)",
        "from_station_name": "Mangaluru Central",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "05:00",
        "arrival": "21:25",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Mangaluru Central (MAQ) 05:00", "Kasaragod (KGQ) 05:45", "Kannur (CAN) 07:10",
            "Kozhikode (CLT) 08:35", "Shoranur (SRR) 10:15", "Thrissur (TCR) 11:15",
            "Ernakulam Town (ERN) 12:40", "Kottayam (KTYM) 14:15", "Kollam (QLN) 16:15",
            "Trivandrum Central (TVC) 18:25", "Kulitturai (KZT) 19:35", "Eraniel (ERL) 20:00",
            "Nagercoil Jn (NCJ) 21:25"
        ],
        "destination_keywords": ["mangalore", "kozhikode", "kannur", "thrissur", "ernakulam", "trivandrum", "nagercoil"]
    },
    {
        "train_number": "16606",
        "train_name": "Ernad Express (Nagercoil - Mangaluru Central via Alappuzha)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Mangaluru Central (MAQ)",
        "departure": "02:00",
        "arrival": "18:00",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 02:00", "Kulitturai (KZT) 02:30", "Trivandrum Central (TVC) 03:30",
            "Varkala (VAK) 04:10", "Kollam (QLN) 04:45", "Alappuzha (ALLP) 06:15",
            "Ernakulam Jn (ERS) 07:45", "Thrissur (TCR) 09:05", "Shoranur (SRR) 10:15",
            "Kozhikode (CLT) 11:45", "Kannur (CAN) 13:20", "Kasaragod (KGQ) 15:30",
            "Mangaluru Central (MAQ) 18:00"
        ],
        "destination_keywords": ["mangalore", "kozhikode", "kannur", "alappuzha", "ernakulam", "kollam", "trivandrum"]
    },
    {
        "train_number": "16605",
        "train_name": "Ernad Express (Mangaluru Central - Nagercoil via Alappuzha)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Mangaluru Central (MAQ)",
        "from_station_name": "Mangaluru Central",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "07:20",
        "arrival": "03:20 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Mangaluru Central (MAQ) 07:20", "Kasaragod (KGQ) 08:05", "Kannur (CAN) 09:30",
            "Kozhikode (CLT) 11:10", "Thrissur (TCR) 14:15", "Ernakulam Jn (ERS) 16:00",
            "Alappuzha (ALLP) 17:15", "Kollam (QLN) 19:30", "Trivandrum Central (TVC) 21:10",
            "Nagercoil Jn (NCJ) 03:20"
        ],
        "destination_keywords": ["mangalore", "kozhikode", "kannur", "alappuzha", "ernakulam", "trivandrum", "nagercoil"]
    },
    {
        "train_number": "16342",
        "train_name": "Guruvayur Express (Nagercoil - Guruvayur)",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "NCJ",
        "from_station_name": "Nagercoil Junction",
        "to_station": "Guruvayur (GUV)",
        "departure": "19:10",
        "arrival": "06:10 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Nagercoil Jn (NCJ) 19:10", "Kulitturai (KZT) 19:40", "Trivandrum Central (TVC) 21:00",
            "Varkala (VAK) 21:40", "Kollam (QLN) 22:25", "Kayamkulam (KYJ) 23:10",
            "Alappuzha (ALLP) 00:15", "Ernakulam Jn (ERS) 01:50", "Aluva (AWY) 02:20",
            "Thrissur (TCR) 03:30", "Guruvayur (GUV) 06:10"
        ],
        "destination_keywords": ["guruvayur", "thrissur", "ernakulam", "alappuzha", "kollam", "trivandrum"]
    },
    {
        "train_number": "16341",
        "train_name": "Guruvayur Express (Guruvayur - Nagercoil)",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Guruvayur (GUV)",
        "from_station_name": "Guruvayur",
        "to_station": "Nagercoil Junction (NCJ)",
        "departure": "23:15",
        "arrival": "05:20 +1",
        "days": "Daily",
        "kanniyakumari_station": "NCJ",
        "stops": [
            "Guruvayur (GUV) 23:15", "Thrissur (TCR) 23:45", "Ernakulam Jn (ERS) 01:10",
            "Alappuzha (ALLP) 02:20", "Kollam (QLN) 03:40", "Trivandrum Central (TVC) 04:30",
            "Nagercoil Jn (NCJ) 05:20"
        ],
        "destination_keywords": ["guruvayur", "thrissur", "ernakulam", "trivandrum", "nagercoil"]
    },
    {
        "train_number": "22622",
        "train_name": "Kanyakumari - Rameswaram Superfast Express",
        "train_type": "Superfast Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Rameswaram (RMM)",
        "departure": "22:15",
        "arrival": "05:40 +1",
        "days": "Tue, Thu, Sun",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 22:15", "Nagercoil Jn (NCJ) 22:40", "Valliyur (VLY) 23:15",
            "Tirunelveli (TEN) 00:05", "Kovilpatti (CVP) 01:00", "Virudhunagar (VPT) 01:45",
            "Madurai (MDU) 02:40", "Manamadurai (MNM) 03:40", "Paramakkudi (PMK) 04:05",
            "Ramanathapuram (RMD) 04:35", "Mandapam (MMM) 05:05", "Rameswaram (RMM) 05:40"
        ],
        "destination_keywords": ["rameswaram", "madurai", "tirunelveli", "ramanathapuram"]
    },
    {
        "train_number": "22621",
        "train_name": "Rameswaram - Kanyakumari Superfast Express",
        "train_type": "Superfast Express",
        "direction": "ARRIVING",
        "from_station": "Rameswaram (RMM)",
        "from_station_name": "Rameswaram",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "21:00",
        "arrival": "04:30 +1",
        "days": "Mon, Wed, Fri",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Rameswaram (RMM) 21:00", "Mandapam (MMM) 21:30", "Ramanathapuram (RMD) 22:05",
            "Manamadurai (MNM) 23:05", "Madurai (MDU) 00:15", "Tirunelveli (TEN) 02:35",
            "Nagercoil Jn (NCJ) 03:45", "Kanyakumari (CAPE) 04:30"
        ],
        "destination_keywords": ["rameswaram", "madurai", "tirunelveli", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "16862",
        "train_name": "Kanyakumari - Puducherry Express",
        "train_type": "Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Puducherry (PDY)",
        "departure": "14:00",
        "arrival": "03:25 +1",
        "days": "Mon",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 14:00", "Nagercoil Jn (NCJ) 14:30", "Tirunelveli (TEN) 15:45",
            "Virudhunagar (VPT) 17:15", "Madurai (MDU) 18:10", "Dindigul (DG) 19:15",
            "Trichy (TPJ) 20:45", "Thanjavur (TJ) 21:45", "Kumbakonam (KMU) 22:25",
            "Mayiladuthurai (MV) 23:00", "Cuddalore Port (CUPJ) 00:45", "Puducherry (PDY) 03:25"
        ],
        "destination_keywords": ["puducherry", "trichy", "thanjavur", "madurai", "tirunelveli"]
    },
    {
        "train_number": "16861",
        "train_name": "Puducherry - Kanyakumari Express",
        "train_type": "Express",
        "direction": "ARRIVING",
        "from_station": "Puducherry (PDY)",
        "from_station_name": "Puducherry",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "12:05",
        "arrival": "03:15 +1",
        "days": "Sun",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Puducherry (PDY) 12:05", "Cuddalore Port (CUPJ) 13:00", "Mayiladuthurai (MV) 14:40",
            "Trichy (TPJ) 17:05", "Madurai (MDU) 19:40", "Tirunelveli (TEN) 22:30",
            "Nagercoil Jn (NCJ) 02:30", "Kanyakumari (CAPE) 03:15"
        ],
        "destination_keywords": ["puducherry", "trichy", "madurai", "tirunelveli", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "16366",
        "train_name": "Kanyakumari - Kollam Daily Express",
        "train_type": "Passenger / Express",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Kollam Junction (QLN)",
        "departure": "05:55",
        "arrival": "10:15",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 05:55", "Nagercoil Jn (NCJ) 06:15", "Eraniel (ERL) 06:35",
            "Kulitturai (KZT) 06:50", "Parassala (PASA) 07:05", "Neyyattinkara (NYY) 07:20",
            "Trivandrum Central (TVC) 08:05", "Kazhakuttam (KZK) 08:30", "Varkala (VAK) 09:10",
            "Kollam (QLN) 10:15"
        ],
        "destination_keywords": ["kollam", "trivandrum", "varkala", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "16365",
        "train_name": "Kollam - Kanyakumari Daily Express",
        "train_type": "Passenger / Express",
        "direction": "ARRIVING",
        "from_station": "Kollam Junction (QLN)",
        "from_station_name": "Kollam",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "15:45",
        "arrival": "20:30",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kollam (QLN) 15:45", "Varkala (VAK) 16:15", "Kazhakuttam (KZK) 17:00",
            "Trivandrum Central (TVC) 17:35", "Neyyattinkara (NYY) 18:05", "Kulitturai (KZT) 18:40",
            "Eraniel (ERL) 19:00", "Nagercoil Jn (NCJ) 19:40", "Kanyakumari (CAPE) 20:30"
        ],
        "destination_keywords": ["kollam", "trivandrum", "varkala", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "06772",
        "train_name": "Kanyakumari - Tirunelveli Passenger",
        "train_type": "Passenger",
        "direction": "DEPARTING",
        "from_station": "CAPE",
        "from_station_name": "Kanyakumari",
        "to_station": "Tirunelveli Junction (TEN)",
        "departure": "07:05",
        "arrival": "09:00",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Kanyakumari (CAPE) 07:05", "Nagercoil Jn (NCJ) 07:25", "Aralvaymozhi (AAY) 07:45",
            "Valliyur (VLY) 08:05", "Nanguneri (NNN) 08:20", "Tirunelveli (TEN) 09:00"
        ],
        "destination_keywords": ["tirunelveli", "valliyur", "kanyakumari", "nagercoil"]
    },
    {
        "train_number": "06773",
        "train_name": "Tirunelveli - Kanyakumari Passenger",
        "train_type": "Passenger",
        "direction": "ARRIVING",
        "from_station": "Tirunelveli Junction (TEN)",
        "from_station_name": "Tirunelveli",
        "to_station": "Kanyakumari (CAPE)",
        "departure": "07:10",
        "arrival": "09:20",
        "days": "Daily",
        "kanniyakumari_station": "CAPE / NCJ",
        "stops": [
            "Tirunelveli (TEN) 07:10", "Nanguneri (NNN) 07:35", "Valliyur (VLY) 07:55",
            "Aralvaymozhi (AAY) 08:15", "Nagercoil Jn (NCJ) 08:35", "Kanyakumari (CAPE) 09:20"
        ],
        "destination_keywords": ["tirunelveli", "valliyur", "kanyakumari", "nagercoil"]
    },
]


def search_trains(query: str = "", direction: str = "ALL", station: str = "ALL") -> list:
    """
    Search trains by destination, route place, direction (DEPARTING/ARRIVING),
    and station (NCJ/CAPE/NCT).
    """
    query_lower = query.strip().lower() if query else ""
    direction_upper = direction.strip().upper() if direction else "ALL"
    station_upper = station.strip().upper() if station else "ALL"

    matched_keywords = []
    if query_lower:
        for keyword, aliases in DESTINATION_KEYWORDS.items():
            if query_lower in keyword or any(query_lower in alias.lower() for alias in aliases):
                matched_keywords.append(keyword)

    results = []
    seen = set()

    for train in TRAIN_SCHEDULES:
        # Direction filter
        if direction_upper != "ALL" and train.get("direction") != direction_upper:
            continue

        # Station filter
        if station_upper != "ALL":
            k_station = train.get("kanniyakumari_station", "")
            if station_upper not in k_station and station_upper != train.get("from_station") and station_upper != train.get("to_station"):
                continue

        # If no search query, add all matching station/direction
        if not query_lower:
            key = f"{train['train_number']}_{train['direction']}_{train['from_station']}"
            if key not in seen:
                results.append(train)
                seen.add(key)
            continue

        # Match search query against destination keywords, train name, stations, and stops
        is_match = False
        for kw in matched_keywords:
            if kw in train.get("destination_keywords", []):
                is_match = True
                break

        if not is_match:
            searchable_text = f"{train['train_number']} {train['train_name']} {train['from_station_name']} {train['to_station']} {' '.join(train.get('stops', []))}".lower()
            if query_lower in searchable_text:
                is_match = True

        if is_match:
            key = f"{train['train_number']}_{train['direction']}_{train['from_station']}"
            if key not in seen:
                results.append(train)
                seen.add(key)

    # Sort results: DEPARTING trains by departure time, ARRIVING by arrival time
    results.sort(key=lambda t: t.get("departure", "00:00"))
    return results


def get_all_trains() -> list:
    """Return all train schedules in the database."""
    return TRAIN_SCHEDULES
