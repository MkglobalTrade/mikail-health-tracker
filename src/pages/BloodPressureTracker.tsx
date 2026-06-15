import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { toast } from "sonner";

const bpSchema = z.object({
  systolic: z.coerce.number().min(50).max(250),
  diastolic: z.coerce.number().min(30).max(150),
  pulse: z.coerce.number().min(30).max(200),
  readingDate: z.string(),
  readingTime: z.string(),
  notes: z.string().optional(),
});

export default function BloodPressureTracker() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(bpSchema),
    defaultValues: {
      readingDate: format(new Date(), "yyyy-MM-dd"),
      readingTime: format(new Date(), "HH:mm"),
    },
  });

  const bpQuery = trpc.bloodPressure.list.useQuery();
  const addBPMutation = trpc.bloodPressure.add.useMutation({
    onSuccess: () => {
      toast.success("Blood pressure reading added!");
      reset();
      bpQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to add blood pressure reading");
    },
  });

  const onSubmit = (data: any) => {
    const [year, month, day] = data.readingDate.split("-");
    const [hours, minutes] = data.readingTime.split(":");
    const readingDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    
    addBPMutation.mutate({
      systolic: data.systolic,
      diastolic: data.diastolic,
      pulse: data.pulse,
      readingDate,
      notes: data.notes,
    });
  };

  // Prepare chart data
  const chartData = (bpQuery.data || [])
    .slice(0, 30)
    .reverse()
    .map(reading => ({
      date: format(new Date(reading.readingDate), "MMM dd"),
      systolic: reading.systolic,
      diastolic: reading.diastolic,
      pulse: reading.pulse,
    }));

  // Calculate statistics
  const readings = bpQuery.data || [];
  const avgSystolic = readings.length > 0 ? Math.round(readings.reduce((a, b) => a + b.systolic, 0) / readings.length) : "—";
  const avgDiastolic = readings.length > 0 ? Math.round(readings.reduce((a, b) => a + b.diastolic, 0) / readings.length) : "—";
  const avgPulse = readings.length > 0 ? Math.round(readings.reduce((a, b) => a + b.pulse, 0) / readings.length) : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Blood Pressure Tracker</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Add Reading Form */}
          <Card>
            <CardHeader>
              <CardTitle>Log Reading</CardTitle>
              <CardDescription>Add a new BP reading</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="systolic">Systolic (mmHg)</Label>
                    <Input
                      id="systolic"
                      type="number"
                      placeholder="120"
                      {...register("systolic")}
                      className={errors.systolic ? "border-red-500" : ""}
                    />
                  </div>
                  <div>
                    <Label htmlFor="diastolic">Diastolic (mmHg)</Label>
                    <Input
                      id="diastolic"
                      type="number"
                      placeholder="80"
                      {...register("diastolic")}
                      className={errors.diastolic ? "border-red-500" : ""}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="pulse">Pulse (bpm)</Label>
                  <Input
                    id="pulse"
                    type="number"
                    placeholder="72"
                    {...register("pulse")}
                    className={errors.pulse ? "border-red-500" : ""}
                  />
                </div>

                <div>
                  <Label htmlFor="readingDate">Date</Label>
                  <Input
                    id="readingDate"
                    type="date"
                    {...register("readingDate")}
                  />
                </div>

                <div>
                  <Label htmlFor="readingTime">Time</Label>
                  <Input
                    id="readingTime"
                    type="time"
                    {...register("readingTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any notes about this reading..."
                    {...register("notes")}
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={addBPMutation.isPending}>
                  {addBPMutation.isPending ? "Adding..." : "Add Reading"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average BP</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-red-600">{avgSystolic}/{avgDiastolic}</p>
                <p className="text-sm text-slate-500">mmHg</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average Pulse</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{avgPulse}</p>
                <p className="text-sm text-slate-500">bpm</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Total Readings</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-green-600">{readings.length}</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Blood Pressure Trend</CardTitle>
            <CardDescription>Last 30 readings</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
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
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reading History</CardTitle>
            <CardDescription>All your blood pressure readings</CardDescription>
          </CardHeader>
          <CardContent>
            {readings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Systolic</TableHead>
                      <TableHead>Diastolic</TableHead>
                      <TableHead>Pulse</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readings.map(reading => (
                      <TableRow key={reading.id}>
                        <TableCell>{format(new Date(reading.readingDate), "PPp")}</TableCell>
                        <TableCell className="font-semibold text-red-600">{reading.systolic}</TableCell>
                        <TableCell className="font-semibold text-blue-600">{reading.diastolic}</TableCell>
                        <TableCell>{reading.pulse} bpm</TableCell>
                        <TableCell className="text-slate-600">{reading.notes || "—"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No readings yet. Add your first reading above!</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
