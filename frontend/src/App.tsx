import { BrowserRouter, Routes, Route } from "react-router-dom"
import { Layout } from "./components/Layout"
import RankingReport from "./pages/RankingReport"
import EmployeeDetails from "./pages/EmployeeDetails"
import ConfigManager from "./pages/ConfigManager"
import ManualEntry from "./pages/ManualEntry"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<RankingReport />} />
          <Route path="employees" element={<EmployeeDetails />} />
          <Route path="employees/:id" element={<EmployeeDetails />} />
          <Route path="manual-entry" element={<ManualEntry />} />
          <Route path="config" element={<ConfigManager />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App