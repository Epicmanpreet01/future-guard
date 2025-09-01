import { Route, Routes, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage.jsx"
import AdminDashboard from "./components/AdminDashboard.jsx";
import MentorDashboard from "./components/MentorDashboard.jsx";
import LoadingSpinner from "./components/utils/LoadingSpinner.jsx";
import { Bounce, ToastContainer } from "react-toastify";
import useAuthUser from "./hooks/queries/useAuthUser.js";

function App() {

  const { data:authUser, isPending} = useAuthUser();

  if (isPending) {
    return <LoadingSpinner />
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={authUser ? <Navigate to={'/'}/> : <LoginPage />}/>
        <Route path="/" element={authUser ? (authUser?.role== 'admin' ? <AdminDashboard /> : authUser?.role == 'superAdmin' ? "SuperAdmin" : < MentorDashboard/>) : < Navigate to={'/login'}/>}/>
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
