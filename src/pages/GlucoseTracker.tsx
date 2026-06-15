import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { toast } from "sonner";

const glucoseSchema = z.object({
  value: z.coerce.number().min(20).max(600),
  readingDate: z.string(),
  readingTime: z.string(),
  notes: z.string().optional(),
});

type GlucoseFormData = z.infer<typeof glucoseSchema>;

export default function GlucoseTracker() {
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(glucoseSchema),
    defaultValues: {
      readingDate: format(new Date(), "yyyy-MM-dd"),
      readingTime: format(new Date(), "HH:mm"),
    },
  });

  const glucoseQuery = trpc.glucose.list.useQuery();
  const addGlucoseMutation = trpc.glucose.add.useMutation({
    onSuccess: () => {
      toast.success("Glucose reading added!");
      reset();
      glucoseQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to add glucose reading");
    },
  });

  const onSubmit = (data: any) => {
    const [year, month, day] = data.readingDate.split("-");
    const [hours, minutes] = data.readingTime.split(":");
    const readingDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), parseInt(hours), parseInt(minutes));
    
    addGlucoseMutation.mutate({
      value: data.value,
      readingDate,
      notes: data.notes,
    });
  };

  // Prepare chart data
  const chartData = (glucoseQuery.data || [])
    .slice(0, 30)
    .reverse()
    .map((reading, index) => ({
      date: format(new Date(reading.readingDate), "MMM dd HH:mm"),
      value: parseFloat(reading.value as any),
      index,
    }));

  // Calculate statistics
  const readings = glucoseQuery.data || [];
  const values = readings.map(r => parseFloat(r.value as any));
  const avgGlucose = values.length > 0 ? (values.reduce((a, b) => a + b) / values.length).toFixed(1) : "—";
  const minGlucose = values.length > 0 ? Math.min(...values) : "—";
  const maxGlucose = values.length > 0 ? Math.max(...values) : "—";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-slate-900 mb-6">Glucose Tracker</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Add Reading Form */}
          <Card>
            <CardHeader>
              <CardTitle>Log Reading</CardTitle>
              <CardDescription>Add a new glucose reading</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="value">Glucose Value (mg/dL)</Label>
                  <Input
                    id="value"
                    type="number"
                    placeholder="120"
                    {...register("value")}
                    className={errors.value ? "border-red-500" : ""}
                  />
                  {errors.value && <p className="text-red-500 text-sm mt-1">{errors.value.message}</p>}
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

                <Button type="submit" className="w-full" disabled={addGlucoseMutation.isPending}>
                  {addGlucoseMutation.isPending ? "Adding..." : "Add Reading"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Statistics */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Average</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold text-blue-600">{avgGlucose}</p>
                <p className="text-sm text-slate-500">mg/dL</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Min / Max</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-slate-900">{minGlucose} / {maxGlucose}</p>
                <p className="text-sm text-slate-500">mg/dL</p>
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

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Line Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Glucose Trend</CardTitle>
              <CardDescription>Last 30 readings</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={2} dot={{ fill: "#f59e0b" }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>

          {/* Bar Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Glucose Distribution</CardTitle>
              <CardDescription>Last 30 readings</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#f59e0b" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[300px] flex items-center justify-center text-slate-500">
                  No data available
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Reading History</CardTitle>
            <CardDescription>All your glucose readings</CardDescription>
          </CardHeader>
          <CardContent>
            {readings.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date & Time</TableHead>
                      <TableHead>Value (mg/dL)</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {readings.map(reading => (
                      <TableRow key={reading.id}>
                        <TableCell>{format(new Date(reading.readingDate), "PPp")}</TableCell>
                        <TableCell className="font-semibold">{reading.value}</TableCell>
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
