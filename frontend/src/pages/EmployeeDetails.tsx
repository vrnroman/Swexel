import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import axios from "axios"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../components/ui/Card"

interface ScoreEntry {
  id: number;
  employee_id: number;
  metric_id: number;
  raw_value: number | null;
  calculated_score: number;
  remarks: string | null;
  timestamp: string;
}

interface MetricDefinition {
  id: number;
  name: string;
  type: string;
  weight: number;
}

export default function EmployeeDetails() {
  const { id } = useParams()
  const [scores, setScores] = useState<ScoreEntry[]>([])
  const [metrics, setMetrics] = useState<MetricDefinition[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<number>(3) // months

  useEffect(() => {
    if (id) {
      fetchData()
    } else {
      setLoading(false)
    }
  }, [id])

  const fetchData = async () => {
    try {
      const [scoresRes, metricsRes] = await Promise.all([
        axios.get(`/api/scores/employee/${id}`),
        axios.get(`/api/metrics`),
      ])
      setScores(scoresRes.data)
      setMetrics(metricsRes.data)
    } catch (error) {
      console.error("Error fetching employee details", error)
    } finally {
      setLoading(false)
    }
  }

  if (!id) {
    return <div>Please select an employee from the Ranking Report.</div>
  }

  if (loading) return <div>Loading...</div>

  // Filter scores by time range
  const now = new Date()
  const filterDate = new Date(now.setMonth(now.getMonth() - timeRange))

  const filteredScores = scores.filter((score) => new Date(score.timestamp) >= filterDate)

  // Group scores by metric ID
  const scoresByMetric: Record<number, any[]> = {}
  filteredScores.forEach((score) => {
    if (!scoresByMetric[score.metric_id]) {
      scoresByMetric[score.metric_id] = []
    }
    scoresByMetric[score.metric_id].push({
      date: new Date(score.timestamp).toLocaleDateString(),
      score: score.calculated_score,
      rawValue: score.raw_value,
    })
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Employee Details</h2>
          <p className="text-muted-foreground">
            Historical performance metrics for Employee #{id}.
          </p>
        </div>
        <select
          className="flex h-10 w-[180px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          value={timeRange}
          onChange={(e) => setTimeRange(parseInt(e.target.value))}
        >
          <option value={3}>Last 3 Months</option>
          <option value={12}>Last 12 Months</option>
          <option value={36}>Last 36 Months</option>
        </select>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader>
              <CardTitle>{metric.name}</CardTitle>
              <CardDescription>
                Weight: {(metric.weight * 100).toFixed(0)}% | Type: {metric.type}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                {scoresByMetric[metric.id] && scoresByMetric[metric.id].length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={scoresByMetric[metric.id]}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 5]} />
                      <Tooltip />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#8884d8"
                        activeDot={{ r: 8 }}
                        name="Score (1-5)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    No data available for this metric
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
