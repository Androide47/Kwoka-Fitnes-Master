import { mockClients, mockSchedule } from "@/data/mockTrainer";
import { listForTrainer } from "@/lib/api/bookingsApi";

export type TrainerClientDetail = {
  id: string;
  name: string;
  email: string;
  goal: string;
  lastSession: string;
  sessionsCompleted: number;
  progressSummary: string;
};

export function listTrainerClients(): TrainerClientDetail[] {
  return mockClients;
}

export const listClients = listTrainerClients;

export function getTrainerClient(clientId: string): TrainerClientDetail | null {
  return mockClients.find((client) => client.id === clientId) ?? null;
}

export const getClient = getTrainerClient;

export function listTrainerSchedule() {
  return mockSchedule;
}

export function listBookings(trainerEmail: string) {
  return listForTrainer(trainerEmail);
}

export const trainerApi = {
  listTrainerClients,
  listClients,
  getTrainerClient,
  getClient,
  listTrainerSchedule,
  listBookings,
};
