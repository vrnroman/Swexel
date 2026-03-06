import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "../components/ui/Button"
import { Input } from "../components/ui/Input"
import { Card, CardHeader, CardTitle, CardContent } from "../components/ui/Card"

export default function ConfigManager() {
  const [metrics, setMetrics] = useState([])
  const [teams, setTeams] = useState([])

  const [newMetric, setNewMetric] = useState({ name: "", type: "AUTOMATED", weight: 0.1, implementation_key: "" })
  const [newTeam, setNewTeam] = useState({ name: "", manager_id: 1 })
  const [newEmployee, setNewEmployee] = useState({ name: "", jira_projects: "" })
  const [newThreshold, setNewThreshold] = useState({ metric_id: "", value_less_than: "", value_greater_than: "", score: 3 })

  useEffect(() => {
    fetchMetrics()
    fetchTeams()
  }, [])

  const fetchMetrics = async () => {
    try {
      const res = await axios.get("/api/metrics")
      setMetrics(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const fetchTeams = async () => {
    try {
      const res = await axios.get("/api/teams")
      setTeams(res.data)
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddMetric = async () => {
    try {
      await axios.post("/api/metrics", newMetric)
      fetchMetrics()
      setNewMetric({ name: "", type: "AUTOMATED", weight: 0.1, implementation_key: "" })
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddTeam = async () => {
    try {
      await axios.post("/api/teams", newTeam)
      fetchTeams()
      setNewTeam({ name: "", manager_id: 1 })
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddEmployee = async () => {
    try {
      await axios.post("/api/employees", newEmployee)
      alert("Employee added successfully!")
      setNewEmployee({ name: "", jira_projects: "" })
    } catch (error) {
      console.error(error)
    }
  }

  const handleAddThreshold = async () => {
    try {
      const payload: any = {
        metric_id: parseInt(newThreshold.metric_id),
        score: parseInt(newThreshold.score.toString()),
      }
      if (newThreshold.value_less_than !== "") payload.value_less_than = parseFloat(newThreshold.value_less_than)
      if (newThreshold.value_greater_than !== "") payload.value_greater_than = parseFloat(newThreshold.value_greater_than)

      await axios.post("/api/thresholds", payload)
      alert("Threshold added successfully!")
      setNewThreshold({ metric_id: "", value_less_than: "", value_greater_than: "", score: 3 })
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Config Manager</h2>
        <p className="text-muted-foreground">Manage system configuration, metrics, teams, employees, and thresholds.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Add New Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={newMetric.name}
                  onChange={(e) => setNewMetric({ ...newMetric, name: e.target.value })}
                  placeholder="Code Quality"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newMetric.type}
                  onChange={(e) => setNewMetric({ ...newMetric, type: e.target.value })}
                >
                  <option value="AUTOMATED">AUTOMATED</option>
                  <option value="MANUAL">MANUAL</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (0-1)</label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={newMetric.weight}
                  onChange={(e) => setNewMetric({ ...newMetric, weight: parseFloat(e.target.value) })}
                />
              </div>
              {newMetric.type === "AUTOMATED" && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Implementation Key</label>
                  <Input
                    value={newMetric.implementation_key}
                    onChange={(e) => setNewMetric({ ...newMetric, implementation_key: e.target.value })}
                    placeholder="JiraStoryPointProvider"
                  />
                </div>
              )}
            </div>
            <Button className="mt-4" onClick={handleAddMetric}>Add Metric</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Scoring Bracket (Thresholds)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Metric</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={newThreshold.metric_id}
                  onChange={(e) => setNewThreshold({ ...newThreshold, metric_id: e.target.value })}
                >
                  <option value="" disabled>Select Metric</option>
                  {metrics.map((m: any) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value Less Than</label>
                <Input
                  type="number"
                  placeholder="e.g. 2"
                  value={newThreshold.value_less_than}
                  onChange={(e) => setNewThreshold({ ...newThreshold, value_less_than: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Value Greater Than</label>
                <Input
                  type="number"
                  placeholder="e.g. 20"
                  value={newThreshold.value_greater_than}
                  onChange={(e) => setNewThreshold({ ...newThreshold, value_greater_than: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <label className="text-sm font-medium">Score (1-5)</label>
                <Input
                  type="number"
                  min="1"
                  max="5"
                  value={newThreshold.score}
                  onChange={(e) => setNewThreshold({ ...newThreshold, score: parseInt(e.target.value) })}
                />
              </div>
            </div>
            <Button className="mt-4" onClick={handleAddThreshold}>Add Threshold</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Team</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Team Name</label>
                <Input
                  value={newTeam.name}
                  onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                  placeholder="Engineering Alpha"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Manager ID</label>
                <Input
                  type="number"
                  value={newTeam.manager_id}
                  onChange={(e) => setNewTeam({ ...newTeam, manager_id: parseInt(e.target.value) })}
                />
              </div>
              <Button onClick={handleAddTeam}>Add Team</Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Add Employee</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee Name</label>
                <Input
                  value={newEmployee.name}
                  onChange={(e) => setNewEmployee({ ...newEmployee, name: e.target.value })}
                  placeholder="John Doe"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Jira Projects (comma-separated)</label>
                <Input
                  value={newEmployee.jira_projects}
                  onChange={(e) => setNewEmployee({ ...newEmployee, jira_projects: e.target.value })}
                  placeholder="PROJ1, PROJ2"
                />
              </div>
              <Button onClick={handleAddEmployee}>Add Employee</Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium">Current Metrics</h3>
        <ul className="mt-4 space-y-2 border rounded-md p-4 bg-card">
          {metrics.map((m: any) => (
            <li key={m.id} className="flex justify-between border-b pb-2 last:border-0 last:pb-0">
              <span>{m.name} ({m.type})</span>
              <span className="text-muted-foreground">Weight: {m.weight}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
