import { Navigate, Outlet, Route } from "react-router-dom"
import { Routes } from "react-router-dom"
import Home from "./pages/home"
import Navbar from "./components/shared/navbar"
import LoginPage from "./pages/login"

function App() {
  return (
    <>
     <Routes>
      <Route path="/" element={<Navigate to={"/login"}/>} />
      <Route path="/login" element={<LoginPage/>} />
        <Route path="/admin" element={<><Navbar/><Outlet/></>}>
          <Route path="" element={<Home/>} />
        </Route>
     </Routes>
    </>
  )
}

export default App
