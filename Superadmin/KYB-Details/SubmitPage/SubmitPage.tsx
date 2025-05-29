"use client";
import React, { useEffect } from "react";
import { useRouter } from "next/navigation";

const SubmitPage = () => {
  const router = useRouter();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      router.push("/Superadmin/UserManagement");
    }, 4000);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [router]);
  localStorage.removeItem("company_name");
  localStorage.removeItem("duns_number");
  localStorage.removeItem("company_registration_number");
  localStorage.removeItem("company_website");
  localStorage.removeItem("headquarters_address");
  localStorage.removeItem("country");
  localStorage.removeItem("verification_types");
  localStorage.removeItem("channel_partner");
  localStorage.removeItem("turnaround_time_value");
  localStorage.removeItem("turnaround_time_unit");
  localStorage.removeItem("compliance_certifications");
  localStorage.removeItem("poc_full_name");
  localStorage.removeItem("poc_designation");
  localStorage.removeItem("poc_email");
  localStorage.removeItem("poc_phone_number");
  localStorage.removeItem("charges_per_document");
  localStorage.removeItem("charges_second_access");
  localStorage.removeItem("companyLogoUrl");
  localStorage.removeItem("subscription_plan");

  return (
    <div className="rounded-[30px] border-[rgba(60, 60, 60, 1)] bg-[#0d1f33] flex items-center justify-center p-10">
      <div className="text-center">
        <img
          src="https://res.cloudinary.com/dgfv6j82t/image/upload/v1744372039/njq7itlvlemfsrksxkqh.png"
          alt="submitted"
          className="mx-auto max-w-xs h-auto mb-6"
        />
        <h2 className="text-white text-xl font-semibold mb-2">User Details Created </h2>
        <p className="text-gray-300 text-sm mb-6">
          You've been successfully Onboarded.
        </p>
      </div>
    </div>
  );
};

export default SubmitPage;