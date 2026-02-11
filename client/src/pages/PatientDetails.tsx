import { Link, useRoute } from "wouter";
import { usePatient, usePatientVisits } from "@/hooks/use-patients";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Calendar, FileText, Loader2, Phone, User, MapPin, Plus } from "lucide-react";
import { format } from "date-fns";

export default function PatientDetails() {
  const [, params] = useRoute("/patients/:id");
  const id = parseInt(params?.id || "0");
  
  const { data: patient, isLoading: pLoading } = usePatient(id);
  const { data: visits, isLoading: vLoading } = usePatientVisits(id);

  if (pLoading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin w-8 h-8 text-primary" /></div>;
  if (!patient) return <div className="p-12 text-center text-muted-foreground">Patient not found</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{patient.name}</h1>
            <p className="text-muted-foreground flex items-center gap-2">
              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-xs">{patient.mrdNumber}</span>
              <span>•</span>
              <span>{patient.age} years</span>
              <span>•</span>
              <span>{patient.gender}</span>
            </p>
          </div>
        </div>
        
        <Link href={`/patients/${id}/new-visit`}>
          <Button size="lg" className="shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4 mr-2" />
            Start New Exam
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Phone</p>
                  <p className="text-sm text-muted-foreground">{patient.contactNumber}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Occupation</p>
                  <p className="text-sm text-muted-foreground">{patient.occupation || "Not listed"}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Address</p>
                  <p className="text-sm text-muted-foreground">{patient.address || "Not listed"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visits History */}
        <div className="md:col-span-2 space-y-6">
          <h3 className="text-xl font-heading font-bold text-foreground">Clinical History</h3>
          
          {vLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="animate-spin w-6 h-6" /></div>
          ) : !visits || visits.length === 0 ? (
            <div className="border-2 border-dashed border-border rounded-xl p-12 text-center">
              <FileText className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="text-lg font-medium">No visits recorded</h3>
              <p className="text-muted-foreground mb-4">Start a new clinical examination for this patient.</p>
              <Link href={`/patients/${id}/new-visit`}>
                <Button variant="outline">Start Exam</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {visits.map((visit) => (
                <Link key={visit.id} href={`/visits/${visit.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer group">
                    <CardContent className="p-6 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-primary/10 text-primary rounded-xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">
                            {format(new Date(visit.date || new Date()), "MMMM d, yyyy")}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(visit.date || new Date()), "h:mm a")}
                          </p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                          Completed
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
