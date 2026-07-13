import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import AuthPages from './Componets/auth/auth-pages'
import ResetPassword from './Componets/auth/reset-password'
import EmployeeHome from './Componets/employee/employee-home'
import NewTicket from './Componets/employee/new-ticket'
import ViewTicket from './Componets/employee/view-ticket'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPages onLoginSuccess={() => console.log('logged in!')} />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        {/* <Route path="/employee">
        <Route path="home" element={<EmployeeHome />} />     
        <Route path="new-ticket" element={<NewTicket />} />  
        <Route path="view-ticket" element={<ViewTicket />} />   
      </Route> */}
        <Route path="/employee" element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
          <Route path="home" element={<EmployeeHome />} />
          <Route path="new-ticket" element={<NewTicket />} />
          <Route path="view-ticket" element={<ViewTicket />} />
        </Route>
        <Route path="/" element={<AuthPages onLoginSuccess={() => console.log('logged in!')} />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App