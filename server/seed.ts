import { storage } from "./storage";
import { db } from "./db";

export async function seed() {
  const patients = await storage.getPatients();
  if (patients.length > 0) return;

  console.log("Seeding database...");

  const patient = await storage.createPatient({
    name: "John Doe",
    age: 45,
    gender: "Male",
    registrationNumber: "REG-2023-001",
    mrdNumber: "MRD-1001",
    occupation: "Software Engineer",
    contactNumber: "555-0123",
    address: "123 Main St, Tech City",
    email: "john@example.com"
  });

  await storage.createVisit({
    patientId: patient.id,
    date: new Date(),
    caseHistory: {
      chiefComplaint: "Blurry vision at distance for 2 months",
      glassesHistory: "Wearing glasses for 5 years",
      pgp: "-2.00 DS OD/OS",
      consultationHistory: "None recently",
      familyHistory: "Father has glaucoma",
      traumaHistory: "None",
      systemicDiseaseHistory: "Hypertension",
      medicationHistory: "Amlodipine 5mg",
      surgeryHistory: "None",
      allergyHistory: "None",
      socialHistory: "Non-smoker"
    },
    visualAcuity: {
      distanceOD: "6/12", distanceOS: "6/18",
      nearOD: "N6", nearOS: "N6",
      unaidedOD: "6/60", unaidedOS: "6/60",
      pinholeOD: "6/6", pinholeOS: "6/9",
      previousGlasses: {
        od: { sph: "-2.00", cyl: "", axis: "" },
        os: { sph: "-2.00", cyl: "", axis: "" }
      },
      objectiveRefraction: {
        od: { sph: "-2.50", cyl: "-0.50", axis: "180" },
        os: { sph: "-2.75", cyl: "", axis: "" }
      },
      subjectiveRefraction: {
        od: { sph: "-2.50", cyl: "-0.50", axis: "180" },
        os: { sph: "-2.75", cyl: "", axis: "" }
      },
      newCorrection: {
        od: { sph: "-2.50", cyl: "-0.50", axis: "180", va: "6/6" },
        os: { sph: "-2.75", cyl: "", axis: "", va: "6/6" }
      }
    },
    diagnosis: {
      diagnosis: "Myopia with Astigmatism",
      intervention: "Prescribed new glasses",
      learningNotes: "Patient to return for follow up in 1 year"
    }
  });

  console.log("Seeding complete!");
}
