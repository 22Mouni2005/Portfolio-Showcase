import { db } from "./db";
import { 
  patients, visits, 
  type Patient, type InsertPatient, 
  type Visit, type InsertVisit 
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  // Patients
  getPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient>;
  
  // Visits
  getVisitsByPatientId(patientId: number): Promise<Visit[]>;
  getVisit(id: number): Promise<Visit | undefined>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: number, visit: Partial<InsertVisit>): Promise<Visit>;
}

export class DatabaseStorage implements IStorage {
  // Patients
  async getPatients(): Promise<Patient[]> {
    return await db.select().from(patients).orderBy(desc(patients.updatedAt));
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    const [patient] = await db.select().from(patients).where(eq(patients.id, id));
    return patient;
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const [patient] = await db.insert(patients).values(insertPatient).returning();
    return patient;
  }

  async updatePatient(id: number, updates: Partial<InsertPatient>): Promise<Patient> {
    const [updated] = await db
      .update(patients)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(patients.id, id))
      .returning();
    return updated;
  }

  // Visits
  async getVisitsByPatientId(patientId: number): Promise<Visit[]> {
    return await db
      .select()
      .from(visits)
      .where(eq(visits.patientId, patientId))
      .orderBy(desc(visits.date));
  }

  async getVisit(id: number): Promise<Visit | undefined> {
    const [visit] = await db.select().from(visits).where(eq(visits.id, id));
    return visit;
  }

  async createVisit(insertVisit: InsertVisit): Promise<Visit> {
    const [visit] = await db.insert(visits).values(insertVisit).returning();
    return visit;
  }

  async updateVisit(id: number, updates: Partial<InsertVisit>): Promise<Visit> {
    const [updated] = await db
      .update(visits)
      .set(updates) // JSONB merges are tricky in partial updates, Drizzle handles replacement.
      // Frontend should send full objects for JSON columns if they want to merge, or we replace.
      // For this app, replacing the whole section object is safer/easier.
      .where(eq(visits.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
