import { useState } from "react";
import { Link } from "wouter";
import { usePatients } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Search, 
  UserPlus, 
  Users, 
  Calendar, 
  ChevronRight,
  Eye,
  Loader2
} from "lucide-react";
import { format } from "date-fns";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const { data: patients, isLoading, error } = usePatients(search);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-foreground">Patient Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage patient records and clinical visits.</p>
        </div>
        <Link href="/patients/new">
          <Button size="lg" className="shadow-lg shadow-primary/20">
            <UserPlus className="w-4 h-4 mr-2" />
            New Patient
          </Button>
        </Link>
      </div>

      {/* Stats Cards (Mock Data for Visuals) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900 border-blue-100 dark:border-blue-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-blue-600 rounded-xl">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
              <h3 className="text-2xl font-bold text-foreground">1,284</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-50 to-white dark:from-purple-950/20 dark:to-zinc-900 border-purple-100 dark:border-purple-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/50 text-purple-600 rounded-xl">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Visits Today</p>
              <h3 className="text-2xl font-bold text-foreground">12</h3>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-zinc-900 border-emerald-100 dark:border-emerald-900">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 rounded-xl">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Pending Reports</p>
              <h3 className="text-2xl font-bold text-foreground">3</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & List */}
      <div className="space-y-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search by name, MRD, or phone..." 
            className="pl-10 h-12 text-base rounded-xl border-border bg-card shadow-sm focus:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-12 gap-4 p-4 border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <div className="col-span-3">Patient Name</div>
            <div className="col-span-2">MRD No.</div>
            <div className="col-span-2">Phone</div>
            <div className="col-span-2">Last Visit</div>
            <div className="col-span-3 text-right">Actions</div>
          </div>

          {isLoading ? (
            <div className="p-12 flex justify-center text-muted-foreground">
              <Loader2 className="w-6 h-6 animate-spin mr-2" />
              Loading records...
            </div>
          ) : error ? (
            <div className="p-8 text-center text-destructive">Failed to load patients.</div>
          ) : patients?.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No patients found. Create a new record to get started.
            </div>
          ) : (
            <div className="divide-y divide-border">
              {patients?.map((patient) => (
                <div key={patient.id} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-muted/50 transition-colors group">
                  <div className="col-span-3 font-medium text-foreground flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {patient.name.charAt(0)}
                    </div>
                    {patient.name}
                  </div>
                  <div className="col-span-2 text-sm text-muted-foreground font-mono">{patient.mrdNumber}</div>
                  <div className="col-span-2 text-sm text-muted-foreground">{patient.contactNumber}</div>
                  <div className="col-span-2 text-sm text-muted-foreground">
                    {/* Ideally we fetch last visit date, using created_at for now as proxy if needed */}
                    {format(new Date(patient.updatedAt || new Date()), "MMM d, yyyy")}
                  </div>
                  <div className="col-span-3 flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Link href={`/patients/${patient.id}`}>
                      <Button variant="ghost" size="sm" className="h-8">View</Button>
                    </Link>
                    <Link href={`/patients/${patient.id}/new-visit`}>
                      <Button size="sm" className="h-8 bg-primary/10 text-primary hover:bg-primary/20 border border-primary/20 shadow-none">
                        Exam <ChevronRight className="w-3 h-3 ml-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
