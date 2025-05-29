"use client";

import React, { useEffect, useState } from "react";
import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import ProfilePopup from "../Navbars/profilepopup";
import {
  BarChart,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import Sidebar from "../Navbars/Sidebar";
import Header from "../Navbars/Header";
import StatsCards from "./StatsCards";
import TablesSection from "./TablesSection"; // Import the new component
import styles from "./DashboardContent.module.css";
import dynamic from "next/dynamic";
import { CropSquare, Margin, Padding } from "@mui/icons-material";
const isDefaultZoom = Math.abs(window.innerWidth / window.screen.width - 1) < 0.01;

const AdminManagement = process.env.NEXT_PUBLIC_AdminManagement;
const Loadingspinner = dynamic(() => import("../../assets/loadingspinner"), {
  ssr: false,
});

interface DonutChartProps {
  height?: number;
}

const DonutChart: React.FC<DonutChartProps> = ({ height = isDefaultZoom ? 170 : 270}) => {
  const [chartData, setChartData] = useState<any[]>([]);
  

  useEffect(() => {
    console.log(isDefaultZoom)
    fetch(`${AdminManagement}/adminfourapi/nft-stats/`)
      .then((res) => res.json())
      .then((data) => {
        const formattedData = [
          { name: "Verified", y: data.verified_percentage, color: "#9EC9B0" },
          {
            name: "Unverified",
            y: data.unverified_percentage,
            color: "#EB6F5E",
          },
          { name: "Pending", y: data.pending_percentage, color: "#747E8C" },
          {
            name: "Action Taken", // Use <br> for line break
            y: data.action_taken_percentage,
            color: "#F5BE42",
          }          
        ];
        setChartData(formattedData);
      })
      .catch((error) => console.error("Error fetching pie chart data:", error));
  }, []);

  const options = {
    chart: {
      type: "pie",
      backgroundColor: "transparent",
      height: height,
    },
    title: {
      text: "Target vs Reality",
      align: "left",
      style: {
        color: "#ffffff",
        fontSize: isDefaultZoom? '14px': '18px',
        fontWeight: "bold",
      },
    },
    plotOptions: {
      pie: {
        innerSize: "55%", // Hollow center
        size: isDefaultZoom ? "75%" : "75%",
        borderWidth: 2, // Adds space between slices
        borderColor: "#11140B", // Optional: Border color for clarity
        slicedOffset: 10, // Creates space between slices
        useHTML: true,
        dataLabels: {
          enabled: true,
          format: "{point.name}: {point.y}%",
          style: { color: "#fff", fontSize: isDefaultZoom? '10px': '12px', fontWeight: "bold" },
          connectorWidth: 1,
          connectorColor: "#fff",
          connectorPadding: 1, // Space between label and connector line
          distance: 40, // Moves labels further from pie
          allowOverlap: false, // Ensures no label overlap
          crop: false, // Prevents labels from being hidden
          overflow: "justify", // Ensures labels adjust correctly
        },
      },
    },
    
    
    series: [
      {
        name: "Status",
        colorByPoint: true,
        data: chartData
      },
    ],
    credits: { enabled: false },
  };
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ textAlign: "center", borderRadius: "10px"}}>
       <HighchartsReact highcharts={Highcharts} options={options}  />
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginTop: "0px",
        }}
      >
        {chartData.map((item, index) => (
          <div
            key={index}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <div
              style={{
                width: "14px",
                height: "14px",
                backgroundColor: item.color,
                borderRadius: "50%",
              }}
            ></div>
            <span style={{ color: "#fff", fontSize: isDefaultZoom? '10px': '14px' }}>{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const DashboardContent: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showLoader, setShowLoader] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 6000);

    return () => clearTimeout(timer);
  }, []);
  const [verificationTimeRange, setVerificationTimeRange] =
    useState("Last Week");
  const [totalUsers, setTotalUsers] = useState(0);
  const [verifiedCount, setVerifiedCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [barData, setBarData] = useState([]);
  const [topVerifiers, setTopVerifiers] = useState([]);
  const [data, setData] = useState([]);
  const [showPopup, setShowPopup] = useState(false);


  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  useEffect(() => {
    (function (H) {
      H.seriesTypes.pie.prototype.animate = function (init) {
        const series = this,
          chart = series.chart,
          points = series.points,
          { animation } = series.options,
          { startAngleRad } = series;

        function fanAnimate(point: any, startAngleRad: number) {
          if (!point) return;
          const graphic = point.graphic,
            args = point.shapeArgs;
          if (graphic && args) {
            graphic
              .attr({ start: startAngleRad, end: startAngleRad, opacity: 1 })
              .animate(
                { start: args.start, end: args.end },
                { duration: animation.duration / points.length },
                () => {
                  if (points[point.index + 1]) {
                    fanAnimate(points[point.index + 1], args.end);
                  }
                  if (point.index === series.points.length - 1) {
                    series.dataLabelsGroup.animate(
                      { opacity: 1 },
                      undefined,
                      () => {
                        points.forEach((p: any) => {
                          p.opacity = 1;
                        });
                        chart.update({
                          plotOptions: {
                            pie: { innerSize: "40%", borderRadius: 8 },
                          },
                        });
                      }
                    );
                  }
                }
              );
          }
        }
        if (init) {
          points.forEach((point: any) => {
            point.opacity = 0;
          });
        } else {
          if (points.length > 0) {
            fanAnimate(points[0], startAngleRad);
          }
        }
      };
    })(Highcharts);

    fetch(`${AdminManagement}/adminthreeapi/dashboard/no_of_user/`)
      .then((res) => res.json())
      .then((data) => setTotalUsers(data.total_users))
      .catch((error) => console.error("Error fetching total users:", error));

    fetch(`${AdminManagement}/adminfourapi/count_verified/`)
      .then((res) => res.json())
      .then((data) => setVerifiedCount(data.verified_count))
      .catch((error) => console.error("Error fetching verified count:", error));

    fetch(`${AdminManagement}/adminthreeapi/completed-amount/`)
      .then((res) => res.json())
      .then((data) => {
        const updatedData = { total_paid_amount: data.total_completed_amount };
        setTotalRevenue(updatedData.total_paid_amount);
      })
      .catch((error) => console.error("Error fetching total revenue:", error));

    fetch(`${AdminManagement}/adminfourapi/nft-verification-stats/`)
      .then((response) => response.json())
      .then((data) => {
        if (data.month_data) {
          const allMonths = [
            "Jan",
            "Feb",
            "Mar",
            "Apr",
            "May",
            "Jun",
            "Jul",
            "Aug",
            "Sep",
            "Oct",
            "Nov",
            "Dec",
          ];
          const apiDataMap = {};
          data.month_data.forEach((entry) => {
            apiDataMap[entry.month] = entry.count;
          });
          const formattedData = allMonths.map((month) => ({
            month: month,
            green:
              apiDataMap[month] !== undefined ? data.verified_count : "No Data",
            red:
              apiDataMap[month] !== undefined
                ? data.unverified_count
                : "No Data",
          }));
          setBarData(formattedData);
        }
      })
      .catch((error) =>
        console.error("Error fetching NFT verification stats:", error)
      );

    fetch(`${AdminManagement}/admineightapi/top-verified-seekers/`)
      .then((res) => res.json())
      .then((response) => {
        let seekers = response.top_5_seekers || [];
        while (seekers.length < 5) {
          seekers.push({ name: "No Data", count: 0 });
        }
        setData(seekers);
      })
      .catch((error) =>
        console.error("Error fetching top verified seekers:", error)
      );

    fetch(`${AdminManagement}/adminfourapi/approved-count/`)
      .then((res) => res.json())
      .then((data) => {
        let verifiersArray = Object.entries(data.top_5_verifiers || {}).map(
          ([verifierId, details]) => ({
            id: verifierId,
            name: details.name || "Unknown",
            count: details.count || 0,
          })
        );
        verifiersArray.sort((a, b) => b.count - a.count);
        while (verifiersArray.length < 5) {
          verifiersArray.push({ id: "-", name: "No Data", count: 0 });
        }
        setTopVerifiers(verifiersArray);
      })
      .catch((error) => console.error("Error fetching top users:", error));
  }, [verificationTimeRange]);
  const handleProfileClick = () => {
    setShowPopup(true); // Show popup when profile image is clicked
  };

  return (
    <div className={styles.container}>
      {showLoader ? (
        <div className={styles.loaderWrapper}>
          <Loadingspinner />
        </div>
      ) : (
        <>
          <Header searchQuery="" onSearch={() => {}} onProfileClick={handleProfileClick} />
      
      {showPopup && (
        <ProfilePopup
          // email={email} // Pass the email state
          onClose={() => setShowPopup(false)}
        />
      )}
      <Sidebar />

          <div className={styles.dashboardContent}>
            <StatsCards
              totalUsers={totalUsers}
              totalRevenue={totalRevenue}
              verifiedCount={verifiedCount}
            />
            <div className={styles.charts}>
              <div className={`${styles.chart} ${styles.pieChart}`}>
                <DonutChart />
              </div>
              <div className={styles.chart}>
                <h4 className={styles.barChartTitle}>Document Status</h4>
                <ResponsiveContainer width="100%" height={isDefaultZoom ? 150 : 270}>
                <BarChart data={barData} barCategoryGap="30%" barGap={10}>
                    <CartesianGrid
                      stroke="#253443"
                      horizontal={true}
                      vertical={false}
                    />
                    <XAxis
                      dataKey="month"
                      stroke="#fff"
                      axisLine={{ stroke: "#253443" }}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "#fff" }}
                    />
                    <YAxis
                      stroke="#fff"
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(value) => `${value}`}
                      tick={{ fontSize: 12, fill: "#fff" }}
                    />
                    <Tooltip />
                    <Legend 
                      content={() => (
                        <div style={{ display: "flex", gap: "20px", alignItems: "center", marginTop: '0px', justifyContent: 'center' }}>
                          
                          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                            <span style={{ width: isDefaultZoom? '10px': '15px', height: isDefaultZoom? '10px': '15px', borderRadius: "50%", background: "#FF0000", display: "inline-block" }}></span>
                            <span style={{fontSize:isDefaultZoom? '12px': '16px'}}>Unverified</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", marginLeft: '20px' }}>
                            <span style={{ width: isDefaultZoom? '10px': '15px', height: isDefaultZoom? '10px': '15px', borderRadius: "50%", background: "#00FFAA", display: "inline-block" }}></span>
                            <span style={{fontSize:isDefaultZoom? '12px': '16px'}}>Verified</span>
                          </div>
                        </div>
                      )}
                    />
                    
                    <Bar
                      dataKey="red"
                      fill="#FF0000"
                      barSize={50}
                      name="Unverified"
                      radius={[2,2,2,2]}
                    />
                    <Bar
                      dataKey="green"
                      fill="#00FFAA"
                      barSize={50}
                      name="Verified"
                      radius={[2,2,2,2]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <TablesSection
              verificationTimeRange={verificationTimeRange}
              setVerificationTimeRange={setVerificationTimeRange}
              topVerifiers={topVerifiers}
              data={data}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardContent;