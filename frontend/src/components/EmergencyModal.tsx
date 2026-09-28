import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, ShieldAlert, X } from 'lucide-react';
import { getEmergencyAssist } from '../api';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: [number, number] | null;
}

export const EmergencyModal: React.FC<EmergencyModalProps> = ({ isOpen, onClose, userLocation }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const loc = userLocation || [8.1833, 77.4119];
      setLoading(true);
      getEmergencyAssist(loc[0], loc[1])
        .then(res => {
          setData(res);
          setLoading(false);
        })
        .catch(err => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [isOpen, userLocation]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />
          <div className="fixed inset-0 flex items-center justify-center z-[110] p-4 pointer-events-none">
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="bg-white rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-md pointer-events-auto"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShieldAlert className="text-red-500 w-7 h-7" />
                    Emergency
                  </h2>
                  <p className="text-gray-500 mt-1 text-sm">Nearest verified facilities</p>
                </div>
                <button
                  onClick={onClose}
                  className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500">Locating nearest help...</div>
              ) : (
                <div className="space-y-4">
                  {/* Nearest Police */}
                  {data?.closest_facilities?.POLICE && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-blue-900">Police Station</h3>
                          <p className="text-blue-700/80 text-sm font-medium">{data.closest_facilities.POLICE.facility.name}</p>
                        </div>
                        <span className="text-blue-600 font-medium text-sm bg-blue-100 px-2 py-1 rounded-lg">
                          {Math.round(data.closest_facilities.POLICE.facility.distance_meters)}m
                        </span>
                      </div>
                      <a href={`tel:${data.closest_facilities.POLICE.facility.phone || '100'}`} className="bg-blue-600 hover:bg-blue-700 text-white w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" />
                        Call {data.closest_facilities.POLICE.facility.phone || '100'}
                      </a>
                    </div>
                  )}

                  {/* Nearest Hospital */}
                  {data?.closest_facilities?.HOSPITAL && (
                    <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-red-900">Hospital</h3>
                          <p className="text-red-700/80 text-sm font-medium">{data.closest_facilities.HOSPITAL.facility.name}</p>
                        </div>
                        <span className="text-red-600 font-medium text-sm bg-red-100 px-2 py-1 rounded-lg">
                          {Math.round(data.closest_facilities.HOSPITAL.facility.distance_meters)}m
                        </span>
                      </div>
                      <a href={`tel:${data.closest_facilities.HOSPITAL.facility.phone || '108'}`} className="bg-red-600 hover:bg-red-700 text-white w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" />
                        Call {data.closest_facilities.HOSPITAL.facility.phone || '108'}
                      </a>
                    </div>
                  )}
                  
                  {/* Missing facilities fallback */}
                  {(!data?.closest_facilities?.POLICE_STATION || !data?.closest_facilities?.HOSPITAL) && (
                    <div className="text-center text-sm text-gray-500">
                      Some facilities could not be found nearby. Dial 112 for general emergencies.
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
