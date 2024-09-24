import React from "react";
import { useSelector } from "react-redux";
import Sidebar from "./components/sidebar/Sidebar";
import TimeTracking from "./components/timetracking/TimeTracking";
import Settings from "./components/settings/Settings";
import About from "./components/about/About";
import Proxy from "./components/proxy/Proxy";

const Dashboard = () => {
  const route = useSelector((state) => state.route.currentRoute)

  return (
    <>
      <div className="fixed z-50">
        <Sidebar />
      </div>
      <div style={{marginLeft:"210px"}}>
        {route === "Time Tracking" && <TimeTracking />}
        {route === "Settings" && <Settings />}
        {route === "About" && <About />}
        {route === "Proxy" && <Proxy />}
      </div>
    </>
  );
};

export default Dashboard;
