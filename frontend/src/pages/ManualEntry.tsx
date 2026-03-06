import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"

export default function ManualEntry() {
  const [employees, setEmployees] = useState([])
  const [metrics, setMetrics] = useState([])
  const [formData, setFormData] = useState({
    employee_id: "",
    metric_id: "",
    calculated_score: 3,
    remarks: ""
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [empRes, metRes] = await Promise.all([
        axios.get("/api/employees"),
        axios.get("/api/metrics")
      ])
      setEmployees(empRes.data)
      setMetrics(metRes.data.filter((m: any) => m.type === "MANUAL"))
    } catch (error) {
      console.error(error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.employee_id || !formData.metric_id || !formData.remarks) {
      alert("Please fill all fields, including mandatory remarks.")
      return
    }

    try {
      await axios.post("/api/scores", {
        ...formData,
        employee_id: parseInt(formData.employee_id),
        metric_id: parseInt(formData.metric_id),
        calculated_score: parseInt(formData.calculated_score.toString())
      })
      alert("Manual entry submitted successfully")
      setFormData({ employee_id: "", metric_id: "", calculated_score: 3, remarks: "" })
    } catch (error) {
      console.error("Error submitting manual entry", error)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Manual Entry</h2>
        <p className="text-muted-foreground">Input manual performance evaluations (e.g., Code Quality).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submit Evaluation</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Employee</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.employee_id}
                onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                required
              >
                <option value="" disabled>Select Employee</option>
                {employees.map((emp: any) => (
                  <option key={emp.id} value={emp.id}>{emp.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Metric</label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={formData.metric_id}
                onChange={(e) => setFormData({ ...formData, metric_id: e.target.value })}
                required
              >
                <option value="" disabled>Select Manual Metric</option>
                {metrics.map((metric: any) => (
                  <option key={metric.id} value={metric.id}>{metric.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Score (1-5)</label>
              <Input
                type="number"
                min="1"
                max="5"
                value={formData.calculated_score}
                onChange={(e) => setFormData({ ...formData, calculated_score: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Remarks (Mandatory)</label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                placeholder="Provide justification for the score..."
                value={formData.remarks}
                onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                required
              />
            </div>

            <Button type="submit" className="w-full">Submit Entry</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
