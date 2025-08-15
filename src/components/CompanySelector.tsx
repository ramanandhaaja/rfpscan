import React from 'react';
import { Company } from '@/types/agent';

interface CompanySelectorProps {
  selectedCompany: Company;
  onCompanyChange: (company: Company) => void;
}

const companies: { value: Company; label: string }[] = [
  { value: 'orange', label: 'Orange' },
  { value: 'kpn', label: 'KPN' },
  { value: 'tmobile', label: 'T-Mobile' },
  { value: 'vodafone', label: 'Vodafone' },
  { value: 'other', label: 'Other' },
];

export default function CompanySelector({ selectedCompany, onCompanyChange }: CompanySelectorProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-lg font-semibold mb-4">Company</h2>
      <div className="space-y-2">
        {companies.map((company) => (
          <button
            key={company.value}
            onClick={() => onCompanyChange(company.value)}
            className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
              selectedCompany === company.value
                ? 'bg-blue-100 text-blue-700 font-medium'
                : 'hover:bg-gray-100'
            }`}
          >
            {company.label}
          </button>
        ))}
      </div>
    </div>
  );
}
