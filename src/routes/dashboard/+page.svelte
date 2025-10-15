<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import ShowAppointment from "@src/routes/ShowAppointment.svelte";
    import { Card, Button, Badge } from "flowbite-svelte";

    import {
        get_appointment_stats,
        get_appointment_list,
        get_appointment,
        approve_appointment,
        reject_appointment,
    } from "@src/helper_approver.js";

    import type { Booking, Status } from "@src/appointment.js";

    // --- public props (adjustable) ---
    export let limitStart = 0;
    export let pageLength = 20;

    export let heading = "Darshan Management Console";
    export let subtitle =
        "Workspace for Protocol Officer & Approver. Monitoring status as of today.";
    export let sectionTitle = "Booking Summaries";

    // --- local state ---
    let loading = false;
    let error: string | null = null;

    // stats structure is { "Vip Darshan": {Pending: 1, Approved:0,...}, ... }
    let stats: Record<string, Record<string, number>> = {};
    let bookings: Booking[] = []; // pending bookings list
    let show = false;
    let selectedId: string | null = null;

    function badgeClass(status: Status | string) {
        switch (status) {
            case "Approved":
                return "green";
            case "Pending":
                return "orange";
            case "Pending Verification":
                return "blue";
            case "Rejected":
                return "red";
            default:
                return "gray";
        }
    }

    // normalize keys returned by API to display order & titles we want
    const DARSHAN_ORDER = [
        { key: "Vip Darshan", title: "VIP Darshan" },
        { key: "Bhasm Arti", title: "Bhasm Arti" },
        { key: "Shigra Darshan", title: "Shigra Darshan" },
        { key: "Localide Darshan", title: "Localide Darshan" },
    ];

    // --- API calls ---
    async function fetchStats() {
        loading = true;
        error = null;
        try {
            const payload = await get_appointment_stats();
            stats = payload?.message ?? {};
        } catch (err: any) {
            error = err?.message ?? "Failed to fetch stats";
            stats = {};
        } finally {
            loading = false;
        }
    }

    async function fetchBookings() {
        loading = true;
        error = null;
        try {
            const payload = await get_appointment_list(limitStart, pageLength);
            bookings = payload?.message ?? [];
        } catch (err: any) {
            error = err?.message ?? "Failed to fetch bookings";
            bookings = [];
        } finally {
            loading = false;
        }
    }

    onMount(() => {
        // fetch both
        fetchStats();
        fetchBookings();
    });

    // --- UI actions ---
    function openModal(details: Booking) {
        selectedId = details.name ?? details.id ?? null;
        show = true;
    }
    function handleModalClose() {
        show = false;
    }

    // Approve / Reject a single appointment (by id/name)
    async function approveSingle(appointment_id: string) {
        loading = true;
        error = null;
        try {
            await approve_appointment(appointment_id);
            await fetchStats();
            await fetchBookings();
        } catch (err: any) {
            error = err?.message ?? "Approve failed";
        } finally {
            loading = false;
        }
    }

    async function rejectSingle(appointment_id: string) {
        loading = true;
        error = null;
        try {
            await reject_appointment(appointment_id);
            await fetchStats();
            await fetchBookings();
        } catch (err: any) {
            error = err?.message ?? "Reject failed";
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen bg-slate-50 p-6">
    <div class="max-w-6xl mx-auto">
        <div class="bg-white rounded-2xl shadow-lg p-6">
            <div class="flex items-start justify-between gap-4">
                <div>
                    <h1 class="text-3xl font-extrabold text-slate-800">
                        {heading}
                    </h1>
                    <p class="text-sm text-slate-500 mt-1">{subtitle}</p>
                </div>
                <div class="flex items-center gap-3">
                    <Button
                        color="light"
                        onclick={() => {
                            fetchStats();
                            fetchBookings();
                        }}
                        disabled={loading}
                    >
                        {#if loading}Refreshing...{:else}Refresh{/if}
                    </Button>
                </div>
            </div>

            <h2 class="text-lg font-bold text-slate-700 mt-6 mb-3">
                {sectionTitle}
            </h2>

            <!-- Cards -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {#each DARSHAN_ORDER as d}
                    <Card class="rounded-xl p-4">
                        <div class="flex justify-between items-start">
                            <div>
                                <h3 class="text-lg font-bold text-slate-800">
                                    {d.title}
                                </h3>
                                <div class="mt-2 text-sm text-slate-600">
                                    <div
                                        class="flex items-center justify-between"
                                    >
                                        <span>Received (Pending)</span>
                                        <span
                                            class="font-semibold text-red-500"
                                        >
                                            {stats[d.key]?.Pending ?? 0}
                                        </span>
                                    </div>
                                    <div
                                        class="flex items-center justify-between mt-1"
                                    >
                                        <span>Approved</span>
                                        <span
                                            class="font-semibold text-green-600"
                                            >{stats[d.key]?.Approved ?? 0}</span
                                        >
                                    </div>
                                    <div
                                        class="flex items-center justify-between mt-1"
                                    >
                                        <span>Rejected</span>
                                        <span
                                            class="font-semibold text-slate-500"
                                            >{stats[d.key]?.Rejected ?? 0}</span
                                        >
                                    </div>
                                </div>
                            </div>
                            <div class="text-right">
                                <div class="text-xs text-slate-400">
                                    TOTAL BOOKINGS
                                </div>
                                <div class="text-2xl font-extrabold mt-1">
                                    {Object.values(stats[d.key] ?? {}).reduce(
                                        (a, b) => a + (b || 0),
                                        0,
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>
                {/each}
            </div>

            <!-- Pending Bookings list -->
            <div class="mt-6 bg-slate-50 p-4 rounded-xl">
                <div class="flex items-center justify-between mb-4">
                    <h3 class="text-lg font-semibold text-slate-700">
                        Bookings Pending Verification
                    </h3>
                    <div class="text-sm text-slate-500">
                        Approve / Reject per booking below
                    </div>
                </div>

                {#if error}
                    <div class="text-red-600 mb-3">Error: {error}</div>
                {/if}

                <div class="mb-3">
                    <input
                        placeholder="Search by ID, name, or type"
                        class="w-full rounded-md border p-2"
                    />
                </div>

                <div class="overflow-x-auto rounded-lg">
                    <table class="min-w-full bg-white">
                        <thead>
                            <tr
                                class="text-left text-xs uppercase text-slate-500"
                            >
                                <th class="p-3">Booking ID</th>
                                <th class="p-3">Type</th>
                                <th class="p-3">Devotee Name</th>
                                <th class="p-3">Date</th>
                                <th class="p-3">Status</th>
                                <th class="p-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#if loading && bookings.length === 0}
                                <tr
                                    ><td colspan="6" class="p-4 text-slate-500"
                                        >Loading bookings…</td
                                    ></tr
                                >
                            {:else if bookings.length === 0}
                                <tr
                                    ><td colspan="6" class="p-4 text-slate-500"
                                        >No bookings found for the current
                                        filters.</td
                                    ></tr
                                >
                            {:else}
                                {#each bookings as b (b.name)}
                                    <tr class="border-t">
                                        <td class="p-3 font-medium">{b.name}</td
                                        >
                                        <td class="p-3 text-sm text-slate-600"
                                            >{b.appointment_type}</td
                                        >
                                        <td class="p-3"
                                            >{b.primary_devoteee_name}</td
                                        >
                                        <td class="p-3 text-sm text-slate-500"
                                            >{b.appointment_date}</td
                                        >
                                        <td class="p-3"
                                            ><Badge
                                                color={badgeClass(
                                                    b.workflow_state,
                                                )}>{b.workflow_state}</Badge
                                            ></td
                                        >
                                        <td class="p-3">
                                            <div class="flex gap-2">
                                                <Button
                                                    color="light"
                                                    size="xs"
                                                    onclick={() => openModal(b)}
                                                    >Open</Button
                                                >

                                                {#if b.workflow_state === "Pending"}
                                                    <Button
                                                        color="success"
                                                        class="cursor-pointer"
                                                        size="xs"
                                                        onclick={async () => {
                                                            // quick approve single booking via helper
                                                            if (!b.name) return;
                                                            await approveSingle(
                                                                b.name,
                                                            );
                                                        }}>Approve</Button
                                                    >

                                                    <Button
                                                        color="failure"
                                                        class="cursor-pointer"
                                                        size="xs"
                                                        onclick={async () => {
                                                            // quick reject single booking via helper
                                                            if (!b.name) return;
                                                            await rejectSingle(
                                                                b.name,
                                                            );
                                                        }}>Reject</Button
                                                    >
                                                {/if}
                                            </div>
                                        </td>
                                    </tr>
                                {/each}
                            {/if}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>
</div>

{#if show && selectedId}
    <ShowAppointment
        rejectCall={reject_appointment}
        approveCall={approve_appointment}
        appointmentId={selectedId}
        on:close={handleModalClose}
        fetchAppointmentCall={get_appointment}
    />
{/if}

<style>
    /* small layout tweaks to match the screenshot's look */
    :global(.card) {
        border-radius: 12px;
    }
</style>
