<script lang="ts">
    import { goto } from "$app/navigation";
    import { get_profile, update_profile } from "@src/helper_approver.js";
    import { onMount } from "svelte";
    import { toast } from "svelte-sonner";

    let profle_data: any = null;

    // form model
    let name = "";
    let gender = "";
    let dob = "";
    let address = "";
    let aadhar = "";

    let touched = { name: false, gender: false, dob: false };

    let loading = false;
    let submitted = false;
    let serverError = "";

    const errors = () => {
        const e = {};
        if (!name.trim()) e.name = "Please enter your full name.";
        if (!gender) e.gender = "Please select a gender.";
        if (!dob) e.dob = "Please choose your date of birth.";
        return e;
    };

    async function handleSubmit(e) {
        e.preventDefault();
        touched = { name: true, gender: true, dob: true };
        const eobj = errors();
        if (Object.keys(eobj).length) return;

        loading = true;
        serverError = "";

        // prepare payload (fixed aadhar)
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
    }

    function goToMyBookings() {
        goto("/dashboard/mybooking");
    }

    onMount(async () => {
        try {
            profle_data = await get_profile();

            name = profle_data.approver_name;
            gender = profle_data.gender;

            dob = profle_data.dob;
            address = profle_data.address;
            aadhar = profle_data.aadhar;
        } catch (e) {
            profle_data = "Failed to load profile";
            console.error(e);
        } finally {
            loading = false;
        }
    });
</script>

<div class="page">
    <div class="card" role="region" aria-labelledby="title">
        {#if submitted}
            <div class="submitted">
                <h3>Successfully updated profile details</h3>

                <button
                    pill
                    class="btn primary"
                    on:click={() => goto("/dashboard")}
                >
                    Dashboard
                </button>
            </div>
        {:else}
            <h2 class="heading">Update Your Profile</h2>
            <p class="copy">
                Please provide a few more details to finish your registration.
            </p>

            <form on:submit|preventDefault={handleSubmit} novalidate>
                <!-- Full Name -->
                <label class="label" for="name">Full Name</label>
                <input
                    id="name"
                    class="input"
                    class:invalid={touched.name && errors().name}
                    type="text"
                    placeholder="John Doe"
                    bind:value={name}
                    on:blur={() => (touched.name = true)}
                    aria-invalid={touched.name && errors().name
                        ? "true"
                        : "false"}
                />
                {#if touched.name && errors().name}
                    <div class="error">{errors().name}</div>
                {/if}

                <!-- Gender -->
                <label class="label" for="gender">Gender</label>
                <select
                    id="gender"
                    class="input"
                    class:invalid={touched.gender && errors().gender}
                    bind:value={gender}
                    on:blur={() => (touched.gender = true)}
                    aria-invalid={touched.gender && errors().gender
                        ? "true"
                        : "false"}
                >
                    <option value="" disabled>Select Gender</option>
                    <option value="female">Female</option>
                    <option value="male">Male</option>
                    <option value="non-binary">Non-binary</option>
                    <option value="prefer-not-to-say">Prefer not to say</option>
                </select>
                {#if touched.gender && errors().gender}
                    <div class="error">{errors().gender}</div>
                {/if}

                <!-- Date of Birth -->
                <label class="label" for="dob">Date of Birth</label>

                <input
                    id="dob"
                    class="input"
                    class:invalid={touched.dob && errors().dob}
                    type="date"
                    bind:value={dob}
                    on:blur={() => (touched.dob = true)}
                    aria-invalid={touched.dob && errors().dob
                        ? "true"
                        : "false"}
                />

                {#if touched.dob && errors().dob}
                    <div class="error">{errors().dob}</div>
                {/if}

                <!-- Aadhar -->
                <label class="label" for="aadhar">Aadhar</label>
                <input
                    id="aadhar"
                    class="input"
                    type="text"
                    placeholder="1234 5678 9012"
                    bind:value={aadhar}
                    inputmode="numeric"
                    maxlength="20"
                    aria-label="Aadhar number (optional)"
                />

                <!-- Address -->
                <label class="label" for="address">Address</label>
                <textarea
                    id="address"
                    class="input textarea"
                    placeholder="123 Main St, Anytown"
                    rows="3"
                    bind:value={address}
                ></textarea>

                {#if serverError}
                    <div class="error" role="alert">{serverError}</div>
                {/if}

                <button class="btn primary" type="submit" disabled={loading}>
                    {#if loading}
                        Submitting…
                    {:else}
                        Update Profile
                    {/if}
                </button>
            </form>
        {/if}
    </div>
</div>

<style>
    /* (same CSS you already had—kept for brevity) */
    :global(html, body) {
        height: 100%;
    }
    .page {
        min-height: 100vh;
        background: #f4f6f8;
        display: grid;
        place-items: center;
        padding: 24px;
    }
    .card {
        width: min(640px, 92vw);
        background: #ecf3f2;
        border-radius: 14px;
        box-shadow: 0 10px 28px rgba(16, 24, 40, 0.12);
        padding: 36px 40px 32px;
    }

    .heading {
        text-align: center;
        margin: 18px 0 6px;
        font-size: 20px;
        font-weight: 700;
        color: #111827;
    }
    .copy {
        text-align: center;
        margin: 0 0 14px;
        color: #6b7280;
        font-size: 14px;
    }
    form {
        margin-top: 6px;
    }
    .label {
        display: block;
        margin: 14px 0 6px;
        font-size: 13px;
        color: #4b5563;
    }
    .input {
        width: 100%;
        height: 44px;
        padding: 0 14px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        background: #fff;
        font-size: 14px;
        outline: none;
        transition:
            box-shadow 0.15s,
            border-color 0.15s;
    }
    .textarea {
        height: auto;
        padding: 10px 14px;
        resize: vertical;
    }
    .input:focus {
        border-color: #2151ea;
        box-shadow: 0 0 0 3px rgba(33, 81, 234, 0.15);
    }
    .input.invalid {
        border-color: #dc2626;
    }
    .error {
        margin-top: 6px;
        font-size: 12px;
        color: #b91c1c;
    }
    .btn.primary {
        width: 100%;
        height: 46px;
        margin-top: 18px;
        border: 0;
        border-radius: 10px;
        background: #2151ea;
        color: #fff;
        font-weight: 600;
        font-size: 15px;
        cursor: pointer;
    }
    .btn.primary[disabled] {
        opacity: 0.7;
        cursor: default;
    }
</style>
