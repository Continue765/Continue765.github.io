// Stack already supplies the copy button; add a small language label.
window.addEventListener('load', () => {
    document.querySelectorAll<HTMLElement>('.article-content div.highlight').forEach(highlight => {
        if (highlight.querySelector('.languageCodeButton')) return;

        const codeBlock = highlight.querySelector<HTMLElement>('code[data-lang]');
        const language = codeBlock?.dataset.lang;
        if (!language) return;

        const languageButton = document.createElement('span');
        languageButton.className = 'languageCodeButton';
        languageButton.textContent = language.toUpperCase();
        highlight.appendChild(languageButton);
    });
});
