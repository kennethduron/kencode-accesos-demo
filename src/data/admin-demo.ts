export type AdminAccessState = "inside" | "active" | "completed" | "expired" | "cancelled" | "used";

export interface AdminAccessRecord {
  id: string;
  visitor: string;
  home: string;
  type: string;
  vehicle: string;
  plate: string;
  code: string;
  state: AdminAccessState;
  lastEvent: string;
  time: string;
}

export interface AdminHome {
  id: string;
  label: string;
  resident: string;
  sector: string;
  members: number;
  vehicles: number;
  activePermits: number;
  status: "Activa" | "En revisión";
}

export interface AdminResidentRecord {
  id: string;
  name: string;
  home: string;
  status: "Validado" | "Pendiente";
  members: number;
  vehicles: number;
  lastActivity: string;
}

export interface AdminAuditRecord {
  id: string;
  time: string;
  event: string;
  code: string;
  home: string;
  station: string;
  tone: "success" | "info" | "warning" | "danger";
}

export const adminSummary = [
  { label: "Viviendas", value: "Directorio", detail: "Muestra ilustrativa, no censo real", tone: "blue" },
  { label: "Residentes", value: "Perfiles", detail: "Información ficticia de presentación", tone: "cyan" },
  { label: "Visitas hoy", value: "38", detail: "+12% frente al día anterior", tone: "indigo" },
  { label: "Personas dentro", value: "12", detail: "Presencia operativa actual", tone: "emerald" },
  { label: "Accesos activos", value: "27", detail: "Permisos vigentes", tone: "sky" },
  { label: "Accesos rechazados", value: "4", detail: "Requieren revisión conceptual", tone: "rose" },
] as const;

export const adminActivity = [
  { id: "act-1", visitor: "María Gómez", event: "Entrada confirmada", home: "Casa 27", time: "4:20 PM", tone: "success" },
  { id: "act-2", visitor: "Carlos López", event: "Salida confirmada", home: "Casa 104", time: "4:15 PM", tone: "info" },
  { id: "act-3", visitor: "Uber", event: "Código utilizado", home: "Casa 81", time: "4:12 PM", tone: "neutral" },
  { id: "act-4", visitor: "Proveedor", event: "Acceso rechazado · código vencido", home: "Casa 316", time: "4:08 PM", tone: "danger" },
  { id: "act-5", visitor: "Andrea Reyes", event: "Permiso familiar creado", home: "Casa 642", time: "3:56 PM", tone: "info" },
] as const;

export const adminAccesses: AdminAccessRecord[] = [
  { id: "access-1", visitor: "María Gómez", home: "Casa 27", type: "Familiar", vehicle: "Toyota Corolla", plate: "ABC-123", code: "A7X9-2K4P", state: "inside", lastEvent: "Entrada confirmada", time: "4:20 PM" },
  { id: "access-2", visitor: "Andrea Reyes", home: "Casa 642", type: "Familiar", vehicle: "Honda CR-V", plate: "PDC-2841", code: "B8JM-4T2Q", state: "active", lastEvent: "Permiso creado", time: "3:56 PM" },
  { id: "access-3", visitor: "Uber", home: "Casa 81", type: "Uber", vehicle: "Vehículo de plataforma", plate: "HND-8420", code: "UBR2-7K4M", state: "used", lastEvent: "Entrada confirmada", time: "4:12 PM" },
  { id: "access-4", visitor: "Carlos López", home: "Casa 104", type: "Amigo", vehicle: "Nissan Versa", plate: "PCN-7204", code: "C4LP-8R2M", state: "completed", lastEvent: "Salida confirmada", time: "4:15 PM" },
  { id: "access-5", visitor: "Proveedor", home: "Casa 316", type: "Proveedor", vehicle: "Panel blanca", plate: "PAA-7041", code: "PRV8-3J6K", state: "expired", lastEvent: "Validación rechazada", time: "4:08 PM" },
  { id: "access-6", visitor: "Delivery", home: "Casa 510", type: "Delivery", vehicle: "Motocicleta", plate: "MTR-218", code: "DLV5-2P9Q", state: "cancelled", lastEvent: "Permiso cancelado", time: "3:44 PM" },
  { id: "access-7", visitor: "José Martínez", home: "Casa 903", type: "Familiar", vehicle: "Hyundai Tucson", plate: "PDH-9217", code: "JSM7-4Q8P", state: "active", lastEvent: "Permiso creado", time: "3:32 PM" },
  { id: "access-8", visitor: "Laura Pérez", home: "Casa 128", type: "Peatonal", vehicle: "No aplica", plate: "No aplica", code: "LPR4-9H2N", state: "completed", lastEvent: "Salida confirmada", time: "3:20 PM" },
];

export const adminHomes: AdminHome[] = [
  { id: "home-27", label: "Casa 27", resident: "Alejandro", sector: "Zona ficticia A", members: 3, vehicles: 2, activePermits: 1, status: "Activa" },
  { id: "home-104", label: "Casa 104", resident: "Familia Martínez", sector: "Zona ficticia B", members: 4, vehicles: 2, activePermits: 0, status: "Activa" },
  { id: "home-81", label: "Casa 81", resident: "Familia Rivera", sector: "Zona ficticia A", members: 5, vehicles: 3, activePermits: 0, status: "Activa" },
  { id: "home-316", label: "Casa 316", resident: "Carolina Mejía", sector: "Zona ficticia C", members: 2, vehicles: 1, activePermits: 0, status: "Activa" },
  { id: "home-510", label: "Casa 510", resident: "Daniela Cruz", sector: "Zona ficticia D", members: 3, vehicles: 1, activePermits: 2, status: "En revisión" },
  { id: "home-642", label: "Casa 642", resident: "Andrea Reyes", sector: "Zona ficticia E", members: 2, vehicles: 2, activePermits: 1, status: "Activa" },
];

export const adminResidents: AdminResidentRecord[] = [
  { id: "resident-1", name: "Alejandro", home: "Casa 27", status: "Validado", members: 3, vehicles: 2, lastActivity: "Entrada familiar · 4:20 PM" },
  { id: "resident-2", name: "Sofía Martínez", home: "Casa 104", status: "Validado", members: 4, vehicles: 2, lastActivity: "Salida confirmada · 4:15 PM" },
  { id: "resident-3", name: "Roberto Rivera", home: "Casa 81", status: "Validado", members: 5, vehicles: 3, lastActivity: "Uber utilizado · 4:12 PM" },
  { id: "resident-4", name: "Carolina Mejía", home: "Casa 316", status: "Validado", members: 2, vehicles: 1, lastActivity: "Proveedor rechazado · 4:08 PM" },
  { id: "resident-5", name: "Daniela Cruz", home: "Casa 510", status: "Pendiente", members: 3, vehicles: 1, lastActivity: "Solicitud actualizada · 3:48 PM" },
  { id: "resident-6", name: "Andrea Reyes", home: "Casa 642", status: "Validado", members: 2, vehicles: 2, lastActivity: "Permiso creado · 3:56 PM" },
];

export const adminAudit: AdminAuditRecord[] = [
  { id: "audit-1", time: "Hoy · 4:20 PM", event: "Entrada confirmada", code: "A7X9-2K4P", home: "Casa 27", station: "Puesto Principal", tone: "success" },
  { id: "audit-2", time: "Hoy · 4:15 PM", event: "Salida confirmada", code: "C4LP-8R2M", home: "Casa 104", station: "Puesto Principal", tone: "info" },
  { id: "audit-3", time: "Hoy · 4:12 PM", event: "Código utilizado", code: "UBR2-7K4M", home: "Casa 81", station: "Puesto Principal", tone: "warning" },
  { id: "audit-4", time: "Hoy · 4:08 PM", event: "Validación rechazada", code: "PRV8-3J6K", home: "Casa 316", station: "Puesto Principal", tone: "danger" },
  { id: "audit-5", time: "Hoy · 3:56 PM", event: "Permiso creado", code: "B8JM-4T2Q", home: "Casa 642", station: "Portal del residente", tone: "info" },
  { id: "audit-6", time: "Hoy · 3:44 PM", event: "Permiso cancelado", code: "DLV5-2P9Q", home: "Casa 510", station: "Portal del residente", tone: "danger" },
  { id: "audit-7", time: "Hoy · 3:20 PM", event: "Salida confirmada", code: "LPR4-9H2N", home: "Casa 128", station: "Puesto Principal", tone: "info" },
];
