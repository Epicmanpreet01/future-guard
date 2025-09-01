import { Route, Routes, Navigate } from "react-router-dom"
import LoginPage from "./pages/LoginPage.jsx"
import AdminDashboard from "./components/AdminDashboard.jsx";
import MentorDashboard from "./components/MentorDashboard.jsx";
import LoadingSpinner from "./components/utils/LoadingSpinner.jsx";
import { Bounce, toast, ToastContainer } from "react-toastify";
import useAuthUser from "./hooks/queries/useAuthUser.js";

function App() {

  const { authUser, isPending, isError } = useAuthUser();

  if (isPending) {
    return <LoadingSpinner />
  }

  if (isError) {
    toast.error("User could not be fetched");
  }

  return (
    <>
      <Routes>
        <Route path="/login" element={authUser ? <Navigate to={'/'}/> : <LoginPage />}/>
        <Route path="/" element={authUser ? (authUser?.role ? <AdminDashboard /> : < MentorDashboard/>) : < Navigate to={'/login'}/>}/>
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
