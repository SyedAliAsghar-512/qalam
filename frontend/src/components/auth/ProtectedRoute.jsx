import React from "react";
import {useSelector} from "react-redux"
import {Navigate} from "react-router-dom"
import Loader from "../layouts/loader";
import toast from "react-hot-toast";

const ProtectedRoute = ({admin, children}) => {

   const {isAuthenticated, user, loading} = useSelector((state) => state.auth)

   if (loading) return <Loader />
   
   if (!isAuthenticated) {
     return <Navigate to="/" replace />
   }

   if (admin && user?.role!== 'admin') {
      return <Navigate to="/" replace />
   }

   return children;
}

export default ProtectedRoute