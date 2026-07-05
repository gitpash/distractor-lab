<script>
    let { children, params } = $props();
</script>

<div id="topBar">
    <div class="mode-badge" id="modeBadge">{params.game}</div>
    <div class="progress-track">
        <div class="progress-fill" id="progressFill"></div>
    </div>
    <div class="trial-counter" id="trialCounter">0/50</div>
</div>
{@render children()}

<style>
    #topBar {
        width: 100%;
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 8px 0 8px;
    }
    .mode-badge {
        background: var(--accent-dim);
        color: #fff;
        padding: 4px 12px;
        border-radius: 20px;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
    }
    .progress-track {
        flex: 1;
        height: 6px;
        background: var(--bg-tertiary);
        border-radius: 3px;
        overflow: hidden;
    }
    .progress-fill {
        height: 100%;
        background: var(--accent);
        border-radius: 3px;
        transition: width 0.2s;
    }
    .trial-counter {
        font-size: 12px;
        color: var(--text-muted);
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
    }
</style>
