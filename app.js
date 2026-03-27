const presetLabels = {
    crossfade: 'Default crossfade',
    slide: 'Slide preset',
    reveal: 'Reveal preset',
    direction: 'Direction-aware preset'
};

const root = document.documentElement;
const presetSelect = document.querySelector('#transition-preset');
const presetLabel = document.querySelector('#transition-label');

function readStoredPreset() {
    try {
        return localStorage.getItem('transition-preset') || 'crossfade';
    } catch {
        return 'crossfade';
    }
}

function writeStoredPreset(value) {
    try {
        localStorage.setItem('transition-preset', value);
    } catch {
        return;
    }
}

function applyPreset(value) {
    const preset = presetLabels[value] ? value : 'crossfade';
    root.dataset.transition = preset;

    if (presetSelect) {
        presetSelect.value = preset;
    }

    if (presetLabel) {
        const supported = CSS.supports('view-transition-name: card-01');
        presetLabel.textContent = supported ? presetLabels[preset] : `${presetLabels[preset]} fallback`;
    }
}

function detectNavigationDirection() {
    const navigationEntry = performance.getEntriesByType('navigation')[0];
    if (navigationEntry && navigationEntry.type === 'back_forward') {
        return 'back';
    }

    try {
        return sessionStorage.getItem('vt-nav-direction') || 'forward';
    } catch {
        return 'forward';
    }
}

function wireDirectionHints() {
    root.dataset.navDirection = detectNavigationDirection();

    document.querySelectorAll('a[href]').forEach((anchor) => {
        anchor.addEventListener('click', () => {
            try {
                const target = new URL(anchor.href, window.location.href);
                if (target.origin === window.location.origin) {
                    sessionStorage.setItem('vt-nav-direction', 'forward');
                }
            } catch {
                return;
            }
        });
    });

    window.addEventListener('popstate', () => {
        root.dataset.navDirection = 'back';
        try {
            sessionStorage.setItem('vt-nav-direction', 'back');
        } catch {
            return;
        }
    });
}

applyPreset(readStoredPreset());
wireDirectionHints();

if (presetSelect) {
    presetSelect.addEventListener('change', (event) => {
        const { value } = event.target;
        writeStoredPreset(value);
        applyPreset(value);
    });
}