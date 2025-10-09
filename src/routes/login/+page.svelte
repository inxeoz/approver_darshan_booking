<script lang="ts">
    import { onMount } from "svelte";
    import { goto } from "$app/navigation";
    import { Card, Button, Label, Input } from "flowbite-svelte";
    import { Badge } from "flowbite-svelte";

    import { login_verify } from "@src/helper_approver.js";
    import { toast } from "svelte-sonner";

    // phone as string to allow leading + / 0 etc
    export let phone = 0;
    let password: string = "Mpsedc123";
    let loading: boolean = false;

    async function login(e: SubmitEvent) {
        e?.preventDefault();
        loading = true;

        const json_data = await login_verify(phone, password);

        if (json_data?.full_name) {
            toast.success("Login successful");
            await goto("/dashboard");
        } else {
            // show API message or generic error
            toast.error(json_data || "Login failed");
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 p-4">
    <Card class="w-full max-w-md p-10">
        <form class="space-y-4" on:submit={login} aria-busy={loading}>
            <h2 class="text-xl font-semibold text-gray-800 flex justify-center">
                Login
            </h2>

            <Badge color="indigo">Approver</Badge>

            <div>
                <Label for="phone">Phone</Label>
                <Input
                    id="phone"
                    type="text"
                    bind:value={phone}
                    placeholder="Phone"
                    inputmode="tel"
                    autocomplete="tel"
                />
            </div>

            <div>
                <Label for="temp">Password</Label>
                <Input
                    id="temp"
                    type="text"
                    bind:value={password}
                    placeholder="Enter password"
                    disabled={loading}
                />
            </div>

            <div class="flex items-center justify-center">
                <Button
                    type="submit"
                    disabled={loading}
                    aria-disabled={loading}
                    class="min-lg:w-7xl"
                >
                    {#if loading}Verifying...{:else}Login{/if}
                </Button>
            </div>
        </form>
    </Card>
</div>
