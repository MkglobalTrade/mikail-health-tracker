import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { format } from "date-fns";
import { toast } from "sonner";
import { Plus, Pill } from "lucide-react";

const medicationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  dosage: z.string().min(1, "Dosage is required"),
  frequency: z.string().min(1, "Frequency is required"),
  schedule: z.enum(["day", "night", "both"]),
  notes: z.string().optional(),
  startDate: z.string(),
});

export default function MedicationManager() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(medicationSchema),
    defaultValues: {
      startDate: format(new Date(), "yyyy-MM-dd"),
      schedule: "day",
    },
  });

  const medicationsQuery = trpc.medications.list.useQuery();
  const addMedicationMutation = trpc.medications.add.useMutation({
    onSuccess: () => {
      toast.success("Medication added!");
      reset();
      setOpen(false);
      medicationsQuery.refetch();
    },
    onError: () => {
      toast.error("Failed to add medication");
    },
  });

  const onSubmit = (data: any) => {
    const [year, month, day] = data.startDate.split("-");
    const startDate = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    addMedicationMutation.mutate({
      name: data.name,
      dosage: data.dosage,
      frequency: data.frequency,
      schedule: data.schedule,
      notes: data.notes,
      startDate,
    });
  };

  const medications = medicationsQuery.data || [];
  const dayMeds = medications.filter(m => m.schedule === "day" || m.schedule === "both");
  const nightMeds = medications.filter(m => m.schedule === "night" || m.schedule === "both");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Medication Manager</h1>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Medication
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Medication</DialogTitle>
                <DialogDescription>Enter your medication details below</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="name">Medication Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Metformin"
                    {...register("name")}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                </div>

                <div>
                  <Label htmlFor="dosage">Dosage</Label>
                  <Input
                    id="dosage"
                    placeholder="e.g., 500mg"
                    {...register("dosage")}
                    className={errors.dosage ? "border-red-500" : ""}
                  />
                  {errors.dosage && <p className="text-red-500 text-sm mt-1">{errors.dosage.message}</p>}
                </div>

                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Input
                    id="frequency"
                    placeholder="e.g., Once daily, Twice daily"
                    {...register("frequency")}
                    className={errors.frequency ? "border-red-500" : ""}
                  />
                  {errors.frequency && <p className="text-red-500 text-sm mt-1">{errors.frequency.message}</p>}
                </div>

                <div>
                  <Label htmlFor="schedule">Schedule</Label>
                  <Select defaultValue="day" onValueChange={(value) => setValue("schedule", value as "day" | "night" | "both")}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="night">Night</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    {...register("startDate")}
                  />
                </div>

                <div>
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    placeholder="Any special instructions..."
                    {...register("notes")}
                    className="resize-none"
                  />
                </div>

                <Button type="submit" className="w-full" disabled={addMedicationMutation.isPending}>
                  {addMedicationMutation.isPending ? "Adding..." : "Add Medication"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Day Schedule */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-amber-600" />
              Day Schedule
            </CardTitle>
            <CardDescription>Medications to take during the day</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {dayMeds.length > 0 ? (
              <div className="space-y-3">
                {dayMeds.map(med => (
                  <div key={med.id} className="flex items-start gap-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <input type="checkbox" className="w-5 h-5 mt-1 rounded" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{med.name}</h4>
                      <p className="text-sm text-slate-600">{med.dosage} • {med.frequency}</p>
                      {med.notes && <p className="text-sm text-slate-500 mt-1">{med.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Started: {format(new Date(med.startDate), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No day medications added</p>
            )}
          </CardContent>
        </Card>

        {/* Night Schedule */}
        <Card className="mb-6">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-blue-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Pill className="w-5 h-5 text-indigo-600" />
              Night Schedule
            </CardTitle>
            <CardDescription>Medications to take at night</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {nightMeds.length > 0 ? (
              <div className="space-y-3">
                {nightMeds.map(med => (
                  <div key={med.id} className="flex items-start gap-4 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                    <input type="checkbox" className="w-5 h-5 mt-1 rounded" />
                    <div className="flex-1">
                      <h4 className="font-semibold text-slate-900">{med.name}</h4>
                      <p className="text-sm text-slate-600">{med.dosage} • {med.frequency}</p>
                      {med.notes && <p className="text-sm text-slate-500 mt-1">{med.notes}</p>}
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">Started: {format(new Date(med.startDate), "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No night medications added</p>
            )}
          </CardContent>
        </Card>

        {/* All Medications Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Medications</CardTitle>
            <CardDescription>Complete medication list</CardDescription>
          </CardHeader>
          <CardContent>
            {medications.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Dosage</TableHead>
                      <TableHead>Frequency</TableHead>
                      <TableHead>Schedule</TableHead>
                      <TableHead>Start Date</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {medications.map(med => (
                      <TableRow key={med.id}>
                        <TableCell className="font-semibold">{med.name}</TableCell>
                        <TableCell>{med.dosage}</TableCell>
                        <TableCell>{med.frequency}</TableCell>
                        <TableCell className="capitalize">{med.schedule}</TableCell>
                        <TableCell>{format(new Date(med.startDate), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded text-sm font-medium ${med.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}`}>
                            {med.isActive ? "Active" : "Inactive"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <p className="text-slate-500 text-center py-8">No medications added yet</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
