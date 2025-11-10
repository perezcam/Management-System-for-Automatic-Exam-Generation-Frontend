import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL ?? process.env.NEXT_PUBLIC_BACKEND_URL;
const COOKIE_NAME = "token";

async function proxy(req: Request, pathSegments?: string[]) {
  if (!BACKEND_URL) {
    return NextResponse.json({ error: "Configura BACKEND_URL" }, { status: 500 });
  }

  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  const url = new URL(req.url);
  const tail = (pathSegments ?? []).join("/");
  const target = `${BACKEND_URL.replace(/\/$/, "")}/${tail}${url.search}`;

  const headers = new Headers();
  // Propagar cabeceras de contenido/aceptación si existen
  const contentType = req.headers.get("content-type");
  const accept = req.headers.get("accept");
  if (contentType) headers.set("content-type", contentType);
  if (accept) headers.set("accept", accept);
  if (token) headers.set("authorization", `Bearer ${token}`);

  const method = req.method;
  let body: BodyInit | undefined;
  if (!/(GET|HEAD)/i.test(method)) {
    // Reenviar el cuerpo tal cual
    const arrayBuffer = await req.arrayBuffer();
    body = arrayBuffer;
  }

  const resp = await fetch(target, { method, headers, body });

  // Devuelve el stream de respuesta original
  const respHeaders = new Headers(resp.headers);
  // Evita propagar cookies externas
  respHeaders.delete("set-cookie");

  return new NextResponse(resp.body, {
    status: resp.status,
    headers: respHeaders,
  });
}

export async function GET(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function POST(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function PATCH(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function DELETE(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}

export async function OPTIONS(req: Request, ctx: { params: Promise<{ path?: string[] }> }) {
  const { path } = await ctx.params;
  return proxy(req, path);
}
