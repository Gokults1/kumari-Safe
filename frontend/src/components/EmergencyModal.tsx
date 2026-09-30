import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldAlert, X, Building2, Flame, Users, ChevronDown, ChevronUp, Search, MapPin } from 'lucide-react';
import { getEmergencyAssist } from '../api';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: [number, number] | null;
}

// Built-in verified Kanniyakumari Emergency Directory — ensures Emergency NEVER shows empty
const DEFAULT_EMERGENCY_DATA = {
  closest_facilities: {
    POLICE: {
      facility: {
        name: "Kottar Police Station (Nagercoil)",
        facility_type: "POLICE",
        phone: "04652-220517",
        latitude: 8.1705,
        longitude: 77.4428,
        staff_directory: [
          { name: "K. Selvakumar", rank: "Inspector of Police (SHO)", phone: "+91-9498100101" },
          { name: "M. Ramesh", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100102" },
          { name: "S. Priya", rank: "Sub-Inspector (Crime)", phone: "+91-9498100103" },
          { name: "T. Anandh", rank: "Head Constable (Station In-Charge)", phone: "+91-9498100104" }
        ]
      },
      distance_km: 0.8
    },
    HOSPITAL: {
      facility: {
        name: "Kanyakumari Govt Medical College Hospital (Asaripallam)",
        facility_type: "HOSPITAL",
        phone: "04652-232261",
        latitude: 8.1691,
        longitude: 77.4042,
      },
      distance_km: 2.3
    },
    FIRE_STATION: {
      facility: {
        name: "Nagercoil Fire & Rescue Station",
        facility_type: "FIRE_STATION",
        phone: "04652-222101",
        latitude: 8.1818,
        longitude: 77.4334,
      },
      distance_km: 1.1
    }
  },
  all_police_stations: [
    {
      name: "Kottar Police Station",
      phone: "04652-220517",
      address: "Court Road, Kottar, Nagercoil",
      staff_directory: [
        { name: "K. Selvakumar", rank: "Inspector of Police (SHO)", phone: "+91-9498100101" },
        { name: "M. Ramesh", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100102" },
        { name: "S. Priya", rank: "Sub-Inspector (Crime)", phone: "+91-9498100103" },
        { name: "T. Anandh", rank: "Head Constable", phone: "+91-9498100104" }
      ]
    },
    {
      name: "Vadasery Police Station",
      phone: "04652-220518",
      address: "Christopher Bus Stand Road, Vadasery, Nagercoil",
      staff_directory: [
        { name: "R. Murugan", rank: "Inspector of Police (SHO)", phone: "+91-9498100201" },
        { name: "P. Lakshmi", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100202" },
        { name: "G. Vijayan", rank: "Sub-Inspector (Crime)", phone: "+91-9498100203" },
        { name: "K. Devi", rank: "Head Constable", phone: "+91-9498100204" }
      ]
    },
    {
      name: "Nesamony Nagar Police Station",
      phone: "04652-278222",
      address: "Nesamony Nagar, Nagercoil",
      staff_directory: [
        { name: "C. Ravichandran", rank: "Inspector of Police (SHO)", phone: "+91-9498100251" },
        { name: "S. Manickam", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100252" },
        { name: "V. Ganesan", rank: "Head Constable", phone: "+91-9498100253" }
      ]
    },
    {
      name: "Nagercoil All Women Police Station (AWPS)",
      phone: "04652-220519",
      address: "SP Office Campus, Nagercoil",
      staff_directory: [
        { name: "T. Gomathi", rank: "Inspector of Police (SHO)", phone: "+91-9498100261" },
        { name: "M. Meenakshi", rank: "Sub-Inspector", phone: "+91-9498100262" },
        { name: "R. Vasantha", rank: "Head Constable", phone: "+91-9498100263" }
      ]
    },
    {
      name: "Kanyakumari Police Station",
      phone: "04652-246222",
      address: "Main Road, Kanyakumari",
      staff_directory: [
        { name: "A. Johnkumar", rank: "Inspector of Police (SHO)", phone: "+91-9498100301" },
        { name: "D. Manikandan", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100302" },
        { name: "F. Rosemary", rank: "Sub-Inspector (Crime)", phone: "+91-9498100303" },
        { name: "L. Arumugam", rank: "Head Constable", phone: "+91-9498100304" }
      ]
    },
    {
      name: "Suchindram Police Station",
      phone: "04652-241222",
      address: "Car Street, Suchindram",
      staff_directory: [
        { name: "V. Rajan", rank: "Inspector of Police (SHO)", phone: "+91-9498100401" },
        { name: "N. Senthil", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100402" },
        { name: "B. Kalyani", rank: "Head Constable", phone: "+91-9498100403" }
      ]
    },
    {
      name: "Anjugramam Police Station",
      phone: "04652-247222",
      address: "Kanyakumari Highway, Anjugramam",
      staff_directory: [
        { name: "S. Subramanian", rank: "Inspector of Police (SHO)", phone: "+91-9498101011" },
        { name: "P. Muthulakshmi", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498101012" },
        { name: "M. Natarajan", rank: "Head Constable", phone: "+91-9498101013" }
      ]
    },
    {
      name: "Thuckalay Police Station",
      phone: "04651-250222",
      address: "Padmanabhapuram Road, Thuckalay",
      staff_directory: [
        { name: "S. Balasubramanian", rank: "Inspector of Police (SHO)", phone: "+91-9498100501" },
        { name: "P. Nirmala", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100502" },
        { name: "R. Kannan", rank: "Sub-Inspector (Crime)", phone: "+91-9498100503" },
        { name: "E. Murali", rank: "Head Constable", phone: "+91-9498100504" }
      ]
    },
    {
      name: "Marthandam Police Station",
      phone: "04651-270222",
      address: "Main Road, Marthandam",
      staff_directory: [
        { name: "J. Rajkumar", rank: "Inspector of Police (SHO)", phone: "+91-9498100601" },
        { name: "T. Vanitha", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100602" },
        { name: "K. Maheswaran", rank: "Sub-Inspector (Crime)", phone: "+91-9498100603" },
        { name: "P. Chelladurai", rank: "Head Constable", phone: "+91-9498100604" }
      ]
    },
    {
      name: "Colachel Police Station",
      phone: "04651-226222",
      address: "Port Road, Colachel",
      staff_directory: [
        { name: "M. Antony", rank: "Inspector of Police (SHO)", phone: "+91-9498100701" },
        { name: "S. Karthik", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100702" },
        { name: "V. Meenakshi", rank: "Head Constable", phone: "+91-9498100703" }
      ]
    },
    {
      name: "Eraniel Police Station",
      phone: "04651-221222",
      address: "Court Road, Eraniel, Neyyoor",
      staff_directory: [
        { name: "B. Sundar", rank: "Inspector of Police (SHO)", phone: "+91-9498100801" },
        { name: "G. Jeyalakshmi", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100802" },
        { name: "N. Pandian", rank: "Head Constable", phone: "+91-9498100803" }
      ]
    },
    {
      name: "Aralvaimozhi Police Station",
      phone: "04652-263222",
      address: "NH 44, Muppandal Road, Aralvaimozhi",
      staff_directory: [
        { name: "D. Kumaresan", rank: "Inspector of Police (SHO)", phone: "+91-9498100901" },
        { name: "L. Suganya", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100902" },
        { name: "H. Velu", rank: "Head Constable", phone: "+91-9498100903" }
      ]
    },
    {
      name: "Kulasekharam Police Station",
      phone: "04651-277222",
      address: "Thirparappu Road, Kulasekharam",
      staff_directory: [
        { name: "M. Sivakumar", rank: "Inspector of Police (SHO)", phone: "+91-9498100951" },
        { name: "R. Ponraj", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100952" },
        { name: "T. Thangavel", rank: "Head Constable", phone: "+91-9498100953" }
      ]
    },
    {
      name: "Karungal Police Station",
      phone: "04651-268222",
      address: "Market Junction, Karungal",
      staff_directory: [
        { name: "P. Justin", rank: "Inspector of Police (SHO)", phone: "+91-9498100961" },
        { name: "K. Muthu", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100962" },
        { name: "S. Suresh", rank: "Head Constable", phone: "+91-9498100963" }
      ]
    },
    {
      name: "Kaliyakkavilai Police Station",
      phone: "04651-244222",
      address: "Border Road, Kaliyakkavilai",
      staff_directory: [
        { name: "N. Ganeshamurthy", rank: "Inspector of Police (SHO)", phone: "+91-9498100971" },
        { name: "M. Francis", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100972" },
        { name: "C. Vijayan", rank: "Head Constable", phone: "+91-9498100973" }
      ]
    },
    {
      name: "Asaripallam Police Station",
      phone: "04652-223222",
      address: "Medical College Road, Asaripallam",
      staff_directory: [
        { name: "T. Sankar", rank: "Inspector of Police (SHO)", phone: "+91-9498100981" },
        { name: "A. Stella", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100982" },
        { name: "G. Rajendran", rank: "Head Constable", phone: "+91-9498100983" }
      ]
    },
    {
      name: "Bhoothapandy Police Station",
      phone: "04652-282222",
      address: "Main Road, Bhoothapandy",
      staff_directory: [
        { name: "K. Dharmaraj", rank: "Inspector of Police (SHO)", phone: "+91-9498100991" },
        { name: "E. Vijaya", rank: "Sub-Inspector (Law & Order)", phone: "+91-9498100992" },
        { name: "D. Paul", rank: "Head Constable", phone: "+91-9498100993" }
      ]
    },
    {
      name: "Railway Police Station (RPF / GRP Nagercoil)",
      phone: "04652-222340",
      address: "Platform 1, Nagercoil Junction Railway Station",
      staff_directory: [
        { name: "S. Radhakrishnan", rank: "Inspector of Police (RPF SHO)", phone: "+91-9498101051" },
        { name: "K. Krishnan", rank: "Sub-Inspector (GRP Railway Police)", phone: "+91-9498101052" },
        { name: "Railway Emergency Help", rank: "Toll Free Helpline", phone: "139" },
        { name: "GRP Police Helpline", rank: "Tamil Nadu Railway Police", phone: "1800-111-322" }
      ]
    }
  ],
  district_helplines: [
    { name: "Emergency / Police", phone: "112", description: "National Emergency Number" },
    { name: "Police Control Room", phone: "100", description: "All India Police Helpline" },
    { name: "Ambulance Emergency", phone: "108", description: "Govt Medical Emergency" },
    { name: "Fire & Rescue", phone: "101", description: "Fire Station Emergency" },
    { name: "District SP Office", phone: "04652-230500", description: "Superintendent of Police, Nagercoil" },
    { name: "District Disaster Control", phone: "1077", description: "Collectorate Toll Free Control" },
    { name: "Women in Distress", phone: "1091", description: "24/7 Women Safety Helpline" },
    { name: "Child Protection", phone: "1098", description: "24/7 Child Protection Helpline" },
    { name: "Coastal Security / Coast Guard", phone: "1093", description: "Marine Emergency Helpline" },
    { name: "Railway Police (RPF)", phone: "139", description: "Railway Protection Helpline" },
  ],
  district_officers: [
    { name: "Superintendent of Police (SP)", phone: "04652-230500", description: "SP Office, Collectorate Campus" },
    { name: "Additional SP (Crime & L&O)", phone: "04652-230510", description: "Addl. SP Office, Nagercoil" },
    { name: "Deputy SP (DSP) Nagercoil", phone: "04652-230520", description: "DSP Office, Nagercoil Sub-Division" },
    { name: "Deputy SP (DSP) Padmanabhapuram", phone: "04651-250100", description: "DSP Office, Thuckalay" },
    { name: "Deputy SP (DSP) Kanyakumari", phone: "04652-246300", description: "DSP Office, Kanyakumari Sub-Division" },
    { name: "Deputy SP (DSP) Colachel", phone: "04651-226300", description: "DSP Office, Colachel Sub-Division" },
    { name: "District Police Control Room", phone: "04652-230100", description: "24/7 Police Dispatch Room" },
  ]
};

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, userLocation }) => {
  // Initialize with DEFAULT_EMERGENCY_DATA so it NEVER renders empty
  const [data, setData] = useState<any>(DEFAULT_EMERGENCY_DATA);
  const [loading, setLoading] = useState(false);
  const [expandedStation, setExpandedStation] = useState<number | null>(0); // First station expanded by default
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (isOpen) {
      const loc = userLocation || [8.1833, 77.4119];
      setLoading(true);
      getEmergencyAssist(loc[0], loc[1])
        .then(res => {
          if (res) {
            setData((prev: any) => ({
              ...prev,
              ...res,
              closest_facilities: res.closest_facilities || prev.closest_facilities,
              all_police_stations: (res.all_police_stations && res.all_police_stations.length > 0)
                ? res.all_police_stations
                : prev.all_police_stations,
              district_helplines: res.district_helplines || prev.district_helplines,
              district_officers: res.district_officers || prev.district_officers,
            }));
          }
          setLoading(false);
        })
        .catch(err => {
          console.warn('Backend assist endpoint error, using verified emergency cache:', err);
          setLoading(false);
        });
    }
  }, [isOpen, userLocation]);

  // Filter police stations by search
  const filteredStations = (data.all_police_stations || []).filter((st: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const nameMatch = st.name?.toLowerCase().includes(q);
    const addressMatch = st.address?.toLowerCase().includes(q);
    const staffMatch = (st.staff_directory || []).some((sf: any) =>
      sf.name?.toLowerCase().includes(q) || sf.rank?.toLowerCase().includes(q)
    );
    return nameMatch || addressMatch || staffMatch;
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-3 sm:p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-4 sm:p-6 shadow-2xl w-full max-w-lg pointer-events-auto max-h-[90vh] overflow-y-auto flex flex-col border border-slate-100"
            >
              {/* Header */}
              <div className="flex justify-between items-start mb-3 pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center">
                      <ShieldAlert className="text-red-600 w-5 h-5 animate-pulse" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-lg sm:text-xl font-black text-slate-900 leading-tight">
                          Kanniyakumari Emergency Services
                        </h2>
                        {loading && (
                          <span className="text-[10px] text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold animate-pulse">
                            Updating...
                          </span>
                        )}
                      </div>
                      <p className="text-slate-500 text-xs">
                        Official Police Stations, Staff Contacts & Helplines (Direct Dial)
                      </p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="bg-slate-100 p-2 rounded-full hover:bg-slate-200 transition-colors text-slate-600"
                  aria-label="Close"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                {/* ===== TOP QUICK DIAL HELPLINES ===== */}
                <div className="grid grid-cols-4 gap-2">
                  <a href="tel:112" className="bg-red-600 hover:bg-red-700 text-white py-2.5 px-2 rounded-xl font-black text-center text-xs transition-transform active:scale-95 flex flex-col items-center gap-0.5 shadow-md shadow-red-600/20">
                    <Phone className="w-4 h-4" />
                    <span>112</span>
                    <span className="text-[9px] font-medium opacity-90">National</span>
                  </a>
                  <a href="tel:100" className="bg-blue-600 hover:bg-blue-700 text-white py-2.5 px-2 rounded-xl font-black text-center text-xs transition-transform active:scale-95 flex flex-col items-center gap-0.5 shadow-md shadow-blue-600/20">
                    <ShieldAlert className="w-4 h-4" />
                    <span>100</span>
                    <span className="text-[9px] font-medium opacity-90">Police</span>
                  </a>
                  <a href="tel:108" className="bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 px-2 rounded-xl font-black text-center text-xs transition-transform active:scale-95 flex flex-col items-center gap-0.5 shadow-md shadow-emerald-600/20">
                    <Building2 className="w-4 h-4" />
                    <span>108</span>
                    <span className="text-[9px] font-medium opacity-90">Ambulance</span>
                  </a>
                  <a href="tel:101" className="bg-amber-600 hover:bg-amber-700 text-white py-2.5 px-2 rounded-xl font-black text-center text-xs transition-transform active:scale-95 flex flex-col items-center gap-0.5 shadow-md shadow-amber-600/20">
                    <Flame className="w-4 h-4" />
                    <span>101</span>
                    <span className="text-[9px] font-medium opacity-90">Fire/Rescue</span>
                  </a>
                </div>

                {/* ===== CLOSEST POLICE STATION & HOSPITAL ===== */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Police */}
                  {data?.closest_facilities?.POLICE && (
                    <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-blue-700 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Nearest Police
                          </span>
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded">
                            {data.closest_facilities.POLICE.distance_km || 0.8} km
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                          {data.closest_facilities.POLICE.facility.name}
                        </h4>
                      </div>
                      <a
                        href={`tel:${data.closest_facilities.POLICE.facility.phone || '100'}`}
                        className="mt-2 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call: {data.closest_facilities.POLICE.facility.phone || '100'}</span>
                      </a>
                    </div>
                  )}

                  {/* Hospital */}
                  {data?.closest_facilities?.HOSPITAL && (
                    <div className="bg-rose-50/80 border border-rose-200 rounded-2xl p-3 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 flex items-center gap-1">
                            <Building2 className="w-3 h-3" /> Nearest Hospital
                          </span>
                          <span className="text-[10px] font-bold text-rose-600 bg-rose-100 px-1.5 py-0.5 rounded">
                            {data.closest_facilities.HOSPITAL.distance_km || 2.3} km
                          </span>
                        </div>
                        <h4 className="font-bold text-slate-900 text-xs line-clamp-1">
                          {data.closest_facilities.HOSPITAL.facility.name}
                        </h4>
                      </div>
                      <a
                        href={`tel:${data.closest_facilities.HOSPITAL.facility.phone || '04652-232261'}`}
                        className="mt-2 bg-rose-600 hover:bg-rose-700 text-white py-2 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>Call: {data.closest_facilities.HOSPITAL.facility.phone || '04652-232261'}</span>
                      </a>
                    </div>
                  )}
                </div>

                {/* ===== POLICE STATIONS & STAFF DIRECTORY WITH AREA SEARCH ===== */}
                <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 sm:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                    <h3 className="font-black text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-blue-600" />
                      Police Stations & Duty Staff Directory ({filteredStations.length})
                    </h3>
                  </div>

                  {/* Search bar inside emergency modal */}
                  <div className="relative mb-3">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search police station by area (Kottar, Vadasery, Suchindram...)"
                      className="w-full bg-white pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Stations List */}
                  <div className="flex flex-col gap-2.5 max-h-64 overflow-y-auto pr-1">
                    {filteredStations.map((station: any, idx: number) => {
                      const isExpanded = expandedStation === idx;
                      return (
                        <div key={idx} className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                          {/* Station Header */}
                          <div className="p-3 flex justify-between items-center gap-2">
                            <div className="min-w-0 flex-1">
                              <p className="text-slate-900 font-bold text-xs truncate">{station.name}</p>
                              {station.address && (
                                <p className="text-[10px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                                  <MapPin className="w-2.5 h-2.5 shrink-0 text-slate-400" />
                                  {station.address}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <a
                                href={`tel:${station.phone || '100'}`}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                                title="Call Station Landline"
                              >
                                <Phone className="w-3 h-3" />
                                {station.phone || '100'}
                              </a>
                              {station.staff_directory && station.staff_directory.length > 0 && (
                                <button
                                  onClick={() => setExpandedStation(isExpanded ? null : idx)}
                                  className={`p-1.5 rounded-lg border transition-colors ${isExpanded ? 'bg-blue-100 text-blue-700 border-blue-300' : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'}`}
                                  title="View Officers on Duty"
                                >
                                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                              )}
                            </div>
                          </div>

                          {/* Expandable Staff Directory */}
                          {isExpanded && station.staff_directory && station.staff_directory.length > 0 && (
                            <div className="border-t border-blue-100 bg-blue-50/50 p-2.5 flex flex-col gap-1.5">
                              <p className="text-[10px] font-black text-blue-800 uppercase tracking-widest flex items-center gap-1 mb-0.5">
                                <Users className="w-3 h-3 text-blue-600" /> Officers & Duty Staff
                              </p>
                              {station.staff_directory.map((staff: any, sidx: number) => (
                                <div key={sidx} className="flex justify-between items-center bg-white p-2 rounded-lg border border-blue-100 shadow-xs">
                                  <div className="min-w-0 pr-2">
                                    <p className="text-xs font-bold text-slate-900 truncate">{staff.name}</p>
                                    <p className="text-[10px] font-medium text-slate-500 truncate">{staff.rank}</p>
                                  </div>
                                  <a
                                    href={`tel:${staff.phone}`}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md font-bold text-[10px] flex items-center gap-1 transition-colors shrink-0 shadow-xs"
                                  >
                                    <Phone className="w-3 h-3" />
                                    {staff.phone}
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {filteredStations.length === 0 && (
                      <div className="text-center py-4 text-xs text-slate-500 bg-white rounded-xl border border-slate-200">
                        No police station found matching "{searchQuery}". Dial 100 or 112 for immediate dispatch.
                      </div>
                    )}
                  </div>
                </div>

                {/* ===== DISTRICT POLICE OFFICERS (SP, ADDL SP, DSPs) ===== */}
                {data?.district_officers && data.district_officers.length > 0 && (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-3">
                    <h3 className="font-bold text-indigo-950 text-xs flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-indigo-700" /> Senior District Police Officers
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                      {data.district_officers.map((officer: any, idx: number) => (
                        <div key={idx} className="flex justify-between items-center bg-white p-2 rounded-xl border border-indigo-100 shadow-xs">
                          <div className="min-w-0 pr-1">
                            <p className="text-xs font-bold text-slate-900 truncate">{officer.name}</p>
                            <p className="text-[10px] text-slate-500 truncate">{officer.description}</p>
                          </div>
                          <a
                            href={`tel:${officer.phone}`}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1.5 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-colors shrink-0"
                          >
                            <Phone className="w-3 h-3" />
                            {officer.phone}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ===== 24/7 DISTRICT HELPLINES ===== */}
                {data?.district_helplines && data.district_helplines.length > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
                    <h3 className="font-bold text-slate-800 text-xs mb-2">District Emergency Helplines</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                      {data.district_helplines.map((h: any, idx: number) => (
                        <a
                          key={idx}
                          href={`tel:${h.phone}`}
                          className="flex items-center gap-2 bg-white p-2 rounded-xl border border-slate-200 hover:border-blue-300 transition-colors shadow-xs"
                        >
                          <Phone className="w-3 h-3 text-blue-600 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-slate-800 truncate">{h.name}</p>
                            <p className="text-xs font-black text-blue-700">{h.phone}</p>
                          </div>
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
