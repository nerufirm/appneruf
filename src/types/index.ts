export type UserSummary = {
  id: string;
  name: string;
  building_room: string | null;
  status: string | null;
};

export type UserDetail = {
  id: string;
  name: string;
  gender: string | null;
  birth_date: string | null;
  building_room: string | null;
  care_level: string | null;
  primary_doctor: string | null;
  emergency_contact: string | null;
};

export type MedicalHistory = {
  id: number;
  user_id: string;
  disease_name: string | null;
  onset_date: string | null;
  hospital: string | null;
};

export type Medication = {
  id: string;
  user_id: string;
  timing: string | null;
  medicine_name: string | null;
  dosage: string | null;
};

export type DailyRecord = {
  id: number;
  user_id: string;
  staff_id: string | null;
  record_time: string;
  body_temp: number | null;
  bp_high: number | null;
  bp_low: number | null;
  pulse: number | null;
  spo2: number | null;
  excretion_urine: string | null;
  meal_amount: string | null;
};

export type ChatLog = {
  id: number;
  user_id: string;
  staff_name: string | null;
  message: string | null;
  send_time: string;
  category_tag: string | null;
};

export type TimelineItem =
  | { type: "daily_record"; time: string; data: DailyRecord }
  | { type: "chat_log"; time: string; data: ChatLog };

export type Staff = {
  id: string;
  name: string;
  department: string | null;
};
