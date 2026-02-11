import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";
import { seed } from "./seed";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Auth Setup
  await setupAuth(app);
  registerAuthRoutes(app);

  // Seed Data
  await seed();


  // === PATIENTS ===
  
  // List Patients
  app.get(api.patients.list.path, async (req, res) => {
    const search = req.query.search as string | undefined;
    let patients = await storage.getPatients();
    
    if (search) {
      const lowerSearch = search.toLowerCase();
      patients = patients.filter(p => 
        p.name.toLowerCase().includes(lowerSearch) ||
        p.mrdNumber.toLowerCase().includes(lowerSearch) ||
        p.registrationNumber.toLowerCase().includes(lowerSearch) ||
        p.contactNumber.includes(lowerSearch)
      );
    }
    
    res.json(patients);
  });

  // Get Patient
  app.get(api.patients.get.path, async (req, res) => {
    const patient = await storage.getPatient(Number(req.params.id));
    if (!patient) return res.status(404).json({ message: "Patient not found" });
    res.json(patient);
  });

  // Create Patient
  app.post(api.patients.create.path, async (req, res) => {
    try {
      const input = api.patients.create.input.parse(req.body);
      const patient = await storage.createPatient(input);
      res.status(201).json(patient);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", details: err.errors });
      }
      throw err;
    }
  });

  // Update Patient
  app.put(api.patients.update.path, async (req, res) => {
    try {
      const input = api.patients.update.input.parse(req.body);
      const updated = await storage.updatePatient(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "Patient not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", details: err.errors });
      }
      throw err;
    }
  });

  // Get Patient Visits
  app.get(api.patients.getVisits.path, async (req, res) => {
    const visits = await storage.getVisitsByPatientId(Number(req.params.id));
    res.json(visits);
  });


  // === VISITS ===

  // Get Visit
  app.get(api.visits.get.path, async (req, res) => {
    const visit = await storage.getVisit(Number(req.params.id));
    if (!visit) return res.status(404).json({ message: "Visit not found" });
    res.json(visit);
  });

  // Create Visit
  app.post(api.visits.create.path, async (req, res) => {
    try {
      const input = api.visits.create.input.parse(req.body);
      const visit = await storage.createVisit(input);
      res.status(201).json(visit);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", details: err.errors });
      }
      throw err;
    }
  });

  // Update Visit
  app.put(api.visits.update.path, async (req, res) => {
    try {
      const input = api.visits.update.input.parse(req.body);
      const updated = await storage.updateVisit(Number(req.params.id), input);
      if (!updated) return res.status(404).json({ message: "Visit not found" });
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: "Validation error", details: err.errors });
      }
      throw err;
    }
  });

  return httpServer;
}
