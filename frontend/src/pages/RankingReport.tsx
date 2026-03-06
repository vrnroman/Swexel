import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/Table"
import { Button } from "../components/ui/Button"

interface RankingData {
  employee_id: number;
  employee_name: string;
  weighted_average_score: number;
  score_details: any[];
}

export default function RankingReport() {
  const [data, setData] = useState<RankingData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const response = await axios.get("/api/reports/ranking")
      setData(response.data)
    } catch (error) {
      console.error("Error fetching ranking data", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSync = async () => {
    try {
      await axios.post("/api/sync")
      alert("Sync started in background")
    } catch (error) {
      console.error("Error triggering sync", error)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Ranking Report</h2>
          <p className="text-muted-foreground">
            Overview of employee performance based on weighted average scores.
          </p>
        </div>
        <Button onClick={handleSync}>Trigger Sync</Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>Employee Name</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead className="w-[100px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center">No data available</TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={row.employee_id}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{row.employee_name}</TableCell>
                  <TableCell className="text-right">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-semibold text-primary">
                      {row.weighted_average_score.toFixed(2)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Link to={`/employees/${row.employee_id}`}>
                      <Button variant="outline" size="sm">Details</Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
