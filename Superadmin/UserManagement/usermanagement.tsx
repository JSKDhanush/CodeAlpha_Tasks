"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Loadingspinner = dynamic(() => import("../../assets/loadingspinner"), {
  ssr: false,
});
import "react-phone-number-input/style.css";
import "react-toastify/dist/ReactToastify.css";
import { useUserManagementState } from "./UserManagementState";
import { useUserManagementApi } from "./UserManagementApi";
import { useUserManagementHandlers } from "./UserManagementHandlers";
import { useUserManagementHandlersExtra } from "./UserManagementHandlersExtra";
import { UserManagementUI } from "./UserManagementUI";
import ErrorBoundary from "@/components/ErrorBoundary";

const ToastContainer = dynamic(
  () => import("react-toastify").then((mod) => mod.ToastContainer),
  { ssr: false }
);
const PhoneInput = dynamic(() => import("react-phone-number-input"), {
  ssr: false,
});

const UserManagement: React.FC = () => {
  const state = useUserManagementState();
  const api = useUserManagementApi(state);
  const handlers = useUserManagementHandlers(state, api);
  const [selectAllDepartments, setSelectAllDepartments] =
    useState<boolean>(false); // Added state
  const handlersExtra = useUserManagementHandlersExtra(
    state,
    api,
    setSelectAllDepartments
  ); // Pass setSelectAllDepartments
  const [showLoader, setShowLoader] = useState<boolean>(true);
  const [hasChunkError, setHasChunkError] = useState<boolean>(false);

  useEffect(() => {
    // Hide the loader after 6 seconds
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const handleChunkError = (event: any) => {
      if (
        event.message.includes("Loading chunk") ||
        event.message.includes("failed to fetch dynamically imported module")
      ) {
        setHasChunkError(true);
      }
    };
    window.addEventListener("error", handleChunkError);

    return () => {
      window.removeEventListener("error", handleChunkError);
    };
  }, []);

  // Auto-refresh the page every 5 minutes (300000 ms)
  useEffect(() => {
    const refreshTimer = setTimeout(() => {
      window.location.reload();
    }, 300000); // 5 minutes

    return () => clearTimeout(refreshTimer);
  }, []);

  if (hasChunkError) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
        <h2 className="text-red-500 text-xl font-bold">
          Something went wrong. Please try again later
        </h2>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
        >
          Reload Page
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary
      fallback={
        <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-white">
          <h2 className="text-red-500 text-xl font-bold">
            Something went wrong. Please try again later
          </h2>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md"
          >
            Reload Page
          </button>
        </div>
      }
    >
      <>
        {showLoader ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100vh",
              width: "100%",
              margin: "0 auto",
              backgroundColor: "#000",
              zIndex: 9999,
            }}
          >
            <Loadingspinner />
          </div>
        ) : (
          <>
            <UserManagementUI
              state={state}
              handlers={handlers}
              handlersExtra={handlersExtra}
            />
            <ToastContainer />
          </>
        )}
      </>
    </ErrorBoundary>
  );
};

export default UserManagement;
