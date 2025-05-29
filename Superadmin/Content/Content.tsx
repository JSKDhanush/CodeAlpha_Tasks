"use client";
import React, { useState } from "react";
import Header from "../Navbars/Header";
import SideBar from "../Navbars/Sidebar";
import Roles from "./Roles";
import Category from "./Category";

const Content = () => {
  const [activeComponent, setActiveComponent] = useState("");

  return (
    <div className="min-h-screen bg-[#000000]">
      <Header />
      <div className="flex">
        <SideBar />
        <div className="flex-1 p-6">
          {activeComponent === "roles" ? (
            <Roles />
          ) : activeComponent === "category" ? (
            <Category />
          ) : (
            <div className="mt-[170px] ml-[320px]">
              {/* Content Management Title */}
              <h1 className="text-white text-[16px] font-semibold mb-8">
                Content Management
              </h1>

              {/* Grid Buttons */}
              <div className="grid grid-cols-2 gap-1">
                {/* Roles */}
                <button
                  onClick={() => setActiveComponent("roles")}
                  className="relative w-[260px] h-[150px] border-2 hover:border-green-400 bg-[#000000] text-white font-semibold rounded-lg overflow-hidden"
                >
                  <img
                    className="w-[40px] h-[40px] mx-auto mb-2 mt-4"
                    alt="roles"
                    src="https://res.cloudinary.com/dgfv6j82t/image/upload/v1737958058/carbon_currency_mkzolk.svg"
                  />
                  <span className="text-white text-[12px]">Roles</span>
                </button>

                {/* Category */}
                <button
                  onClick={() => setActiveComponent("category")}
                  className="relative w-[260px] h-[150px] border-2 hover:border-green-400 bg-[#000000] text-white font-semibold rounded-lg overflow-hidden z-10 group"
                >
                  <img
                    className="w-[40px] h-[40px] mx-auto mb-2 mt-4"
                    alt="category"
                    src="https://res.cloudinary.com/dgfv6j82t/image/upload/v1737958058/mdi-light_gender-transgender_fhz8kb.svg"
                  />
                  <span className="text-white text-[12px]">Category</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Content;
