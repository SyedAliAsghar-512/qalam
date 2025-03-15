import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./BottomNavBar.css";
import { faCircleUser, faComment, faGraduationCap, faHandPaper, faHeart, faHome, faPager, faPlusSquare, faSearch, faStar, faUser, faUserCheck } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useSelector } from "react-redux";
import { useGetMeQuery } from "../../redux/api/userApi";

const BottomNavBar = () => {

  const {user} = useSelector((state) => state.auth)
  const {isLoading } = useGetMeQuery()
  const location = useLocation(); // Get current route
  return (
    <>
    {user ? (
      <>
      
    <div className="bottom-nav">

    <Link to="/dashboard" className={`nav-item ${location?.pathname === "/dashboard" ? "active" : ""}`}>
        <FontAwesomeIcon icon={faHome} />
      </Link>
      <Link to="/attendance" className={`nav-item ${location?.pathname === "/attendance" ? "active" : ""}`}>
        <FontAwesomeIcon icon={faUserCheck} />
      </Link>
      <Link to="/results" className={`nav-item ${location?.pathname === "/results" ? "active" : ""}`}>
        <FontAwesomeIcon icon={faGraduationCap} />
      </Link>
    </div>
</>
  ):(  !isLoading && (
    <p></p>
  ))}
  </>
  );
};

export default BottomNavBar;
