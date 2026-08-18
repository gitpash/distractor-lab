<div class="crt-overlay">
    <div class="scanlines"></div>
    <div class="vignette"></div>
</div>

<style>
    .crt-overlay {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 5;
    }
    .scanlines {
        position: absolute;
        inset: 0;
        background: repeating-linear-gradient(
            0deg,
            rgba(0, 0, 0, 0.2) 0px,
            rgba(0, 0, 0, 0.2) 1px,
            transparent 1px,
            transparent 3px
        );
        mix-blend-mode: multiply;
    }
    .vignette {
        position: absolute;
        inset: 0;
        background: radial-gradient(
            ellipse at center,
            transparent 50%,
            rgba(0, 0, 0, 0.4) 100%
        );
    }
</style>
