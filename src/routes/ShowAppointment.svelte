<script lang="ts">
    import { onMount, onDestroy, createEventDispatcher, tick } from "svelte";
    import { Button, Modal, Badge } from "flowbite-svelte";
    import { formatDateTime } from "@src/utils.js";

    let workflow_state = "Demo";
    let user_type: string;

    export let appointmentId: string;

    export let fetchAppointmentCall: Function;
    export let approveCall; // this will receive the function
    export let rejectCall; // this will receive the function

    const dispatch = createEventDispatcher();

    let loading = false;
    let error: string | null = null;
    let data: any = null;
    let showRaw = false;
    // local modal open — used for Flowbite's bind:open (triggers modal open/close)
    let open = true;

    async function fetchAppointment() {
        if (!appointmentId) {
            error = "No appointment id provided.";
            return;
        }
        loading = true;
        error = null;
        try {
            const payload = await fetchAppointmentCall(appointmentId);
            data = payload?.message ?? payload;
            workflow_state = data.workflow_state;
        } catch (err: any) {
            error = err?.message ?? String(err);
        } finally {
            loading = false;
        }
    }

    // Prevent recursion: use handleClose everywhere
    async function handleClose() {
        // start modal close animation by toggling bound open
        open = false;

        // Wait a tick for DOM/Flowbite to start close animation; small delay helps animation finish
        // If you prefer immediate unmount, dispatch immediately.
        await tick();
        // allow animation to run — adjust 200ms if needed to match Flowbite animation length
        setTimeout(() => {
            dispatch("close");
        }, 200);
    }

    function onKeydown(e: KeyboardEvent) {
        if (e.key === "Escape") handleClose();
    }

    onMount(() => {
        user_type = localStorage.getItem("Muser_type") || "";

        console.log("usudu", user_type);
        fetchAppointment();
        window.addEventListener("keydown", onKeydown);
    });

    onDestroy(() => {
        window.removeEventListener("keydown", onKeydown);
    });

    // safe stringify to avoid circular JSON crashes
    function safeStringify(obj: any, space = 2) {
        const seen = new WeakSet();
        return JSON.stringify(
            obj,
            function (key, value) {
                if (typeof value === "object" && value !== null) {
                    if (seen.has(value)) return "[Circular]";
                    seen.add(value);
                }
                return value;
            },
            space,
        );
    }
</script>

<Modal bind:open title="Appointment Details" size="lg" onclose={handleClose}>
    {#if loading}
        <div class="text-center text-gray-500 py-6">Loading appointment…</div>
    {:else if error}
        <div class="p-3 bg-red-50 text-red-600 rounded-md">Error: {error}</div>
    {:else if data}
        <div class="grid grid-cols-2 gap-3 mb-4">
            <div>
                <strong>Appointment ID:</strong>
                {data.name ?? data.appointment_id ?? "—"}
            </div>
            <div>
                <strong>Status:</strong>

                <Badge
                    color={data.workflow_state === "Approved"
                        ? "green"
                        : data.workflow_state === "Pending"
                          ? "orange"
                          : "red"}
                >
                    {data.workflow_state ?? data.status ?? "—"}
                </Badge>
            </div>
            <div><strong>Type:</strong> {data.appointment_type ?? "—"}</div>
            <div>
                <strong>Date:</strong>
                {data.appointment_date}
            </div>

            <div>
                <strong>Time:</strong>
                {data.slot_start_time} to {data.slot_end_time}
            </div>

            {#if data.with_protocol}
                <div>
                    <strong>With Protocol:</strong>
                    {data.with_protocol ? "Yes" : "No"}
                </div>
                <div><strong>Protocol Rank:</strong> {data.protocol_rank}</div>
            {/if}

            {#if data.government_authority_letter}
                <div class="col-span-2">
                    <strong>Authority Letter:</strong>
                    {data.government_authority_letter}
                </div>
            {/if}
            {#if data.devoteee_name}
                <div class="col-span-2">
                    <strong>Devoteee Name:</strong>
                    {data.devoteee_name}
                </div>
            {/if}

            {#if data.group_size}
                <div class="col-span-2">
                    <strong>Group Size:</strong>
                    <Badge color="blue">
                        {data.group_size ?? data.status ?? "—"}
                    </Badge>
                </div>
            {/if}
        </div>

        <div class="mb-3">
            <h3 class="font-semibold mb-1">Companions</h3>
            {#if Array.isArray(data.companions) && data.companions.length > 0}
                <ul class="divide-y divide-gray-200 border rounded-md">
                    {#each data.companions as c}
                        <li class="flex justify-between items-center p-2">
                            <div class="left_column w-1/3">
                                <div class="font-semibold text-gray-800">
                                    {c.companion_name ?? "Unknown"}
                                </div>
                                <div class="text-sm text-gray-500">
                                    {c.companion_gender ?? ""}
                                </div>
                            </div>
                            <div class="middle_column w-1/6">
                                <div class="text-gray-800 font-medium">
                                    Age {c.companion_age ?? "—"}
                                </div>
                            </div>
                            <div class="right_column w-1/3">
                                phone :
                                <Badge color="green">
                                    {c.companion_phone ?? "—"}
                                </Badge>
                            </div>
                        </li>
                    {/each}
                </ul>
            {:else}
                <div class="text-gray-500 text-sm italic p-2">
                    No companions listed.
                </div>
            {/if}
        </div>

        <div>
            <Button
                color="light"
                size="sm"
                onclick={() => (showRaw = !showRaw)}
            >
                {showRaw ? "Hide JSON" : "Show raw JSON"}
            </Button>
            {#if showRaw}
                <pre
                    class="bg-gray-900 text-gray-100 mt-2 p-2 rounded overflow-auto max-h-60 text-sm">
{safeStringify(data, 2)}</pre>
            {/if}
        </div>
    {:else}
        <div class="text-center text-gray-500 py-6">No data available.</div>
    {/if}

    {#snippet footer()}
        {#if workflow_state === "Pending" && user_type === "Approver"}
            <div class="flex justify-end items-center w-full gap-8">
                <Button
                    color="primary"
                    pill
                    onclick={async () => {
                        rejectCall(appointmentId);
                        await fetchAppointment();
                    }}>Reject</Button
                >
                <Button
                    color="green"
                    pill
                    onclick={async () => {
                        approveCall(appointmentId);
                        await fetchAppointment();
                    }}>Approve</Button
                >
            </div>
        {/if}
    {/snippet}
</Modal>
