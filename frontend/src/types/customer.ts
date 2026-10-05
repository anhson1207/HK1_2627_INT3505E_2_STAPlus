export type CustomerStatus = "ACTIVE" | "INACTIVE";

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    company: string;
    address?: string;
    status: CustomerStatus;
    ownerName?: string;
    createdAt: string;
}

export type CustomerPayload = Omit<Customer, "id" | "createdAt">;
