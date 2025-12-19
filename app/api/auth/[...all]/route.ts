import { auth } from "@/lib/better-auth/auth";
import { toNextJsHandler } from "better-auth/next-js";


console.log("Better Auth Status:", auth ? "Carregado" : "Falhou");


const handlers = toNextJsHandler(auth as any);

export const { GET, POST } = handlers;