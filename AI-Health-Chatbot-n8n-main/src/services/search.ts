import { toast } from 'sonner';

// Simplified Doctor & Health Center data for the search
const healthProviders = [
  { id: '1', name: 'Dr. Aarav Sharma', specialty: 'General Physician', district: 'Mumbai', contact: '022-1234567' },
  { id: '2', name: 'Dr. Priya Patel', specialty: 'Dermatologist', district: 'Pune', contact: '020-7654321' },
  { id: '3', name: 'Dr. Rajesh Kumar', specialty: 'Cardiologist', district: 'Delhi', contact: '011-9876543' },
  { id: '4', name: 'AIIMS Delhi', type: 'Public Hospital', district: 'Delhi', contact: '108' },
];

const medicalTerms = [
  { term: 'Fever', description: 'High body temperature, common symptoms of infection.' },
  { term: 'Diabetes', description: 'A disease that occurs when your blood glucose is too high.' },
  { term: 'Hypertension', description: 'High blood pressure, often without symptoms.' },
];

export const searchHealthResources = (query: string) => {
  const q = query.toLowerCase().trim();
  
  if (!q) return { providers: [], terms: [], schemes: [] };

  const foundProviders = healthProviders.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.specialty?.toLowerCase().includes(q) || 
    p.district.toLowerCase().includes(q)
  );

  const foundTerms = medicalTerms.filter(t => 
    t.term.toLowerCase().includes(q) || 
    t.description.toLowerCase().includes(q)
  );

  // You can also add actual scheme search logic here if integrated
  const foundSchemes = [
    { name: 'PM-JAY', desc: 'Health Insurance for all citizens.' },
    { name: 'Ayushman Bharat', desc: 'National Health Policy.' }
  ].filter(s => s.name.toLowerCase().includes(q) || s.desc.toLowerCase().includes(q));

  return {
    providers: foundProviders,
    terms: foundTerms,
    schemes: foundSchemes
  };
};

export const handleGlobalSearch = (query: string, setResults: any) => {
  const results = searchHealthResources(query);
  setResults(results);
  
  if (results.providers.length === 0 && results.terms.length === 0 && results.schemes.length === 0) {
    toast.error(`No health resources found for "${query}"`);
  } else {
    toast.success(`Found ${results.providers.length + results.terms.length + results.schemes.length} matches!`);
  }
};
