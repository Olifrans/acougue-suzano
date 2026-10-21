/**
 * Script Principal - Açougue & CIA
 * Funcionalidades: Dark Mode, UTM Tracking, Formulário Inteligente, Cookie Consent, Accordion
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // ==========================================
    // 1. DARK MODE (LocalStorage)
    // ==========================================
    const themeToggle = document.getElementById('theme-toggle');
    const currentTheme = localStorage.getItem('theme') || 'light';
    
    if (currentTheme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.textContent = '☀️';
    }

    themeToggle.addEventListener('click', () => {
        const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
        const newTheme = isDark ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        themeToggle.textContent = isDark ? '🌙' : '☀️';
        trackEvent('theme_toggled', { theme: newTheme });
    });

    // ==========================================
    // 2. UTM TRACKING & WHATSAPP DINÂMICO
    // ==========================================
    const urlParams = new URLSearchParams(window.location.search);
    const utmData = {};
    
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'].forEach(param => {
        if (urlParams.has(param)) utmData[param] = urlParams.get(param);
    });

    if (Object.keys(utmData).length > 0) {
        localStorage.setItem('utm_data', JSON.stringify(utmData));
    }

    function getWhatsAppLink(customMessage = '') {
        const phone = '5511939592955';
        const storedUtm = JSON.parse(localStorage.getItem('utm_data') || '{}');
        let sourceText = storedUtm.utm_source ? storedUtm.utm_source : "site";
        
        let baseMessage = customMessage || `Olá, Francisco! Vim pelo ${sourceText} e gostaria de fazer um pedido no Açougue & CIA.`;
        return `https://wa.me/${phone}?text=${encodeURIComponent(baseMessage)}`;
    }

    // Atualiza TODOS os botões de WhatsApp (incluindo o flutuante e a sticky bar)
    const waButtons = document.querySelectorAll('a[href*="wa.me"]');
    waButtons.forEach(btn => {
        if (!btn.href.includes('text=')) {
            btn.href = getWhatsAppLink();
        }
    });

    // ==========================================
    // 3. FORMULÁRIO INTELIGENTE (Sem Backend)
    // ==========================================
    const form = document.getElementById('smart-form');
    const modal = document.getElementById('success-modal');
    const closeModal = document.getElementById('close-modal');

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const phone = document.getElementById('phone').value;
        const message = document.getElementById('message').value;
        const storedUtm = JSON.parse(localStorage.getItem('utm_data') || '{}');
        const source = storedUtm.utm_source ? ` (Origem: ${storedUtm.utm_source})` : '';
        
        const finalMessage = `*Novo Pedido pelo Site* 🥩\n\n👤 *Nome:* ${name}\n📱 *Telefone:* ${phone}\n📝 *Pedido:* ${message}\n🔗 *Origem:* Site${source}`;
        
        modal.classList.remove('hidden');
        trackEvent('form_submitted', { action: 'whatsapp_redirect' });
        
        setTimeout(() => {
            window.open(getWhatsAppLink(finalMessage), '_blank');
            form.reset();
        }, 1500);
    });

    closeModal.addEventListener('click', () => modal.classList.add('hidden'));

    // ==========================================
    // 4. COOKIE CONSENT (LGPD) & TRACKING
    // ==========================================
    const cookieBanner = document.getElementById('cookie-banner');
    const acceptCookiesBtn = document.getElementById('accept-cookies');
    
    if (!localStorage.getItem('cookies_accepted')) {
        setTimeout(() => cookieBanner.classList.remove('hidden'), 1000);
    }

    acceptCookiesBtn.addEventListener('click', () => {
        localStorage.setItem('cookies_accepted', 'true');
        cookieBanner.classList.add('hidden');
        trackEvent('cookies_accepted', {});
    });

    window.trackEvent = function(eventName, parameters) {
        if (localStorage.getItem('cookies_accepted') === 'true') {
            console.log(`[TRACKING] Event: ${eventName}`, parameters);
            if (typeof fbq !== 'undefined') fbq('trackCustom', eventName, parameters);
            if (typeof gtag !== 'undefined') gtag('event', eventName, parameters);
        }
    };

    // ==========================================
    // 5. UI INTERACTIONS
    // ==========================================
    const header = document.getElementById('main-header');
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 50);
    });

    document.querySelectorAll('.accordion-header').forEach(headerBtn => {
        headerBtn.addEventListener('click', () => {
            const item = headerBtn.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.accordion-item').forEach(i => i.classList.remove('active'));
            if (!isActive) {
                item.classList.add('active');
                trackEvent('faq_opened', { question: headerBtn.textContent });
            }
        });
    });
});