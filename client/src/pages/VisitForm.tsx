import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertVisitSchema, type InsertVisit } from "@shared/schema";
import { useCreateVisit, useUpdateVisit, useVisit, usePatient } from "@/hooks/use-patients";
import { FundusDrawer } from "@/components/FundusDrawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { ArrowLeft, Loader2, Save, Eye } from "lucide-react";

// Helper for deep updates
const deepMerge = (target: any, source: any) => {
  for (const key in source) {
    if (source[key] instanceof Object && key in target) {
      Object.assign(source[key], deepMerge(target[key], source[key]));
    }
  }
  Object.assign(target || {}, source);
  return target;
};

export default function VisitForm() {
  const [, params] = useRoute("/visits/:id"); // For editing
  const [, newParams] = useRoute("/patients/:id/new-visit"); // For creating
  const [location, setLocation] = useLocation();

  const isEdit = !!params?.id;
  const visitId = parseInt(params?.id || "0");
  const patientId = parseInt(newParams?.id || "0");

  const { data: existingVisit, isLoading: vLoading } = useVisit(visitId);
  const { data: patient } = usePatient(isEdit ? existingVisit?.patientId || 0 : patientId);
  
  const createMutation = useCreateVisit();
  const updateMutation = useUpdateVisit();
  
  const form = useForm<InsertVisit>({
    resolver: zodResolver(insertVisitSchema),
    defaultValues: {
      patientId: patientId,
      date: new Date(),
      caseHistory: {},
      visualAcuity: {
        distanceOD: "", distanceOS: "",
        nearOD: "", nearOS: "",
        unaidedOD: "", unaidedOS: "",
        pinholeOD: "", pinholeOS: "",
      },
      clinicalExam: {},
      anteriorSegment: {
        slitLamp: { cornea: {od: "", os: ""}, conjunctiva: {od: "", os: ""} }
      },
      specialTests: {},
      fundusExam: { drawings: { od: {}, os: {} } },
      diagnosis: {},
    },
  });

  // Load existing data on edit
  useEffect(() => {
    if (existingVisit) {
      form.reset({
        ...existingVisit,
        date: existingVisit.date ? new Date(existingVisit.date) : new Date(),
      });
    }
  }, [existingVisit, form]);

  const onSubmit = (data: InsertVisit) => {
    if (isEdit) {
      updateMutation.mutate({ id: visitId, data }, {
        onSuccess: () => setLocation(`/patients/${data.patientId}`)
      });
    } else {
      createMutation.mutate({ ...data, patientId }, {
        onSuccess: () => setLocation(`/patients/${patientId}`)
      });
    }
  };

  if (isEdit && vLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin inline" /></div>;

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20">
      <div className="flex items-center justify-between sticky top-0 z-40 bg-background/95 backdrop-blur py-4 border-b border-border">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-heading font-bold">{isEdit ? "Edit Visit Record" : "New Clinical Examination"}</h1>
            <p className="text-sm text-muted-foreground">
              Patient: <span className="font-semibold text-foreground">{patient?.name}</span> • {patient?.age}/{patient?.gender}
            </p>
          </div>
        </div>
        <Button 
          onClick={form.handleSubmit(onSubmit)} 
          disabled={createMutation.isPending || updateMutation.isPending}
          className="shadow-lg shadow-primary/20"
        >
          {createMutation.isPending || updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Record
        </Button>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          <Tabs defaultValue="history" className="space-y-6">
            <TabsList className="w-full justify-start h-auto p-1 bg-muted/50 overflow-x-auto">
              <TabsTrigger value="history" className="px-6 py-2.5">Case History</TabsTrigger>
              <TabsTrigger value="va" className="px-6 py-2.5">Visual Acuity</TabsTrigger>
              <TabsTrigger value="anterior" className="px-6 py-2.5">Anterior Segment</TabsTrigger>
              <TabsTrigger value="special" className="px-6 py-2.5">Special Tests</TabsTrigger>
              <TabsTrigger value="fundus" className="px-6 py-2.5 flex gap-2 items-center"><Eye className="w-3 h-3"/> Fundus</TabsTrigger>
              <TabsTrigger value="diagnosis" className="px-6 py-2.5">Diagnosis</TabsTrigger>
            </TabsList>

            {/* === TAB 1: CASE HISTORY === */}
            <TabsContent value="history" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-card border border-border rounded-xl">
                <FormField
                  control={form.control}
                  name="caseHistory.chiefComplaint"
                  render={({ field }) => (
                    <FormItem className="col-span-full">
                      <FormLabel>Chief Complaint (CO)</FormLabel>
                      <FormControl><Textarea className="min-h-[100px]" placeholder="Patient complains of..." {...field} value={field.value || ''} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseHistory.glassesHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>History of Glasses</FormLabel>
                      <FormControl><Input placeholder="E.g. Wearing since 5 years" {...field} value={field.value || ''} /></FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="caseHistory.systemicDiseaseHistory"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Systemic History (Diabetes/HTN)</FormLabel>
                      <FormControl><Input placeholder="Diabetes, Hypertension..." {...field} value={field.value || ''} /></FormControl>
                    </FormItem>
                  )}
                />
                {/* Add more history fields as needed */}
              </div>
            </TabsContent>

            {/* === TAB 2: VISUAL ACUITY === */}
            <TabsContent value="va" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-border rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50 text-muted-foreground font-medium">
                    <tr>
                      <th className="p-4 text-left">Parameter</th>
                      <th className="p-4 text-left border-l border-border">OD (Right Eye)</th>
                      <th className="p-4 text-left border-l border-border">OS (Left Eye)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {['Distance', 'Near', 'Unaided', 'Pinhole'].map((param) => {
                      const key = param.toLowerCase() as 'distance' | 'near' | 'unaided' | 'pinhole';
                      return (
                        <tr key={key}>
                          <td className="p-4 font-medium text-foreground">{param} Vision</td>
                          <td className="p-2 border-l border-border">
                            <FormField
                              control={form.control}
                              name={`visualAcuity.${key}OD` as any}
                              render={({ field }) => (
                                <Input className="h-9 border-transparent hover:border-border focus:border-primary bg-transparent" placeholder="6/6" {...field} value={field.value || ''} />
                              )}
                            />
                          </td>
                          <td className="p-2 border-l border-border">
                            <FormField
                              control={form.control}
                              name={`visualAcuity.${key}OS` as any}
                              render={({ field }) => (
                                <Input className="h-9 border-transparent hover:border-border focus:border-primary bg-transparent" placeholder="6/6" {...field} value={field.value || ''} />
                              )}
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </TabsContent>

            {/* === TAB 3: ANTERIOR SEGMENT === */}
            <TabsContent value="anterior" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <h3 className="section-title">Slit Lamp Examination</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                  {['Cornea', 'Conjunctiva', 'Iris', 'Lens', 'Pupil'].map((part) => {
                    const key = part.toLowerCase();
                    return (
                      <div key={key} className="contents">
                        <div className="col-span-2 md:col-span-1 space-y-2">
                           <FormLabel className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{part} OD</FormLabel>
                           <FormField
                              control={form.control}
                              name={`anteriorSegment.slitLamp.${key}.od` as any}
                              render={({ field }) => (
                                <Input {...field} value={field.value || ''} className="bg-muted/30" />
                              )}
                           />
                        </div>
                        <div className="col-span-2 md:col-span-1 space-y-2">
                           <FormLabel className="text-xs uppercase text-muted-foreground font-semibold tracking-wider">{part} OS</FormLabel>
                           <FormField
                              control={form.control}
                              name={`anteriorSegment.slitLamp.${key}.os` as any}
                              render={({ field }) => (
                                <Input {...field} value={field.value || ''} className="bg-muted/30" />
                              )}
                           />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>
            
            {/* === TAB 4: SPECIAL TESTS === */}
            <TabsContent value="special" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="space-y-4">
                     <h3 className="font-semibold text-primary">Tonometry</h3>
                     <FormField
                        control={form.control}
                        name="specialTests.tonometry.method"
                        render={({ field }) => (
                          <FormItem><FormLabel>Method</FormLabel><Input placeholder="NCT / Applanation" {...field} value={field.value || ''} /></FormItem>
                        )}
                     />
                     <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="specialTests.tonometry.od"
                          render={({ field }) => (
                            <FormItem><FormLabel>IOP OD (mmHg)</FormLabel><Input {...field} value={field.value || ''} /></FormItem>
                          )}
                       />
                       <FormField
                          control={form.control}
                          name="specialTests.tonometry.os"
                          render={({ field }) => (
                            <FormItem><FormLabel>IOP OS (mmHg)</FormLabel><Input {...field} value={field.value || ''} /></FormItem>
                          )}
                       />
                     </div>
                   </div>
                </div>
              </div>
            </TabsContent>

            {/* === TAB 5: FUNDUS (DRAWING) === */}
            <TabsContent value="fundus" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6 bg-card border border-border rounded-xl">
                 <FormField
                    control={form.control}
                    name="fundusExam.drawings.od"
                    render={({ field }) => (
                      <FundusDrawer 
                        label="OD (Right Eye)" 
                        initialData={field.value} 
                        onChange={(data) => field.onChange(data)}
                      />
                    )}
                 />
                 <FormField
                    control={form.control}
                    name="fundusExam.drawings.os"
                    render={({ field }) => (
                      <FundusDrawer 
                        label="OS (Left Eye)" 
                        initialData={field.value} 
                        onChange={(data) => field.onChange(data)}
                      />
                    )}
                 />
                 <div className="col-span-full mt-4">
                    <FormField
                      control={form.control}
                      name="fundusExam.findings.notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fundus Findings / Notes</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Describe Cup-Disc Ratio, Vessels, Macula..." className="min-h-[100px]" {...field} value={field.value || ''} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                 </div>
               </div>
            </TabsContent>
            
            {/* === TAB 6: DIAGNOSIS === */}
            <TabsContent value="diagnosis" className="animate-in fade-in slide-in-from-bottom-2 duration-300">
               <div className="bg-card border border-border rounded-xl p-6 space-y-6">
                 <FormField
                    control={form.control}
                    name="diagnosis.diagnosis"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Final Diagnosis</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Enter final diagnosis..." className="min-h-[100px] text-lg" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="diagnosis.intervention"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Plan / Management</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Prescribed glasses, medication, referral..." className="min-h-[100px]" {...field} value={field.value || ''} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
               </div>
            </TabsContent>

          </Tabs>
        </form>
      </Form>
    </div>
  );
}
