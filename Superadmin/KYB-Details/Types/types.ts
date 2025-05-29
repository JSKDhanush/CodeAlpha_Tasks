// types.ts
export interface ComplianceOption {
  value: string;
  label: string;
}

export interface CompanyDetailsFormData {
  company_name: string;
  duns_number: string;
  company_registration_number: string;
  company_website: string;
  country: string;
  headquarters_address: string;
  verification_types: string[];
  channel_partner: string;
  // other_channel_partner: string;
  turnaround_time_value: string;
  turnaround_time_unit: string;
  compliance_certifications: string[];
  // other_certifications: string;
  poc_full_name: string;
  poc_designation: string;
  poc_email: string;
  poc_phone_number: string;
  user_type: string;
  company_logo: string;
}


export interface OperationalProps {
  formData: CompanyDetailsFormData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyDetailsFormData>>;
  formSubmitted: boolean;
}

export interface PocContactProps {
  formData: CompanyDetailsFormData;
  setFormData: React.Dispatch<React.SetStateAction<CompanyDetailsFormData>>;
  formSubmitted: boolean; // Add this line
}
