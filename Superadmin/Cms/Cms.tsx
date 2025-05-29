"use client";
import React, { useState } from "react";
import Header from "../Navbars/Header";
import SideBar from "../Navbars/Sidebar";
import Roles from "./Roles";
import Category from "./Category";

const Cms = () => {
  const [activeComponent, setActiveComponent] = useState("");

  return (
    <>
      <div className="bg-black w-full h-screen flex flex-col">
        {/* Header */}
        <div className="bg-green-500">
          <Header />
        </div>

        {/* Main Content Area (Sidebar + Body) */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="bg-neutral-600 w-fit h-full">
            <SideBar />
          </div>

          {/* Main Body Content */}
          <div className=" flex-1 p-6 overflow-y-auto">
            {activeComponent === "roles" ? (
              <Roles />
            ) : activeComponent === "category" ? (
              <Category />
            ) : (
              <div className="flex flex-col items-center justify-start w-full px-[240px] py-[165px]">
                <h1 className="text-white text-[16px] font-semibold mb-8">
                  Content Management
                </h1>

                <div className="flex gap-4 items-center justify-center flex-wrap">
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

    </>

  );
};

export default Cms;
