"use client";
import React, { useState, useEffect } from "react";
import dynamic from "next/dynamic";
const Select = dynamic(() => import("react-select"), { ssr: false });
import { useRouter } from "next/navigation";
import Sidebar from "../../Navbars/Sidebar";
import Header from "../../Navbars/Header";

const complianceOptions = [
  { value: "ISO 27001", label: "ISO 27001" },
  { value: "SOC 2", label: "SOC 2" },
  { value: "GDPR", label: "GDPR" },
  { value: "Other", label: "Other" },
];

const unitOptions = [
  { value: "minutes", label: "Minutes" },
  { value: "hours", label: "Hours" },
  { value: "days", label: "Days" },
];

const channelPartnerOptions = [
  { value: "Self Onboarded", label: "Self Onboarded" },
  { value: "Partner A", label: "Partner A" },
  { value: "Partner B", label: "Partner B" },
  { value: "Other", label: "Other" },
];

const verificationTypeOptions = [
  { value: "KYC", label: "KYC" },
  { value: "KYB", label: "KYB" },
  { value: "Other", label: "Other" },
];

interface FormData {
  turnaround_time_value: string;
  turnaround_time_unit: string;
  compliance_certifications: string[];
  verification_types: string[];
  channel_partner: string;
  charges_per_document: string;
  charges_second_access: string;
  certification_file: string; // Added for certification file URL
}

const VerificationRole = () => {
  const initialTAT = ["", "minutes"];
  const [tatValue, setTatValue] = useState(initialTAT[0]);
  const [tatUnit, setTatUnit] = useState(initialTAT[1]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [isOtherChannelSelected, setIsOtherChannelSelected] = useState(false);
  const [otherChannelValue, setOtherChannelValue] = useState("");
  const [isOtherVerificationSelected, setIsOtherVerificationSelected] = useState(false);
  const [otherVerificationValue, setOtherVerificationValue] = useState("");
  const [isStepOneComplete, setIsStepOneComplete] = useState(false);
  const [usertype, setUsertype] = useState<string>(""); // State for usertype
  const [searchQuery, setSearchQuery] = useState("");
  const [uploading, setUploading] = useState(false); // Added for upload status
  const [uploadError, setUploadError] = useState<string | null>(null); // Added for upload errors
  const [certificationFileUrl, setCertificationFileUrl] = useState(""); // Added for file URL
  const [isOtherCertSelected, setIsOtherCertSelected] = useState(false);
  const [otherCertValue, setOtherCertValue] = useState("");
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const router = useRouter();
  interface HeaderProps {
    searchQuery: string;
    onProfileClick: () => void;
    onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  const [formData, setFormData] = useState<FormData>({
    verification_types: [],
    channel_partner: "",
    turnaround_time_value: "",
    turnaround_time_unit: "minutes",
    compliance_certifications: [],
    charges_per_document: "",
    charges_second_access: "",
    certification_file: "", // Initialize certification_file
  });

  const [formErrors, setFormErrors] = useState({
    verification_types: "",
    channel_partner: "",
    turnaround_time_value: "",
    compliance_certifications: "",
    charges_per_document: "",
    charges_second_access: "",
    certification_file: "", // Added for certification file validation
  });
  // Update isStepOneComplete based on usertype
  useEffect(() => {
    const allFieldsFilled = formData.verification_types.length > 0 &&
      formData.channel_partner.trim().length > 0 &&
      formData.turnaround_time_value.trim().length > 0 &&
      formData.compliance_certifications.length > 0;

    setIsStepOneComplete(allFieldsFilled);
  }, [formData]);

  // Load data from localStorage on component mount
  useEffect(() => {
    const storedUsertype = localStorage.getItem("usertype") || "";
    setUsertype(storedUsertype);
    const storedVerificationTypes = JSON.parse(localStorage.getItem("verification_types") || "[]");
    const storedChannelPartner = localStorage.getItem("channel_partner") || "";
    const storedTurnaroundTimeValue = localStorage.getItem("turnaround_time_value") || "";
    const storedTurnaroundTimeUnit = localStorage.getItem("turnaround_time_unit") || "minutes";
    const storedComplianceCertifications = JSON.parse(localStorage.getItem("compliance_certifications") || "[]");
    const storedChargesPerDocument =
      localStorage.getItem("charges_per_document") || "";
    const storedChargesSecondAccess =
      localStorage.getItem("charges_second_access") || "";
    const storedCertificationFile = localStorage.getItem("certification_file") || ""; // Load certification file


    setFormData({
      verification_types: storedVerificationTypes,
      channel_partner: storedChannelPartner,
      turnaround_time_value: storedTurnaroundTimeValue,
      turnaround_time_unit: storedTurnaroundTimeUnit,
      compliance_certifications: storedComplianceCertifications,
      charges_per_document: storedChargesPerDocument,
      charges_second_access: storedChargesSecondAccess,
      certification_file: storedCertificationFile, // Set certification file
    });

    // Set TAT values if stored
    if (storedTurnaroundTimeValue) {
      const [value, unit] = storedTurnaroundTimeValue.split(" ");
      setTatValue(value || "");
      setTatUnit(unit || "minutes");
    }

    // Check if "Other" is selected for channel partner or verification types
    if (storedChannelPartner === "Other" && storedChannelPartner.includes("Other")) {
      setIsOtherChannelSelected(true);
      setOtherChannelValue(storedChannelPartner.replace("Other", "").trim());
    }
    if (storedVerificationTypes.includes("Other")) {
      const otherValue = storedVerificationTypes.find((v: string) => !verificationTypeOptions.some((opt) => opt.value === v));
      if (otherValue) setOtherVerificationValue(otherValue);
      setIsOtherVerificationSelected(true);
    }
  }, []);

  // Update turnaround_time_value when tatValue or tatUnit changes
  useEffect(() => {
    if (tatValue && tatUnit) {
      setFormData((prev) => ({
        ...prev,
        turnaround_time_value: `${tatValue} ${tatUnit}`,
      }));
    }
  }, [tatValue, tatUnit]);
  // Handle certification file upload
  const handleCertificationUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setUploadError("No file selected.");
      return;
    }

    const allowedTypes = ["image/jpeg", "image/png", "application/pdf"];
    if (!allowedTypes.includes(file.type)) {
      setUploadError("Please upload an image (JPEG/PNG) or PDF file.");
      return;
    }

    try {
      setUploading(true);
      setUploadError(null);
      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("upload_preset", "kyb_certifications"); // Ensure this matches your Cloudinary preset

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dz0declhr/upload",
        {
          method: "POST",
          body: uploadFormData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      if (data.secure_url) {
        setCertificationFileUrl(data.secure_url);
        setFormData((prev) => ({
          ...prev,
          certification_file: data.secure_url,
        }));
      } else {
        throw new Error("No secure URL returned from Cloudinary.");
      }
      setUploading(false);
    } catch (error) {
      console.error("Error uploading certification:", error);
      setUploadError("Failed to upload certification file. Please try again.");
      setUploading(false);
    }
  };

  const handleVerificationChange = (selected: any) => {
    let values = selected ? selected.map((s: any) => s.value) : [];
    if (values.includes("Other") && otherVerificationValue.trim()) {
      values = values.filter((v: string) => v !== "Other");
      values.push(otherVerificationValue.trim());
    }
    setFormData((prev) => ({
      ...prev,
      verification_types: values,
    }));
    setIsOtherVerificationSelected(values.includes("Other"));
  };

  const handleCertificationChange = (selected: any) => {
    let values = selected ? selected.map((s: any) => s.value) : [];
    if (
      formData.compliance_certifications.includes("Other") &&
      otherCertValue.trim()
    ) {
      values = values.filter((v: string) => v !== "Other");
      values.push(otherCertValue.trim());
      setOtherCertValue("");
      setIsOtherCertSelected(false);
    }
    setFormData((prev) => ({
      ...prev,
      compliance_certifications: values,
    }));
    setIsOtherCertSelected(values.includes("Other"));
  };
  const finalizeOtherCert = () => {
    if (!otherCertValue.trim()) return;
    setFormData((prev) => {
      const updated = prev.compliance_certifications.filter(
        (v) => v !== "Other"
      );
      return {
        ...prev,
        compliance_certifications: [...updated, otherCertValue.trim()],
      };
    });
    setOtherCertValue("");
    setIsOtherCertSelected(false);
  };

  const handleChannelPartnerChange = (selected: any) => {
    const value = selected?.value || "";
    setIsOtherChannelSelected(value === "Other");
    if (value === "Other") {
      setFormData((prev) => ({
        ...prev,
        channel_partner: otherChannelValue,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        channel_partner: value,
      }));
    }
  };

  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const verification_typesError =
      formData.verification_types.length === 0 ? "Select Verification Type" : "";
    const channel_partnerError =
      formData.channel_partner.trim() === "" ? "Select Channel Partner" : "";
    let turnaround_time_valueError = "";
    let compliance_certificationsError = "";
    let charges_per_documentError = "";
    let charges_second_accessError = "";
    let certification_fileError = "";

    if (usertype === "Admin-Verifier") {
      turnaround_time_valueError = !tatValue.trim() ? "Enter Turnaround Time" : "";
      compliance_certificationsError =
        formData.compliance_certifications.length === 0
          ? "Select Compliance Certifications"
          : "";
      charges_per_documentError = !formData.charges_per_document.trim()
        ? "Enter Charges for Verification per Document"
        : "";
      charges_second_accessError = !formData.charges_second_access.trim()
        ? "Enter Charges for Second Time Access"
        : "";
      certification_fileError =
        formData.compliance_certifications.length > 0 && !formData.certification_file
          ? "Please upload a certification file"
          : "";
    }

    setFormErrors({
      verification_types: verification_typesError,
      channel_partner: channel_partnerError,
      turnaround_time_value: turnaround_time_valueError,
      compliance_certifications: compliance_certificationsError,
      charges_per_document: charges_per_documentError,
      charges_second_access: charges_second_accessError,
      certification_file: certification_fileError,
    });

    if (
      verification_typesError ||
      channel_partnerError ||
      turnaround_time_valueError ||
      compliance_certificationsError ||
      charges_per_documentError ||
      charges_second_accessError ||
      certification_fileError
    ) {
      return;
    }

    localStorage.setItem("verification_types", JSON.stringify(formData.verification_types));
    localStorage.setItem("channel_partner", formData.channel_partner);
    localStorage.setItem("turnaround_time_value", formData.turnaround_time_value);
    localStorage.setItem("turnaround_time_unit", formData.turnaround_time_unit);
    localStorage.setItem("compliance_certifications", JSON.stringify(formData.compliance_certifications));
    localStorage.setItem("charges_per_document", formData.charges_per_document);
    localStorage.setItem("charges_second_access", formData.charges_second_access);
    localStorage.setItem("certification_file", formData.certification_file); // Save certification file
    router.push("./PointOfContact");
  };

  const finalizeVerification = () => {
    if (!otherVerificationValue.trim()) return;
    setFormData((prev) => {
      const updated = prev.verification_types.filter((v) => v !== "Other");
      return {
        ...prev,
        verification_types: [...updated, otherVerificationValue.trim()],
      };
    });
    setIsOtherVerificationSelected(false);
    setOtherVerificationValue(""); // Optionally clear the input after finalizing
  };

  const finalizeChannelPartner = () => {
    if (!otherChannelValue.trim()) return;
    setFormData((prev) => ({
      ...prev,
      channel_partner: otherChannelValue.trim(),
    }));
    setIsOtherChannelSelected(false);
  };
  // Function to generate preview URL for certification file
  const getPreviewUrl = (url: string) => {
    if (!url) return "";
    if (url.match(/\.pdf$/i)) {
      const parts = url.split("/upload/");
      return `${parts[0]}/upload/c_thumb,w_128,h_128,f_jpg/${parts[1]}`;
    }
    return url;
  };

  const customStyles = {
    control: (base: any,state:any) => ({
      ...base,
      backgroundColor: "#1f2937",
      borderColor: state.isFocused ? "border-gray-700" : "#4b5563", // White border when focused
    color: "white",
    boxShadow: state.isFocused ? "border-gray-700" : "none", // Optional: White shadow for focus
    "&:hover": {
      borderColor: state.isFocused ? "#ffffff" : "#6b7280", // White border on hover when focused
    },
    padding: "0.12rem 0.2rem", // Increased padding for larger appearance
    borderRadius: "0.375rem", // Matches rounded-lg for consistency
    }),
    option: (base: any, state: any) => ({
      ...base,
      backgroundColor: state.isFocused ? "#374151" : "#1f2937",
      color: "white",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "white",
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1f2937",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    multiValue: (base: any) => ({
      ...base,
      backgroundColor: "#374151",
      color: "white",
    }),
    multiValueLabel: (base: any) => ({
      ...base,
      color: "white",
    }),
    input: (base: any) => ({
      ...base,
      color: "white",
    }),
  };

  const unitSelectStyles = {
    control: (base: any,state:any) => ({
      ...base,
      backgroundColor: "#1f2937",
      borderColor: state.isFocused ? "border-gray-700" : "#4b5563", // White border when focused
    color: "white",
    boxShadow: state.isFocused ? "border-gray-700" : "none", // Optional: White shadow for focus
    "&:hover": {
      borderColor: state.isFocused ? "#ffffff" : "#6b7280", // White border on hover when focused
    },
    padding: "0.12rem 0.2rem", // Increased padding for larger appearance
    borderRadius: "0.375rem", // Matches rounded-lg for consistency
    }),
    menu: (base: any) => ({
      ...base,
      backgroundColor: "#1f2937",
      color: "white",
    }),
    option: (base: any, state: { isSelected: any; isFocused: any; }) => ({
      ...base,
      backgroundColor: state.isSelected ? "#4b5563" : state.isFocused ? "#374151" : "#1f2937",
      color: "white",
    }),
    singleValue: (base: any) => ({
      ...base,
      color: "white",
    }),
    placeholder: (base: any) => ({
      ...base,
      color: "#9ca3af",
    }),
    input: (base: any) => ({
      ...base,
      color: "white",
    }),
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center p-4">
      <Header
        searchQuery={searchQuery}
        onSearch={handleSearch} onProfileClick={function (): void {
          throw new Error("Function not implemented.");
        }} />
      <Sidebar />
      <div
        className={`w-full md:w-1/2 bg-[#101828] ml-[200px] border border-gray-600 rounded-[40px] p-6 text-white ${usertype === "Admin-Verifier" ? "mt-[65px]" : "mb-[210px]"
          }`}
      >
        <h2 className="text-center text-lg font-semibold mb-4">KYB Details</h2>
        <div className="flex items-center justify-between w-4/5 mx-auto my-4">
          <div className="flex flex-col items-center relative translate-y-2">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
              ✓
            </span>
            <span className="text-[10px] mt-1 text-white">Company</span>
            <span className="text-[10px] -mt-[2px] text-white">Details</span>
          </div>
          <div className="flex-grow h-0.5 bg-blue-600 mx-[-11px] mt-[-20px]" />
          <div className="flex flex-col items-center relative">
            {isStepOneComplete ? (
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                ✓
              </span>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-blue-800 font-bold text-sm">
                •
              </span>
            )}
            <span className="text-[10px] mt-1 text-white font-bold">Role & Info</span>
          </div>
          <div className="flex-grow h-0.5 bg-white mx-[-11px] mt-[-20px]" />
          <div className="flex flex-col items-center relative">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-blue-800 font-bold text-sm">
              •
            </span>
            <span className="text-[10px] mt-1 text-white">POC</span>
          </div>
        </div>
        <div className="w-full h-px bg-[radial-gradient(circle,_rgba(148,_148,_148,_0.5)_1px,_transparent_1px)] [background-size:6px_1px]"></div>

        <form className="space-y-4" onSubmit={handleNext}>
          <div className="font-bold text-[20px] mt-8">Verification Role</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Verfication type you are looking for</label>
              <Select
                isMulti
                options={verificationTypeOptions}
                value={verificationTypeOptions
                  .filter((opt) => formData.verification_types.includes(opt.value))
                  .concat(
                    formData.verification_types
                      .filter((v) => !verificationTypeOptions.some((opt) => opt.value === v))
                      .map((val) => ({ value: val, label: val }))
                  )}
                onChange={handleVerificationChange}
                styles={customStyles}
                placeholder="Select Verification Type"
              />
              {formSubmitted && formErrors.verification_types && (
                <p className="text-red-500 text-sm">{formErrors.verification_types}</p>
              )}

            </div>

            {isOtherVerificationSelected && (
              <div>
                <label className="block text-sm mb-1">Specify Other Verification</label>
                <input
                  type="text"
                  value={otherVerificationValue}
                  onChange={(e) => setOtherVerificationValue(e.target.value)}
                  onBlur={finalizeVerification}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      finalizeVerification();
                    }
                  }}
                  placeholder="Enter Verification Type"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 placeholder:text-sm"
                  autoFocus
                />
              </div>
            )}

            <div>
              <label className="block text-sm mb-1">Select Channel Partner</label>
              <Select
                options={channelPartnerOptions}
                value={
                  channelPartnerOptions.find((opt) => opt.value === formData.channel_partner) ||
                  (formData.channel_partner
                    ? { value: formData.channel_partner, label: formData.channel_partner }
                    : null)
                }
                onChange={handleChannelPartnerChange}
                styles={customStyles}
                placeholder="Select Channel Partner"
              />
              {formSubmitted && !formData.channel_partner.trim() && (
                <p className="text-red-500 text-xs mt-1">Channel Partner is required</p>
              )}
            </div>

            {isOtherChannelSelected && (
              <div>
                <label className="block text-sm mb-1">Specify Other Channel Partner</label>
                <input
                  type="text"
                  value={otherChannelValue}
                  onChange={(e) => setOtherChannelValue(e.target.value)}
                  onBlur={finalizeChannelPartner}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      finalizeChannelPartner();
                    }
                  }}
                  placeholder="Enter Channel Partner Name"
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 placeholder:text-sm"
                  autoFocus
                />
              </div>
            )}
            {usertype === "Admin-Verifier" && (
              <>
                <div>
                  <label className="block text-sm mb-1">
                    Charges for Verification per Document
                  </label>
                  <input
                    type="number"
                    value={formData.charges_per_document}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        charges_per_document: e.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    className={`w-full px-3 py-2 bg-gray-800 border ${formSubmitted && !formData.charges_per_document.trim()
                      ? "border-red-500"
                      : "border-gray-700"
                      } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
                  />
                  {formSubmitted && !formData.charges_per_document.trim() && (
                    <p className="text-red-500 text-xs mt-1">
                      Charges for Verification per Document is required
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm mb-1">
                    Charges for Second Time Access for Document
                  </label>
                  <input
                    type="number"
                    value={formData.charges_second_access}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        charges_second_access: e.target.value,
                      }))
                    }
                    placeholder="Enter amount"
                    className={`w-full px-3 py-2 bg-gray-800 border ${formSubmitted && !formData.charges_second_access.trim()
                      ? "border-red-500"
                      : "border-gray-700"
                      } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
                  />
                  {formSubmitted && !formData.charges_second_access.trim() && (
                    <p className="text-red-500 text-xs mt-1">
                      Charges for Second Time Access is required
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
          {usertype === "Admin-Verifier" && (
            <>


              <div className="text-[20px] font-bold">Operational Info</div>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <label className="block text-sm mb-1">Turnaround Time (TAT)</label>
                  <input
                    type="number"
                    value={tatValue}
                    onChange={(e) => setTatValue(e.target.value)}
                    placeholder="Enter number (e.g., 1 for 1 hours)"
                    className={`w-full px-3 py-2 bg-gray-800 border ${formSubmitted && !tatValue.trim() ? "border-red-500" : "border-gray-700"
                      } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
                  />
                  {formSubmitted && !tatValue.trim() && (
                    <p className="text-red-500 text-xs mt-1">Turnaround Time is required</p>
                  )}
                </div>

                <div className="flex-1">
                  <label className="block text-sm mb-1">Select Unit</label>
                  <Select
                    options={unitOptions}
                    value={unitOptions.find((opt) => opt.value === tatUnit)}
                    onChange={(selected) => setTatUnit(selected.value)}
                    styles={unitSelectStyles}
                    placeholder="Select Unit"
                  />
                </div>
              </div>

              <div className="w-full">
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Compliance Certifications</label>
                    <Select
                      isMulti
                      options={complianceOptions}
                      value={complianceOptions
                        .filter((opt) => formData.compliance_certifications.includes(opt.value))
                        .concat(
                          formData.compliance_certifications
                            .filter((v) => !complianceOptions.some((opt) => opt.value === v))
                            .map((val) => ({ value: val, label: val }))
                        )}
                      onChange={handleCertificationChange}
                      styles={customStyles}
                      placeholder="Select Compliance Certifications"
                    />
                    {formSubmitted && formErrors.compliance_certifications && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.compliance_certifications}</p>
                    )}
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm mb-1">Upload Certification</label>
                    <div className="relative w-full flex items-center bg-gray-800 border border-gray-700 rounded-md px-3 py-1">
                      <div className="relative flex items-center w-full gap-3">
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={handleCertificationUpload}
                          disabled={uploading}
                          className="w-full opacity-0 absolute inset-0 cursor-pointer"
                        />
                        <span className="px-5 py-1.5 bg-gray-700 border border-gray-500 rounded text-white text-sm cursor-pointer">
                          Choose File
                        </span>
                        {uploading && (
                          <p className="text-yellow-400 text-xs mt-1">Uploading...</p>
                        )}
                        {formData.certification_file && !uploading && (
                          <p className="text-green-500 text-xs mt-1">File uploaded successfully</p>
                        )}
                      </div>
                      {formData.certification_file && !uploading && (
                        <div className="flex items-center">
                          <a
                            href={formData.certification_file}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src={getPreviewUrl(formData.certification_file)}
                              alt="Certification Preview"
                              className="w-6 h-6 object-cover rounded-md border border-gray-700 hover:opacity-80 transition-opacity"
                            />
                          </a>
                        </div>
                      )}
                    </div>
                    {uploadError && (
                      <p className="text-red-500 text-xs mt-1">{uploadError}</p>
                    )}
                    {formSubmitted && formErrors.certification_file && (
                      <p className="text-red-500 text-xs mt-1">{formErrors.certification_file}</p>
                    )}
                  </div>
                </div>
                {isOtherCertSelected && (
                  <div className="mt-4">
                    <label className="block text-sm mb-1">
                      Specify Other Certification
                    </label>
                    <input
                      type="text"
                      value={otherCertValue}
                      onChange={(e) => setOtherCertValue(e.target.value)}
                      onBlur={finalizeOtherCert}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          finalizeOtherCert();
                        }
                      }}
                      placeholder="Enter certification name"
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 placeholder:text-sm"
                      autoFocus
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <div className="flex gap-4 pt-4 items-end justify-end">
            <button
              type="button"
              className="text-white border border-yellow-400 rounded-lg px-4 py-2"
              onClick={() => router.back()}
            >
              Previous
            </button>
            <button
              type="submit"
              className="bg-yellow-400 text-black px-6 py-2 rounded-lg font-semibold"
            >
              Next
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VerificationRole;