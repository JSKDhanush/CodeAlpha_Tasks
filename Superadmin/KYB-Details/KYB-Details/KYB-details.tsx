"use client";

import { useRouter } from "next/navigation";
import React, { useRef, useState, useEffect } from "react";
import { FaRegImage } from "react-icons/fa";
import dynamic from "next/dynamic";
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false, // Disable SSR for this component
});
import Sidebar from "../../Navbars/Sidebar";
import Header from "../../Navbars/Header";
import "react-phone-number-input/style.css";

const KYBdetails = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    company_name: "",
    duns_number: "",
    company_registration_number: "",
    company_website: "",
    country: "",
    headquarters_address: "",
    company_logo: "",
  });
  const fileInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dunsError, setDunsError] = useState("");
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isStepOneComplete, setIsStepOneComplete] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  const router = useRouter();
  interface HeaderProps {
    searchQuery: string;
    onProfileClick: () => void;
    onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  }
  // Load data from localStorage on component mount
  useEffect(() => {
    const storedCompanyName = localStorage.getItem("company_name") || "";
    const storedDunsNumber = localStorage.getItem("duns_number") || "";
    const storedCompanyRegistrationNumber =
      localStorage.getItem("company_registration_number") || "";
    const storedCompanyWebsite = localStorage.getItem("company_website") || "";
    const storedCountry = localStorage.getItem("country") || "";
    const storedHeadquartersAddress =
      localStorage.getItem("headquarters_address") || "";
    const storedCompanyLogoUrl =
      localStorage.getItem("companyLogoUrl") || localStorage.getItem("logo");

    setFormData({
      company_name: storedCompanyName,
      duns_number: storedDunsNumber,
      company_registration_number: storedCompanyRegistrationNumber,
      company_website: storedCompanyWebsite,
      country: storedCountry,
      headquarters_address: storedHeadquartersAddress,
      company_logo: storedCompanyLogoUrl || "",
    });

    if (storedCompanyLogoUrl) {
      setLogoPreview(storedCompanyLogoUrl);
    } else if (localStorage.getItem("logo")) {
      setLogoPreview(localStorage.getItem("logo"));
    }

    // Set searchTerm to match the stored country for the dropdown
    setSearchTerm(storedCountry);
  }, []);

  const handleClick = () => {
    fileInputRef.current.click(); // opens file input
  };
  useEffect(() => {
    const allFieldsFilled = formData.company_name.length > 0 &&
      formData.company_registration_number.trim().length > 0 &&
      formData.country.trim().length > 0 &&
      formData.headquarters_address.length > 0 &&
      formData.duns_number.length > 0
      && logoPreview !== null; // Check if all required fields are filled

    setIsStepOneComplete(allFieldsFilled);
  }, [formData]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagePreview(URL.createObjectURL(file));
      localStorage.setItem("logo", URL.createObjectURL(file)); // Store the image URL in localStorage
    }
  };

  const countries = [
    "India",
    "USA",
    "UK",
    "Canada",
    "Australia",
    "Germany",
    "France",
    "Japan",
    "China",
    "Brazil",
  ];
  const filteredCountries = countries.filter((country) =>
    country.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    let updatedValue = value;

    // Capitalize first letter for company_name
    if (name === "company_name" && value) {
      updatedValue = value.charAt(0).toUpperCase() + value.slice(1);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: updatedValue,
    }));
  };
  const handleRegistrationNumberChange = (value: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      company_registration_number: value || "",
    }));
  };
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Create preview
    const previewUrl = URL.createObjectURL(file);
    setLogoPreview(previewUrl);
    setLogoFile(file);

    // Upload to Cloudinary
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "kyb_logos"); // Replace with your Cloudinary upload preset

      const response = await fetch(
        "https://api.cloudinary.com/v1_1/dz0declhr/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      localStorage.setItem("companyLogoUrl", data.secure_url);
      setUploading(false);
    } catch (error) {
      console.error("Error uploading logo:", error);
      setUploading(false);
    }
  };

  const handleChangeDuns = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (value === "") {
      setDunsError("DUNS Number is required.");
    } else if (!/^\d{0,9}$/.test(value)) {
      setDunsError("DUNS Number must contain only digits.");
    } else if (value.length < 9) {
      setDunsError("DUNS Number must be 9 digits.");
    } else {
      setDunsError("");
    }
  };

  const handleNext = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormSubmitted(true);

    const errors: any = {
      company_logo: !logoPreview ? "Company logo is required" : "",
      company_name: !formData.company_name ? "Company name is required" : "",
      duns_number: !formData.duns_number ? "DUNS Number is required" : "",
      company_registration_number: !formData.company_registration_number
        ? "Company Registration Number is required"
        : "",
      country: !formData.country ? "Select Country name" : "",
      headquarters_address: !formData.headquarters_address
        ? "HeadQuarters Address is required"
        : "",
    };

    const hasError = Object.values(errors).some((error) => error);
    if (hasError) return;

    // Store each field separately in localStorage
    localStorage.setItem("company_name", formData.company_name);
    localStorage.setItem("duns_number", formData.duns_number);
    localStorage.setItem(
      "company_registration_number",
      formData.company_registration_number
    );
    localStorage.setItem("company_website", formData.company_website);
    localStorage.setItem("headquarters_address", formData.headquarters_address);
    localStorage.setItem("country", formData.country);
    router.push("./VerificationRole");
  };

  return (
    <div className="min-h-screen bg-[#121212] flex items-center justify-center px-4  ">
      <Header
        searchQuery={searchQuery}
        onSearch={handleSearch} onProfileClick={function (): void {
          throw new Error("Function not implemented.");
        }} />
      <style jsx>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 30px #1f2937 inset !important;
          box-shadow: 0 0 0 30px #1f2937 inset !important;
          -webkit-text-fill-color: #ffffff !important;
        }
      `}</style>
      <Sidebar />
      <div className="w-full md:w-1/2 mt-[80px] mb-[10px] ml-[200px] bg-[#101828] border border-gray-600 rounded-[40px] p-6 text-white">
        <h2 className="text-center text-lg font-semibold mb-3">KYB Details</h2>

        {/* Stepper */}
        <div className="flex items-center justify-between w-4/5 mx-auto my-4">
          <div className="flex flex-col items-center relative translate-y-2">
            {isStepOneComplete ? (
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm">
                ✓
              </span>
            ) : (
              <span className="w-6 h-6 flex items-center justify-center rounded-full bg-white text-blue-800 font-bold text-sm">
                •
              </span>
            )}
            <span className="text-[10px] mt-1 text-white">Company</span>
            <span className="text-[10px] mt-1 text-white">Details</span>
          </div>
          <div className="flex-grow h-0.5 bg-gray-400 mx-[-11px] mt-[-20px]" />

          <div className="flex flex-col items-center relative">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-blue-800 font-bold border border-blue-600 text-center text-lg leading-none ">
              <span className="-translate-y-1">.</span>
            </span>
            <span className="text-[10px] mt-1 text-gray-400">Role & Info</span>
          </div>

          <div className="flex-grow h-0.5 bg-gray-400 mx-[-11px] mt-[-20px]" />

          <div className="flex flex-col items-center relative">
            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-200 text-blue-800 font-bold border border-blue-600 text-center text-lg leading-none ">
              <span className="-translate-y-1">.</span>
            </span>
            <span className="text-[10px] mt-1 text-gray-400 font-bold">
              POC
            </span>
          </div>
        </div>
        <div className="w-full h-px bg-[radial-gradient(circle,_rgba(148,_148,_148,_0.5)_1px,_transparent_1px)] [background-size:6px_1px]"></div>
        <form className="mt-2">
          <div className="text-[20px] font-bold">Company Details</div>

          <div className="flex flex-col items-center border border-dashed border-gray-500 p-2 mx-[15rem] rounded-md text-sm text-center">
            {logoPreview ? (
              <div className="relative">
                <img
                  src={logoPreview}
                  alt="Company Logo"
                  className="w-20 h-20 object-cover rounded-full mb-2"
                />
                {uploading && (
                  <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-full">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            ) : (
              <FaRegImage className="w-5 h-5 text-gray-400 mb-2" />
            )}
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoUpload}
              className="hidden"
              ref={fileInputRef}
            />
            <label
              htmlFor="logo-upload"
              className={`text-green-400 cursor-pointer ${uploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
            >
              {uploading
                ? "Uploading..."
                : logoPreview
                  ? "Change logo"
                  : "Set logo"}
            </label>

          </div>
          {formSubmitted && !logoPreview && (
            <p className="text-red-500 text-xs mt-1 text-center">
              Company logo is required
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-5">
            <div>
              <label className="block text-sm mb-1">Company Name</label>
              <input
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                placeholder="Registered company name"
                className={`w-full px-3 py-1 bg-gray-800 border ${formSubmitted && formData.company_name.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                  } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
              />
              {formSubmitted && formData.company_name.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1">
                  Company name is required
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">DUNS Number</label>
              <input
                type="text"
                name="duns_number"
                value={formData.duns_number}
                onChange={handleChangeDuns}
                placeholder="Enter DUNS number (e.g., 123456789)"
                pattern="\d{9}"
                maxLength={9}
                className={`w-full px-3 py-1 bg-gray-800 border ${formSubmitted && formData.duns_number.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                  } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
              />
              {dunsError && (
                <p className="text-red-500 text-xs mt-1">
                  {dunsError} (e.g., 123456789)
                </p>
              )}
              {formSubmitted && formData.duns_number.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1">
                  A unique nine-digit identifier issued by Dun & Bradstreet for
                  businesses.
                </p>
              )}
            </div>

            <div className="relative w-full">
              <label className="block text-sm mb-1">Country</label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setFormData({ ...formData, country: e.target.value });
                  setIsOpen(true);
                }}
                onClick={() => setIsOpen(!isOpen)}
                placeholder="Select Country"
                className={`w-full px-3 py-1 bg-gray-800 border ${formSubmitted && formData.country.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                  } rounded-md text-white placeholder-gray-400`}
              />

              {/* Dropdown Options */}
              {isOpen && filteredCountries.length > 0 && (
                <div className="absolute z-10 mt-1 bg-gray-800 border border-white/20 rounded shadow w-full max-h-28 overflow-auto">
                  {filteredCountries.map((country, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setFormData({ ...formData, country });
                        setSearchTerm(country);
                        setIsOpen(false);
                      }}
                      className={`px-3 py-1 text-white hover:bg-gray-700 cursor-pointer ${formData.country === country
                          ? "border-gray-300 rounded-[70px]"
                          : ""
                        }`}
                    >
                      {country}
                    </div>
                  ))}
                </div>
              )}

              {/* Validation */}
              {formSubmitted && formData.country.trim().length === 0 && (
                <p className="text-red-500 text-xs mt-1">Country is required</p>
              )}
            </div>

            <div>
              <label className="block text-sm mb-1">
                Company Registration Number
              </label>
              <div
                className={`w-full bg-gray-800 border ${formSubmitted &&
                    formData.company_registration_number.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                  } rounded-md flex items-center px-2 py-1 mb-3`}
              >
                <PhoneInput
                  international
                  defaultCountry="IN"
                  value={formData.company_registration_number}
                  onChange={handleRegistrationNumberChange}
                  pattern="\d{9}"
                  maxLength={15}
                  placeholder="Enter registration number"
                  className="w-full text-white [&_.PhoneInputCountrySelect]:bg-[#101828] [&_.PhoneInputInput]:bg-gray-800 [&_.PhoneInputInput]:text-white [&_.PhoneInputInput]:outline-none [&_.PhoneInputInput]:border-none"
                />
              </div>
              {formSubmitted &&
                formData.company_registration_number.trim().length === 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Company Registration Number is required
                  </p>
                )}
            </div>
          </div>

          <div className="w-full">
            <div className="w-full mb-3 ">
              <label className="block text-sm mb-1">
                Company Website (Optional)
              </label>
              <input
                type="url"
                name="company_website"
                value={formData.company_website}
                onChange={handleChange}
                placeholder="Enter Company website"
                className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-400 placeholder:text-sm"
              />
            </div>

            <div className="w-full">
              <label className="block text-sm">Headquarters Address</label>
              <textarea
                name="headquarters_address"
                value={formData.headquarters_address}
                onChange={handleChange}
                rows={2}
                placeholder="Enter Headquarters Address"
                className={`w-full px-3 py-1 bg-gray-800 border ${formSubmitted &&
                    formData.headquarters_address.trim().length === 0
                    ? "border-red-500"
                    : "border-gray-700"
                  } rounded-md text-white placeholder-gray-400 placeholder:text-sm`}
              />
              {formSubmitted &&
                formData.headquarters_address.trim().length === 0 && (
                  <p className="text-red-500 text-xs mt-1">
                    Headquarters Address is required
                  </p>
                )}
            </div>
          </div>

          {/* Buttons */}
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
              onClick={handleNext}
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

export default KYBdetails;
