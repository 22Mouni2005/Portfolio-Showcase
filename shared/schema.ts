import { pgTable, text, serial, integer, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
export * from "./models/auth";

// === PATIENTS ===
export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(), // Male, Female, Other
  registrationNumber: text("registration_number").notNull().unique(),
  mrdNumber: text("mrd_number").notNull().unique(),
  occupation: text("occupation"),
  contactNumber: text("contact_number").notNull(),
  address: text("address"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// === VISITS (CLINICAL RECORDS) ===
export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  date: timestamp("date").defaultNow(),
  
  // 1. Case History
  caseHistory: jsonb("case_history").$type<{
    chiefComplaint: string;
    glassesHistory: string;
    pgp: string; // Previous Glasses Prescription
    consultationHistory: string;
    familyHistory: string;
    traumaHistory: string;
    systemicDiseaseHistory: string;
    medicationHistory: string;
    surgeryHistory: string;
    allergyHistory: string;
    socialHistory: string;
  }>().default({}),

  // 2. Clinical Examination - A) Visual Acuity
  visualAcuity: jsonb("visual_acuity").$type<{
    distanceOD: string; distanceOS: string;
    nearOD: string; nearOS: string;
    unaidedOD: string; unaidedOS: string;
    pinholeOD: string; pinholeOS: string;
    previousGlasses: {
      od: { sph: string; cyl: string; axis: string; };
      os: { sph: string; cyl: string; axis: string; };
    };
    objectiveRefraction: {
      od: { sph: string; cyl: string; axis: string; };
      os: { sph: string; cyl: string; axis: string; };
    };
    subjectiveRefraction: {
      od: { sph: string; cyl: string; axis: string; };
      os: { sph: string; cyl: string; axis: string; };
    };
    newCorrection: {
      od: { sph: string; cyl: string; axis: string; va: string; };
      os: { sph: string; cyl: string; axis: string; va: string; };
    };
  }>().default({}),

  // 2. Clinical Examination - B, C, D, E, F, G, H, I
  clinicalExam: jsonb("clinical_exam").$type<{
    colorVision: { od: string; os: string; };
    keratometry: { vertical: string; horizontal: string; comments: string; };
    coverTest: string;
    npc: { subjective: string; objective: string; }; // Near Point of Convergence
    eom: string; // Extraocular Movements
    npa: { od: string; os: string; ou: string; }; // Near Point of Accommodation
    wfdt: string; // Worth Four Dot Test
    stereopsis: string;
  }>().default({}),

  // 3. Anterior Segment
  anteriorSegment: jsonb("anterior_segment").$type<{
    pupillaryEvaluation: string;
    externalExam: string;
    palpebralFissureHeight: string;
    slitLamp: {
      ocularAdnexa: { od: string; os: string; };
      cornea: { od: string; os: string; };
      conjunctiva: { od: string; os: string; };
      sclera: { od: string; os: string; };
      anteriorChamber: { od: string; os: string; };
      iris: { od: string; os: string; };
      pupil: { od: string; os: string; };
      lens: { od: string; os: string; };
    };
  }>().default({}),

  // 4. Special Tests
  specialTests: jsonb("special_tests").$type<{
    tonometry: { method: string; time: string; od: string; os: string; };
    gonioscopy: string;
    tbut: { od: string; os: string; }; // Tear Break-up Time
    schirmer: { od: string; os: string; };
    syringing: { od: string; os: string; };
    roplas: { od: string; os: string; }; // Regurgitation on Pressure over Lacrimal Sac
    otherProcedures: string;
    dilationInstructions: string;
  }>().default({}),

  // 5. Fundus Examination (Drawing Data)
  fundusExam: jsonb("fundus_exam").$type<{
    drawings: {
      od: any; // Fabric.js JSON object
      os: any; // Fabric.js JSON object
    };
    findings: {
      cupping: boolean;
      hemorrhages: boolean;
      exudates: boolean;
      macularChanges: boolean;
      notes: string;
    };
  }>().default({}),

  // 6. Diagnosis & Management
  diagnosis: jsonb("diagnosis").$type<{
    diagnosis: string;
    intervention: string;
    learningNotes: string;
  }>().default({}),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const patientsRelations = relations(patients, ({ many }) => ({
  visits: many(visits),
}));

export const visitsRelations = relations(visits, ({ one }) => ({
  patient: one(patients, {
    fields: [visits.patientId],
    references: [patients.id],
  }),
}));

// === ZOD SCHEMAS ===
export const insertPatientSchema = createInsertSchema(patients).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

export const insertVisitSchema = createInsertSchema(visits).omit({ 
  id: true, 
  createdAt: true, 
  updatedAt: true 
});

// === TYPES ===
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;
