import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Heart, Droplet, Pill, TrendingUp } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useLocation } from "wouter";
import { format } from "date-fns";

export default function Dashboard() {
  const { user } = useAuth();
  const [, navigate] = useLocation();

  // Fetch health data
  const glucoseQuery = trpc.glucose.list.useQuery();
  const bpQuery = trpc.bloodPressure.list.useQuery();
  const medicationsQuery = trpc.medications.list.useQuery();
  const dosesQuery = trpc.medicationDoses.listToday.useQuery();

  // Get today's data
  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

  const todayGlucose = glucoseQuery.data?.filter(g => {
    const date = new Date(g.readingDate);
    return date >= todayStart && date < todayEnd;
  }) || [];

  const todayBP = bpQuery.data?.filter(bp => {
    const date = new Date(bp.readingDate);
    return date >= todayStart && date < todayEnd;
  }) || [];

  // Calculate statistics
  const latestGlucose = glucoseQuery.data?.[0];
  const latestBP = bpQuery.data?.[0];
  const avgGlucose = todayGlucose.length > 0
    ? (todayGlucose.reduce((sum, g) => sum + parseFloat(g.value as any), 0) / todayGlucose.length).toFixed(1)
    : "—";

  // Prepare chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const glucoseChartData = last7Days.map(date => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayReadings = glucoseQuery.data?.filter(g => {
      const gDate = new Date(g.readingDate);
      return gDate >= dayStart && gDate < dayEnd;
    }) || [];
    const avg = dayReadings.length > 0
      ? parseFloat((dayReadings.reduce((sum, g) => sum + parseFloat(g.value as any), 0) / dayReadings.length).toFixed(1))
      : null;
    return {
      date: format(date, "MMM dd"),
      glucose: avg,
    };
  });

  const bpChartData = last7Days.map(date => {
    const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);
    const dayReadings = bpQuery.data?.filter(bp => {
      const bpDate = new Date(bp.readingDate);
      return bpDate >= dayStart && bpDate < dayEnd;
    }) || [];
    const avgSystolic = dayReadings.length > 0
      ? Math.round(dayReadings.reduce((sum, bp) => sum + bp.systolic, 0) / dayReadings.length)
      : null;
    const avgDiastolic = dayReadings.length > 0
      ? Math.round(dayReadings.reduce((sum, bp) => sum + bp.diastolic, 0) / dayReadings.length)
      : null;
    return {
      date: format(date, "MMM dd"),
      systolic: avgSystolic,
      diastolic: avgDiastolic,
    };
  });

  const isLoading = glucoseQuery.isLoading || bpQuery.isLoading || medicationsQuery.isLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Health Command Center</h1>
          <p className="text-slate-600">{user?.name} • {format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>

        {/* Overall Status */}
        <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Overall Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            {glucoseQuery.data && glucoseQuery.data.length > 0 ? (
              <p className="text-slate-700">
                You have {todayGlucose.length} glucose reading(s) today with an average of <span className="font-semibold text-blue-600">{avgGlucose} mg/dL</span>.
                {latestBP && (
                  <>
                    {" "}Latest blood pressure: <span className="font-semibold text-blue-600">{latestBP.systolic}/{latestBP.diastolic} mmHg</span>.
                  </>
                )}
              </p>
            ) : (
              <p className="text-slate-600">Upload a lab report or add a reading to activate monitoring.</p>
            )}
          </CardContent>
        </Card>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Latest Glucose */}
          <Card className="border-l-4 border-l-amber-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Droplet className="w-5 h-5 text-amber-500" />
                Latest Glucose
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestGlucose ? (
                <div>
                  <p className="text-4xl font-bold text-amber-600 mb-2">{latestGlucose.value} mg/dL</p>
                  <p className="text-sm text-slate-500">{format(new Date(latestGlucose.readingDate), "PPp")}</p>
                </div>
              ) : (
                <p className="text-slate-500">No glucose readings yet.</p>
              )}
            </CardContent>
          </Card>

          {/* Latest Blood Pressure */}
          <Card className="border-l-4 border-l-red-500">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Heart className="w-5 h-5 text-red-500" />
                Latest Blood Pressure
              </CardTitle>
            </CardHeader>
            <CardContent>
              {latestBP ? (
                <div>
                  <p className="text-4xl font-bold text-red-600 mb-2">{latestBP.systolic}/{latestBP.diastolic}</p>
                  <p className="text-sm text-slate-500">Pulse: {latestBP.pulse} bpm • {format(new Date(latestBP.readingDate), "PPp")}</p>
                </div>
              ) : (
                <p className="text-slate-500">No blood pressure readings yet.</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Glucose Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Glucose Trend (Last 7 Days)</CardTitle>
              <CardDescription>Average daily readings</CardDescription>
            </CardHeader>
            <CardContent>
              {glucoseChartData.some(d => d.glucose !== null) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={glucoseChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="glucose" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>

          {/* Blood Pressure Trend */}
          <Card>
            <CardHeader>
              <CardTitle>Blood Pressure Trend (Last 7 Days)</CardTitle>
              <CardDescription>Systolic and Diastolic averages</CardDescription>
            </CardHeader>
            <CardContent>
              {bpChartData.some(d => d.systolic !== null) ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={bpChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="systolic" stroke="#ef4444" strokeWidth={2} dot={{ fill: "#ef4444" }} />
                    <Line type="monotone" dataKey="diastolic" stroke="#3b82f6" strokeWidth={2} dot={{ fill: "#3b82f6" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No data available yet
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Medications Today */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-green-600" />
              Medications Today
            </CardTitle>
            <CardDescription>Day and Night schedule</CardDescription>
          </CardHeader>
          <CardContent>
            {medicationsQuery.data && medicationsQuery.data.length > 0 ? (
              <div className="space-y-4">
                {["day", "night"].map(schedule => {
                  const meds = medicationsQuery.data.filter(m => m.schedule === schedule || m.schedule === "both");
                  return (
                    <div key={schedule}>
                      <h4 className="font-semibold text-slate-700 capitalize mb-2">{schedule} Schedule</h4>
                      {meds.length > 0 ? (
                        <ul className="space-y-2">
                          {meds.map(med => (
                            <li key={med.id} className="flex items-center gap-3 p-2 bg-slate-50 rounded">
                              <input type="checkbox" className="w-4 h-4" />
                              <div>
                                <p className="font-medium text-slate-900">{med.name}</p>
                                <p className="text-sm text-slate-500">{med.dosage} • {med.frequency}</p>
                              </div>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-slate-500 text-sm">No medications scheduled</p>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-slate-500">No medications added yet.</p>
            )}
            <Button onClick={() => navigate("/medications")} className="mt-4 w-full">
              Manage Medications
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
