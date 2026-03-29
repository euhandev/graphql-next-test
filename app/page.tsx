/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import Link from "next/link";
import { cookies } from "next/headers";
import LogoutButton from "./components/LogoutButton";
import { graphqlRequest } from "@/lib/graphql";

type SearchParams = { page?: string };

export default async function Home({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const pageValue = (await searchParams)?.page;
  const page = Number(pageValue ?? "1") || 1;

  const variables = {
    input: {
      pagination: { limit: 5, page },
    },
  };

  const query = `
    query getAll($input: GetAllGenericArgs) {
      getAll(input: $input) {
        avatar
        contactNo
        createdAt
        description
        dob
        email
        fcmToken
        id
        lang
        role
        status
        updatedAt
        username
        verificationCode
        verificationCodeExpires
        verificationCodeLastSent
      }
    }
  `;

  const GRAPHQL_URL = process.env.NEXT_PUBLIC_GRAPHQL_URL || process.env.GRAPHQL_URL;
  if (!GRAPHQL_URL) {
    return (
      <div className="min-h-screen bg-[#0f172a] flex items-center justify-center p-8">
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-2xl flex items-center gap-4 max-w-md">
          <svg className="h-8 w-8 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p className="font-semibold text-sm">Application Error: GRAPHQL_URL environment variable is not configured.</p>
        </div>
      </div>
    );
  }

  const accessToken = (await cookies()).get("accessToken")?.value;

  let users: any[] = [];
  let meta: any = null;
  let error: string | null = null;

  try {
    const data = await graphqlRequest(query, variables, accessToken);
    const raw = data?.getAll ?? data ?? null;

    if (Array.isArray(raw)) {
      users = raw;
    } else if (raw?.data && Array.isArray(raw.data)) {
      users = raw.data;
      meta = raw.meta;
    } else if (raw) {
      users = [raw];
    }
  } catch (err: any) {
    error = err?.message || String(err);
  }

  return (
    <div className="min-h-screen bg-[#0f172a] text-white selection:bg-indigo-500/30">
      {/* Dynamic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[30%] h-[30%] bg-indigo-600/10 blur-[100px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30%] h-[30%] bg-purple-600/10 blur-[100px] rounded-full animate-pulse delay-700" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10 lg:px-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-500/20 group transition-transform hover:scale-105 duration-300">
               <span className="text-white text-xl font-black tracking-tighter">AG</span>
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">User Management</h1>
              <p className="text-indigo-200/40 text-sm font-semibold uppercase tracking-widest mt-1">Admin Dashboard</p>
            </div>
          </div>
          <LogoutButton />
        </header>

        {error ? (
          <div className="bg-red-500/5 border border-red-500/10 rounded-2xl p-6 text-red-400 font-medium flex items-center gap-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Failed to fetch users: {error}
          </div>
        ) : (
          <div className="space-y-8">
            <div className="relative group overflow-hidden rounded-[2.5rem] border border-white/5 bg-white/[0.02] backdrop-blur-3xl shadow-2xl transition-all duration-500 hover:bg-white/[0.04] hover:border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-white/[0.05]">
                      <th className="px-8 py-6 text-sm font-bold text-indigo-300/40 uppercase tracking-widest">User Profile</th>
                      <th className="px-6 py-6 text-sm font-bold text-indigo-300/40 uppercase tracking-widest">Contact Info</th>
                      <th className="px-6 py-6 text-sm font-bold text-indigo-300/40 uppercase tracking-widest">Role & Permissions</th>
                      <th className="px-6 py-6 text-sm font-bold text-indigo-300/40 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-6 text-sm font-bold text-indigo-300/40 uppercase tracking-widest">Onboarding Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.03]">
                    {users.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-8 py-20 text-center text-indigo-200/20 font-bold text-xl">No active users found in the system.</td>
                      </tr>
                    ) : (
                      users.map((u: any) => (
                        <tr key={u.id} className="group/row hover:bg-white/[0.02] transition-colors duration-400">
                          <td className="px-8 py-6">
                            <div className="flex items-center gap-5">
                              <div className="relative shrink-0 group/avatar">
                                <div className="absolute inset-[-2px] bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl blur-md opacity-0 group-hover/avatar:opacity-40 transition-opacity duration-500" />
                                {u.avatar ? (
                                  <img
                                    src={u.avatar}
                                    alt={u.username || u.email}
                                    className="relative w-14 h-14 rounded-2xl object-cover ring-2 ring-white/10 transition-transform group-hover/row:scale-105"
                                  />
                                ) : (
                                  <div className="relative w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center ring-2 ring-white/10 transition-all group-hover/row:bg-indigo-500/20">
                                    <span className="text-white/20 text-xl font-bold uppercase">{u.username?.[0] || u.email?.[0]}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-white font-bold text-lg leading-tight group-hover/row:text-indigo-400 transition-colors truncate">{u.username || "Anonymous User"}</span>
                                <span className="text-indigo-200/30 text-sm font-medium truncate">{u.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <span className="text-white/80 font-semibold flex items-center gap-2">
                               <svg className="w-4 h-4 text-indigo-400/60" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                               {u.contactNo || "No contact"}
                            </span>
                          </td>
                          <td className="px-6 py-6">
                            <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover/row:bg-indigo-500/20 transition-all duration-300">
                              {u.role}
                            </div>
                          </td>
                          <td className="px-6 py-6">
                            <div className={`inline-flex items-center gap-2 ${u.status === 'ACTIVE' ? 'text-emerald-400' : 'text-amber-400'}`}>
                               <div className={`w-2 h-2 rounded-full ${u.status === 'ACTIVE' ? 'bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]' : 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.6)]'} animate-pulse`} />
                               <span className="text-sm font-black uppercase tracking-widest">{u.status}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6">
                            <span className="text-indigo-200/40 text-sm font-bold flex flex-col">
                               <span className="text-white/60 font-semibold">{new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                               <span className="text-xs uppercase tracking-tighter mt-1">{new Date(u.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</span>
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-10">
              <div className="text-indigo-200/20 text-sm font-black uppercase tracking-widest">
                Showing Batch <span className="text-indigo-400">{page}</span> {meta ? `of ${meta.totalPage}` : ""}
              </div>
              <div className="flex items-center gap-3">
                <Link
                  href={`/?page=${Math.max(1, page - 1)}`}
                  className={`group relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border ${page === 1 ? 'opacity-30 pointer-events-none border-white/5' : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 active:scale-95'}`}
                >
                  <svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" /></svg>
                  Prev
                </Link>
                <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-black shadow-lg shadow-indigo-500/10">
                  {page}
                </div>
                <Link
                  href={`/?page=${page + 1}`}
                  className={`group relative overflow-hidden rounded-2xl px-6 py-3 text-sm font-black uppercase tracking-wider transition-all duration-300 flex items-center gap-2 border ${meta && page >= meta.totalPage ? 'opacity-30 pointer-events-none border-white/5' : 'border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 active:scale-95'}`}
                >
                  Next
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" /></svg>
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
