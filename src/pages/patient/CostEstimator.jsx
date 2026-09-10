import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calculator, ArrowRight, FileText } from 'lucide-react';
import hospitals from '../../data/hospitals';
import treatments, { formatCost } from '../../data/treatments';
import departments from '../../data/departments';
import { ScrollReveal, AnimatedCounter, MagneticButton } from '../../components/animations/Animations';

export default function CostEstimator() {
  const [selectedHospital, setSelectedHospital] = useState('');
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedTreatment, setSelectedTreatment] = useState('');
  const [showResult, setShowResult] = useState(false);

  const filteredTreatments = selectedDept ? treatments.filter(t => t.dept_id === parseInt(selectedDept)) : treatments;
  const treatment = treatments.find(t => t.id === parseInt(selectedTreatment));
  const hospital = hospitals.find(h => h.id === parseInt(selectedHospital));

  const handleEstimate = () => {
    if (selectedTreatment) {
      setShowResult(false);
      setTimeout(() => setShowResult(true), 100);
    }
  };

  const receiptVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.4, staggerChildren: 0.15, delayChildren: 0.2 }
    }
  };

  const lineItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0, transition: { type: 'spring', damping: 20 } }
  };

  return (
    <div className="animate-fade-in pb-12">
      <ScrollReveal className="page-header mb-8">
        <h1 className="text-3xl font-bold mb-2">Treatment Cost Estimator</h1>
        <p className="text-gray-500">Get estimated treatment costs across government and private hospitals.</p>
      </ScrollReveal>

      <ScrollReveal delay={0.1}>
        <div className="card mb-8 shadow-sm p-6 relative overflow-hidden group">
          <div className="absolute -right-10 -top-10 text-primary/5 group-hover:text-primary/10 transition-colors">
            <Calculator size={150} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
            <div className="form-group mb-0">
              <label className="form-label font-semibold text-gray-700">Hospital (Optional)</label>
              <select className="select bg-white border-gray-200 focus:border-primary" value={selectedHospital} onChange={e => setSelectedHospital(e.target.value)}>
                <option value="">Any Hospital</option>
                {hospitals.map(h => <option key={h.id} value={h.id}>{h.name} ({h.type})</option>)}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold text-gray-700">Department</label>
              <select className="select bg-white border-gray-200 focus:border-primary" value={selectedDept} onChange={e => { setSelectedDept(e.target.value); setSelectedTreatment(''); }}>
                <option value="">All Departments</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.icon} {d.name}</option>)}
              </select>
            </div>
            <div className="form-group mb-0">
              <label className="form-label font-semibold text-gray-700">Treatment / Procedure</label>
              <select className="select bg-white border-gray-200 focus:border-primary" value={selectedTreatment} onChange={e => setSelectedTreatment(e.target.value)}>
                <option value="">Select Treatment</option>
                {filteredTreatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
          </div>
          <div className="mt-6">
            <MagneticButton className="btn btn-primary shadow-lg shadow-primary/20" onClick={handleEstimate} disabled={!selectedTreatment}>
              <Calculator size={18} /> Generate Estimate
            </MagneticButton>
          </div>
        </div>
      </ScrollReveal>

      <AnimatePresence mode="wait">
        {showResult && treatment && (
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="pt-4"
          >
            <h3 className="mb-6 text-2xl font-bold flex items-center gap-3 text-gray-800">
              <FileText className="text-primary" /> Estimated Breakdown
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
              {/* Government */}
              <motion.div variants={receiptVariants} initial="hidden" animate="visible" className="card bg-white shadow-lg border-t-4 border-info relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-info/20"></div>
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <span className="badge badge-info text-sm px-3 py-1">Government Hospital</span>
                  <span className="text-xs text-gray-400">Estimate #GOV-{Math.floor(Math.random() * 1000)}</span>
                </div>
                
                <div className="flex flex-col gap-4 font-mono text-sm">
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Consultation</span>
                    <span className="font-semibold text-gray-800">₹200–₹250</span>
                  </motion.div>
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Treatment / Procedure</span>
                    <span className="font-semibold text-gray-800">₹{treatment.govt_min.toLocaleString()}–₹{treatment.govt_max.toLocaleString()}</span>
                  </motion.div>
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Diagnostics (est.)</span>
                    <span className="font-semibold text-gray-800">₹{Math.round(treatment.govt_min * 0.15).toLocaleString()}–₹{Math.round(treatment.govt_max * 0.2).toLocaleString()}</span>
                  </motion.div>
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center pb-2">
                    <span className="text-gray-500">Medicines (est.)</span>
                    <span className="font-semibold text-gray-800">₹{Math.round(treatment.govt_min * 0.1).toLocaleString()}–₹{Math.round(treatment.govt_max * 0.15).toLocaleString()}</span>
                  </motion.div>
                  
                  <motion.div variants={lineItemVariants} className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 uppercase tracking-wider text-xs">Estimated Total</span>
                      <div className="text-right">
                        <span className="font-bold text-2xl text-info block">
                          ₹<AnimatedCounter value={Math.round(treatment.govt_min * 1.25)} />–₹<AnimatedCounter value={Math.round(treatment.govt_max * 1.35)} />
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">Excludes taxes</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Private */}
              <motion.div variants={receiptVariants} initial="hidden" animate="visible" className="card bg-white shadow-lg border-t-4 border-primary relative overflow-hidden">
                <div className="absolute inset-x-0 top-0 h-1 bg-primary/20"></div>
                <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                  <span className="badge badge-neutral bg-gray-100 text-gray-700 text-sm px-3 py-1">Private Hospital</span>
                  <span className="text-xs text-gray-400">Estimate #PVT-{Math.floor(Math.random() * 1000)}</span>
                </div>
                
                <div className="flex flex-col gap-4 font-mono text-sm">
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Consultation</span>
                    <span className="font-semibold text-gray-800">₹300–₹500</span>
                  </motion.div>
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Treatment / Procedure</span>
                    <span className="font-semibold text-gray-800">₹{treatment.pvt_min.toLocaleString()}–₹{treatment.pvt_max.toLocaleString()}</span>
                  </motion.div>
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-gray-500">Diagnostics (est.)</span>
                    <span className="font-semibold text-gray-800">₹{Math.round(treatment.pvt_min * 0.15).toLocaleString()}–₹{Math.round(treatment.pvt_max * 0.2).toLocaleString()}</span>
                  </motion.div>
                  <motion.div variants={lineItemVariants} className="flex justify-between items-center pb-2">
                    <span className="text-gray-500">Medicines (est.)</span>
                    <span className="font-semibold text-gray-800">₹{Math.round(treatment.pvt_min * 0.1).toLocaleString()}–₹{Math.round(treatment.pvt_max * 0.15).toLocaleString()}</span>
                  </motion.div>
                  
                  <motion.div variants={lineItemVariants} className="mt-4 pt-4 border-t-2 border-dashed border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-gray-800 uppercase tracking-wider text-xs">Estimated Total</span>
                      <div className="text-right">
                        <span className="font-bold text-2xl text-primary block">
                          ₹<AnimatedCounter value={Math.round(treatment.pvt_min * 1.25)} />–₹<AnimatedCounter value={Math.round(treatment.pvt_max * 1.35)} />
                        </span>
                        <span className="text-[10px] text-gray-400 block mt-1">Excludes taxes</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
              className="disclaimer flex items-start gap-3 bg-gray-50 text-gray-600 p-4 rounded-xl border border-gray-200 text-sm"
            >
              <span className="font-bold text-lg text-gray-400 mt-[-2px]">ⓘ</span>
              <p>
                This is an estimate based on available demo data and is not a final quotation.
                Actual treatment costs may vary based on individual medical requirements, hospital policies, and other factors.
                Contact the hospital directly for accurate pricing.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
