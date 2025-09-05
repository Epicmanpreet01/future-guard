import { Route, Routes, Navigate } from "react-router-dom"
import LoginPage from "./pages/auth/LoginPage.jsx"
import AdminDashboard from "./pages/dashboard/AdminDashboard.jsx";
import MentorDashboard from "./pages/dashboard/MentorDashboard.jsx";
import LoadingSpinner from "./components/utils/LoadingSpinner.jsx";
import { Bounce, ToastContainer } from "react-toastify";
import useAuthUser from "./hooks/queries/useAuthUser.js";
import SuperAdminDashboard from "./pages/dashboard/SuperAdminDashboard.jsx";

function App() {

  const { data:authUser, isPending} = useAuthUser();
  
  if (isPending) {
    return <LoadingSpinner />
  }
  return (
    <>
      <Routes>
        <Route path="/login" element={authUser ? <Navigate to={'/'}/> : <LoginPage />}/>
        <Route path="/" element={authUser ? (authUser?.role== 'admin' ? <AdminDashboard authUser={authUser} /> : authUser?.role == 'superAdmin' ? <SuperAdminDashboard authUser={authUser} /> : < MentorDashboard/>) : < Navigate to={'/login'}/>}/>
      </Routes>
      <ToastContainer
            position="top-center"
            autoClose={3000}
            hideProgressBar
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
            transition={Bounce}
            className={'z-[9999] fixed'}
            />
    </>
  )
}

export default App
