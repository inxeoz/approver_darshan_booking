<script>
    // No script needed for this static background
</script>

<style>
    :global(html, body, #svelte) {
        margin: 0;
        height: 100%;
        width: 100%;
    }
    .background {
        position: fixed;
        top: 0;
        left: 0;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
        z-index: -1;
    }

    .centered-text {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-family: 'Georgia', serif;
        font-size: 4rem;
        color: #7a5c2e; /* warm dark brown */
        user-select: none;
        pointer-events: none;
    }
</style>

<div class="background" aria-hidden="true">
    <svg
            width="100%"
            height="100%"
            preserveAspectRatio="xMidYMid slice"
            xmlns="http://www.w3.org/2000/svg"
            role="img"
    >
        <defs>
            <filter id="noise" x="0" y="0" width="100%" height="100%">
                <feTurbulence
                        type="fractalNoise"
                        baseFrequency="0.8"
                        numOctaves="4"
                        stitchTiles="stitch"
                        result="turbulence"
                />
                <feColorMatrix
                        in="turbulence"
                        type="saturate"
                        values="0"
                        result="desaturatedNoise"
                />
                <feComponentTransfer in="desaturatedNoise" result="noiseAlpha">
                    <feFuncA type="table" tableValues="0 0.2 0.8 1" />
                </feComponentTransfer>
                <feComposite in="noiseAlpha" in2="SourceGraphic" operator="over" />
            </filter>
        </defs>

        <rect width="100%" height="100%" fill="#edf6f9" />
        <rect
                width="100%"
                height="100%"
                filter="url(#noise)"
                opacity="0.15"
        />
    </svg>
</div>


<div class="centered-text" aria-label="Warm Welcome">
    महाकाल दर्शन
</div>