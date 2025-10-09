<script lang="ts">
    import { goto } from "$app/navigation";
    import { get_self_profile, update_profile } from "@src/helper_approver.js";
    import {
        Card,
        Avatar,
        Badge,
        Button,
        Input,
        Label,
        Select,
        Textarea,
    } from "flowbite-svelte";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    let profle_data: any = null;

    let name = "";
    let gender = "";
    let dob = "";
    let address = "";
    let aadhar = "";

    let touched = { name: false, gender: false, dob: false };

    let loading = false;
    let submitted = false;

    async function handleSubmit(e) {
        e.preventDefault();
        loading = true;

        const info = {
            approver_name: name.trim(),
            gender,
            dob,
            address: address.trim(),
            aadhar: aadhar.trim(),
        };

        const json = await update_profile(info);

        toast(json?.message || "Profile saved.");
        submitted = true;
        loading = false;
    }

    onMount(async () => {
        profle_data = await get_self_profile();

        name = profle_data?.approver_name ?? "";
        gender = profle_data?.gender ?? "";
        dob = profle_data?.dob ?? "";
        address = profle_data?.address ?? "";
        aadhar = profle_data?.aadhar ?? "";
    });
</script>

<div class="min-h-screen bg-gray-50 flex items-center justify-center p-6">
    {#if submitted}
        <Card class="w-full max-w-2xl p-10">
            <div class="flex items-center gap-4">
                <div class="flex-shrink-0">
                    <Avatar
                        size="xl"
                        stacked={false}
                        rounded={true}
                        src={profle_data?.avatar || undefined}
                        alt="Profile avatar"
                    />
                </div>
                <div class="flex-1">
                    <h3 class="text-2xl font-semibold">Profile updated</h3>
                    <p class="text-sm text-gray-600 mt-1">
                        Your profile details have been saved successfully.
                    </p>
                </div>
            </div>

            <div class="mt-6 flex gap-3 justify-end">
                <Button onclick={() => goto("/dashboard")} pill>
                    Go to Dashboard
                </Button>
            </div>
        </Card>
    {:else}
        <Card class="w-full max-w-4xl p-10">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <aside
                    class="md:col-span-1 flex flex-col items-center text-center p-4"
                >
                    <Avatar
                        size="2xl"
                        rounded={true}
                        src={profle_data?.avatar || undefined}
                        alt="User avatar"
                    />
                    <h2 class="mt-4 text-xl font-semibold">
                        Update Your Profile
                    </h2>
                    <p class="mt-2 text-sm text-gray-600">
                        A few details to complete your approver account.
                    </p>
                    <Badge class="mt-4" color="info">Approver</Badge>
                </aside>

                <section class="md:col-span-2">
                    <form
                        on:submit|preventDefault={handleSubmit}
                        novalidate
                        class="space-y-5"
                    >
                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label for="name">Full name</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder="John Doe"
                                    bind:value={name}
                                    on:blur={() => (touched.name = true)}
                                    aria-required="false"
                                    class="mt-1"
                                />
                            </div>

                            <div>
                                <Label for="gender">Gender</Label>
                                <Select
                                    id="gender"
                                    bind:value={gender}
                                    on:blur={() => (touched.gender = true)}
                                    class="mt-1"
                                >
                                    <option value="" disabled selected
                                        >Select Gender</option
                                    >
                                    <option value="female">Female</option>
                                    <option value="male">Male</option>
                                    <option value="non-binary"
                                        >Non-binary</option
                                    >
                                    <option value="prefer-not-to-say"
                                        >Prefer not to say</option
                                    >
                                </Select>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <Label for="dob">Date of birth</Label>
                                <Input
                                    id="dob"
                                    type="date"
                                    bind:value={dob}
                                    class="mt-1"
                                />
                            </div>

                            <div>
                                <Label for="aadhar">Aadhar (optional)</Label>
                                <Input
                                    id="aadhar"
                                    type="text"
                                    placeholder="1234 5678 9012"
                                    bind:value={aadhar}
                                    inputmode="numeric"
                                    maxlength="20"
                                    aria-label="Aadhar number"
                                    class="mt-1"
                                />
                            </div>
                        </div>

                        <div>
                            <Label for="address">Address</Label>
                            <Textarea
                                id="address"
                                rows="3"
                                placeholder="123 Main St, Anytown"
                                bind:value={address}
                                class="mt-1"
                            />
                        </div>

                        <div class="flex items-center justify-between gap-4">
                            <div class="text-sm text-gray-500">
                                <span
                                    >Fields can be updated later from your
                                    profile settings.</span
                                >
                            </div>

                            <div class="flex items-center gap-3">
                                <Button
                                    type="button"
                                    outline
                                    on:click={() => {
                                        name = profle_data?.approver_name ?? "";
                                        gender = profle_data?.gender ?? "";
                                        dob = profle_data?.dob ?? "";
                                        address = profle_data?.address ?? "";
                                        aadhar = profle_data?.aadhar ?? "";
                                    }}
                                >
                                    Reset
                                </Button>

                                <Button type="submit" disabled={loading} pill>
                                    {#if loading}
                                        <svg
                                            class="animate-spin h-4 w-4 mr-2"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            aria-hidden="true"
                                        >
                                            <circle
                                                class="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                stroke-width="4"
                                            ></circle>
                                            <path
                                                class="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                            ></path>
                                        </svg>
                                        Saving…
                                    {:else}
                                        Update Profile
                                    {/if}
                                </Button>
                            </div>
                        </div>
                    </form>
                </section>
            </div>
        </Card>
    {/if}
</div>

<style>
    .heading {
        font-size: 1.25rem;
        font-weight: 600;
    }
    .copy {
        color: #6b7280;
        margin-top: 0.25rem;
    }
    .btn.primary {
        /* keep existing style hook if your project uses it */
    }
    @media (min-width: 768px) {
        .flowbite-card {
            padding: 1.5rem;
        }
    }
</style>
