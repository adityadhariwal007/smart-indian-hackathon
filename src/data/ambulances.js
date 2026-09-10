// 50 Ambulances distributed across hospitals
const ambulanceTypes = ['Basic Life Support', 'Advanced Life Support', 'Patient Transport', 'Neonatal Ambulance', 'Cardiac Ambulance'];

const ambulances = [];
for (let i = 1; i <= 50; i++) {
  const hospId = ((i - 1) % 20) + 1;
  const typeIdx = (i - 1) % 5;
  ambulances.push({
    id: i,
    vehicle_number: `DL-${String(Math.floor(Math.random() * 90 + 10))}-${String.fromCharCode(65 + (i % 26))}${String.fromCharCode(65 + ((i * 3) % 26))}-${String(1000 + i)}`,
    type: ambulanceTypes[typeIdx],
    hospital_id: hospId,
    available: Math.random() > 0.3,
    current_location: {
      lat: 28.55 + Math.random() * 0.2,
      lng: 77.05 + Math.random() * 0.35,
    },
    driver_name: `Driver ${i}`,
    driver_phone: `+91-98765-${String(10000 + i).slice(1)}`,
    equipment: typeIdx === 1 ? ['Defibrillator', 'Ventilator', 'Cardiac Monitor', 'IV Pumps'] :
               typeIdx === 0 ? ['First Aid Kit', 'Oxygen Cylinder', 'Stretcher'] :
               typeIdx === 3 ? ['Incubator', 'Neonatal Ventilator', 'Warming Device'] :
               typeIdx === 4 ? ['Cardiac Monitor', 'Defibrillator', 'ECG Machine'] :
               ['Stretcher', 'Wheelchair', 'Oxygen Cylinder'],
  });
}

export default ambulances;
