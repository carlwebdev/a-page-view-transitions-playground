const presetLabels = {
    crossfade: 'Default crossfade',
    slide: 'Slide preset',
    reveal: 'Reveal preset',
    direction: 'Direction-aware preset'
};

const root = document.documentElement;
const sharedLayoutTemplate = document.createElement('template');
sharedLayoutTemplate.innerHTML = `
    <header>
        <a class="logo" href="index.html">Page View Transitions</a>
        <div class="header-actions">
            <span class="demo-badge" id="transition-label">Default crossfade</span>
            <label class="transition-control" for="transition-preset">
                <span>Preset</span>
                <select id="transition-preset" aria-label="Transition preset">
                    <option value="crossfade">Crossfade</option>
                    <option value="slide">Slide</option>
                    <option value="reveal">Reveal</option>
                    <option value="direction">Direction-aware</option>
                </select>
            </label>
            <a class="button" href="https://github.com/carlwebdev/a-page-view-transitions-playground" target="_blank" rel="noopener noreferrer">GitHub Repo</a>
        </div>
    </header>
    <footer>
        Page View Transitions API Demo &mdash; CSS &amp; HTML only
    </footer>
`;

function getPresetElements() {
    return {
        presetSelect: document.querySelector('#transition-preset'),
        presetLabel: document.querySelector('#transition-label')
    };
}

function mountSharedLayout() {
    const headerSlot = document.querySelector('#site-header');
    const footerSlot = document.querySelector('#site-footer');

    if (!headerSlot || !footerSlot) {
        return;
    }

    const fragment = document.importNode(sharedLayoutTemplate.content, true);
    const [headerNode, footerNode] = fragment.children;

    if (headerNode) {
        headerSlot.replaceWith(headerNode);
    }

    if (footerNode) {
        footerSlot.replaceWith(footerNode);
    }
}

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
    const { presetSelect, presetLabel } = getPresetElements();
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

mountSharedLayout();
applyPreset(readStoredPreset());
wireDirectionHints();

const { presetSelect } = getPresetElements();
if (presetSelect) {
    presetSelect.addEventListener('change', (event) => {
        const { value } = event.target;
        writeStoredPreset(value);
        applyPreset(value);
    });
}