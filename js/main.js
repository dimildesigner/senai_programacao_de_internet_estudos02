/**
 * Adote Patinhas — main.js
 * Funcionalidades:
 *  1. Atualização do ano no footer
 *  2. Navegação mobile (hamburguer)
 *  3. Animações com IntersectionObserver (cards + stats)
 *  4. Contadores numéricos animados
 *  5. Botão "Voltar ao Topo"
 *  6. Fechar menu ao clicar em link
 *  7. Fechar menu ao clicar fora
 */

/* ------------------------------------------------------------------
   1. ANO AUTOMÁTICO NO FOOTER
------------------------------------------------------------------ */
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();


/* ------------------------------------------------------------------
   2. NAVEGAÇÃO MOBILE — HAMBURGUER
------------------------------------------------------------------ */
const navToggle = document.getElementById('navToggle');
const mainNav   = document.getElementById('main-nav');

if (navToggle && mainNav) {

  navToggle.addEventListener('click', () => {
    const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
    navToggle.setAttribute('aria-expanded', String(!isOpen));
    mainNav.classList.toggle('is-open', !isOpen);
  });

  /* Fechar ao clicar em um link */
  mainNav.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
    });
  });

  /* Fechar ao clicar fora */
  document.addEventListener('click', (e) => {
    const isInsideHeader = e.target.closest('.site-header');
    if (!isInsideHeader && mainNav.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
    }
  });

  /* Fechar com ESC */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && mainNav.classList.contains('is-open')) {
      navToggle.setAttribute('aria-expanded', 'false');
      mainNav.classList.remove('is-open');
      navToggle.focus();
    }
  });
}


/* ------------------------------------------------------------------
   3. INTERSECTIONOBSERVER — revelar elementos ao rolar
------------------------------------------------------------------ */
/**
 * Observa elementos e adiciona a classe `is-visible`
 * quando entram na viewport.
 */
function createRevealObserver(selector, options = {}) {
  const defaultOpts = {
    root: null,
    rootMargin: '0px 0px -60px 0px',
    threshold: 0.15,
  };
  const opts = { ...defaultOpts, ...options };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // anima só uma vez
      }
    });
  }, opts);

  document.querySelectorAll(selector).forEach(el => observer.observe(el));
}

createRevealObserver('.benefit-card');
createRevealObserver('.stat-item');
createRevealObserver('.reveal');        /* usado em sobre.html, adote.html, etc. */


/* ------------------------------------------------------------------
   4. CONTADORES ANIMADOS
------------------------------------------------------------------ */
/**
 * Anima um número de 0 até `target` em `duration` ms.
 * Usa requestAnimationFrame para fluidez.
 */
function animateCounter(el, target, duration = 2200) {
  const start     = performance.now();
  const startVal  = 0;

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function tick(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const value    = Math.round(easeOutQuart(progress) * (target - startVal) + startVal);

    el.textContent = value.toLocaleString('pt-BR');

    if (progress < 1) {
      requestAnimationFrame(tick);
    } else {
      el.textContent = target.toLocaleString('pt-BR');
    }
  }

  requestAnimationFrame(tick);
}

/* Dispara o contador quando o elemento fica visível */
const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el     = entry.target;
      const target = parseInt(el.dataset.target, 10);
      animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-number[data-target]').forEach(el => {
  counterObserver.observe(el);
});


/* ------------------------------------------------------------------
   5. BOTÃO VOLTAR AO TOPO
------------------------------------------------------------------ */
const backToTop = document.getElementById('backToTop');

if (backToTop) {
  const SCROLL_THRESHOLD = 400;

  const scrollHandler = () => {
    const scrolled = window.scrollY > SCROLL_THRESHOLD;
    backToTop.hidden = !scrolled;
    // Dá tempo ao browser de processar o `hidden = false` antes de animar
    requestAnimationFrame(() => {
      backToTop.classList.toggle('is-visible', scrolled);
    });
  };

  window.addEventListener('scroll', scrollHandler, { passive: true });

  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Devolver foco para o topo da página (acessibilidade)
    document.querySelector('.skip-link')?.focus({ preventScroll: true });
  });
}


/* ------------------------------------------------------------------
   6. HEADER — sombra ao rolar
------------------------------------------------------------------ */
const siteHeader = document.querySelector('.site-header');

if (siteHeader) {
  const SHADOW_THRESHOLD = 10;
  window.addEventListener('scroll', () => {
    siteHeader.style.boxShadow = window.scrollY > SHADOW_THRESHOLD
      ? '0 4px 20px rgba(0,0,0,.12)'
      : '0 2px 8px rgba(0,0,0,.08)';
  }, { passive: true });
}

/* ------------------------------------------------------------------
   7. FORMULÁRIO DE CONTATO — Validação + Envio assíncrono
   ------------------------------------------------------------------
   INTEGRAÇÃO DE BACK-END:
   ─ A) PHP próprio → ajuste FORM_ENDPOINT para seu arquivo .php
   ─ B) Formspree   → "https://formspree.io/f/SEU_ID" (sem back-end)
   ─ C) Netlify     → adicione data-netlify="true" no <form> e use "/"
   ─ D) EmailJS     → substitua a chamada fetch() por emailjs.send()
------------------------------------------------------------------ */

const FORM_ENDPOINT = '/api/contact.php'; // ← altere conforme seu back-end

const contactForm = document.getElementById('contactForm');

if (contactForm) {

  /* ── Regras de validação por campo ── */
  const validations = {
    nome:       { required: true, minLength: 2,  label: 'Nome' },
    sobrenome:  { required: true, minLength: 2,  label: 'Sobrenome' },
    email:      { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'E-mail' },
    assunto:    { required: true, label: 'Assunto' },
    mensagem:   { required: true, minLength: 10, label: 'Mensagem' },
    lgpd:       { required: true, label: 'Política de Privacidade' },
  };

  /* ── Valida um campo individualmente ── */
  function validateField(name, value, checked) {
    const rule = validations[name];
    if (!rule) return '';

    if (rule.required) {
      if (name === 'lgpd' && !checked) return 'Você precisa aceitar a Política de Privacidade.';
      if (!value || value.trim() === '' || value === 'null') return `${rule.label} é obrigatório.`;
    }
    if (rule.minLength && value.trim().length < rule.minLength) {
      return `${rule.label} deve ter no mínimo ${rule.minLength} caracteres.`;
    }
    if (rule.pattern && !rule.pattern.test(value.trim())) {
      return 'Informe um e-mail válido.';
    }
    return '';
  }

  /* ── Exibe ou limpa erro de um campo ── */
  function setFieldState(input, errorMsg) {
    const errorEl = document.getElementById(`${input.id}-error`);
    if (errorMsg) {
      input.classList.add('has-error');
      input.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = errorMsg;
    } else {
      input.classList.remove('has-error');
      input.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  /* ── Valida formulário completo; retorna true se tudo OK ── */
  function validateForm() {
    let isValid = true;
    const data  = new FormData(contactForm);

    Object.keys(validations).forEach(name => {
      const input   = contactForm.elements[name];
      if (!input) return;
      const value   = input.type === 'checkbox' ? '' : (data.get(name) || '');
      const checked = input.type === 'checkbox' ? input.checked : true;
      const err     = validateField(name, value, checked);
      setFieldState(input, err);
      if (err) isValid = false;
    });

    return isValid;
  }

  /* ── Validação em tempo real ao sair do campo ── */
  contactForm.addEventListener('focusout', (e) => {
    const input = e.target;
    if (!input.name || !validations[input.name]) return;
    const err = validateField(
      input.name,
      input.type === 'checkbox' ? '' : input.value,
      input.checked
    );
    setFieldState(input, err);
  });

  /* ── Contador de caracteres na textarea ── */
  const textarea  = contactForm.querySelector('#mensagem');
  const charCount = contactForm.querySelector('.char-count');

  if (textarea && charCount) {
    textarea.addEventListener('input', () => {
      const len = textarea.value.length;
      charCount.textContent = `${len} / 1000`;
      charCount.style.color = len > 900 ? '#e53e3e' : 'var(--clr-text-muted)';
    });
  }

  /* ── Status de envio ── */
  function showStatus(type, message) {
    const el = document.getElementById('form-status');
    if (!el) return;
    el.className = `form-status form-status--${type}`;
    el.textContent = message;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  function hideStatus() {
    const el = document.getElementById('form-status');
    if (el) { el.hidden = true; el.textContent = ''; }
  }

  /* ── Estado do botão enviar ── */
  const submitBtn = document.getElementById('botao_enviar');

  function setLoading(loading) {
    if (!submitBtn) return;
    submitBtn.disabled = loading;
    submitBtn.classList.toggle('is-loading', loading);
    submitBtn.setAttribute('aria-busy', String(loading));
  }

  /* ── Envio do formulário ── */
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideStatus();

    if (!validateForm()) {
      /* Foca no primeiro campo com erro */
      const firstError = contactForm.querySelector('.has-error');
      if (firstError) firstError.focus();
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(contactForm);
      const payload  = Object.fromEntries(formData.entries());

      const res = await fetch(FORM_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      /* Sucesso */
      showStatus('success', '✅ Mensagem enviada com sucesso! Responderemos em até 2 dias úteis.');
      contactForm.reset();

      /* Limpa estados visuais de validação */
      contactForm.querySelectorAll('.form-input').forEach(el => {
        el.classList.remove('is-valid', 'has-error');
      });
      if (charCount) charCount.textContent = '0 / 1000';

    } catch (err) {
      console.error('Erro ao enviar formulário:', err);
      showStatus(
        'error',
        '❌ Não foi possível enviar sua mensagem. Tente novamente ou entre em contato pelo WhatsApp.'
      );
    } finally {
      setLoading(false);
    }
  });
}


/* ------------------------------------------------------------------
   8. FAQ ACCORDION (página de contato)
------------------------------------------------------------------ */
document.querySelectorAll('.faq-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.getAttribute('aria-expanded') === 'true';
    const bodyId = btn.getAttribute('aria-controls');
    const body   = document.getElementById(bodyId);

    /* Fecha todos os outros itens do mesmo grupo */
    const group = btn.closest('.faq-list');
    if (group) {
      group.querySelectorAll('.faq-btn').forEach(other => {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherId = other.getAttribute('aria-controls');
          const otherBody = document.getElementById(otherId);
          if (otherBody) otherBody.hidden = true;
        }
      });
    }

    /* Alterna o item clicado */
    btn.setAttribute('aria-expanded', String(!isOpen));
    if (body) body.hidden = isOpen;
  });
});


/* ------------------------------------------------------------------
   9. FORMULÁRIO DE INTERESSE EM ADOÇÃO
   Endpoint: /api/adopt.php  (ou Formspree, Netlify etc — ver seção 7)
------------------------------------------------------------------ */

const ADOPT_ENDPOINT = '/api/adopt.php'; // ← altere conforme seu back-end

const adoptForm = document.getElementById('adoptForm');

if (adoptForm) {

  /* Regras de validação específicas deste formulário */
  const adoptValidations = {
    nome:       { required: true, minLength: 2,  label: 'Nome' },
    sobrenome:  { required: true, minLength: 2,  label: 'Sobrenome' },
    email:      { required: true, pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, label: 'E-mail' },
    telefone:   { required: true, minLength: 8,  label: 'WhatsApp' },
    cidade:     { required: true, minLength: 3,  label: 'Cidade / Estado' },
    moradia:    { required: true, label: 'Tipo de moradia' },
    especie:    { required: true, label: 'Tipo de pet' },
    mensagem:   { required: true, minLength: 15, label: 'Motivação para adotar' },
    lgpd:       { required: true, label: 'Política de Privacidade' },
  };

  /* Valida campo individual */
  function validateAdoptField(name, value, checked) {
    const rule = adoptValidations[name];
    if (!rule) return '';

    if (rule.required) {
      if (name === 'lgpd' && !checked) return 'Você precisa aceitar a Política de Privacidade.';
      if (!value || value.trim() === '' || value === 'null') return `${rule.label} é obrigatório.`;
    }
    if (rule.minLength && value.trim().length < rule.minLength) {
      return `${rule.label} deve ter no mínimo ${rule.minLength} caracteres.`;
    }
    if (rule.pattern && !rule.pattern.test(value.trim())) {
      return 'Informe um e-mail válido.';
    }
    return '';
  }

  /* Exibe / limpa erro de campo */
  function setAdoptFieldState(input, errorMsg) {
    /* IDs dos campos de adoção têm prefixo "adopt-" */
    const errorEl = document.getElementById(`adopt-${input.name}-error`);
    if (errorMsg) {
      input.classList.add('has-error');
      input.classList.remove('is-valid');
      if (errorEl) errorEl.textContent = errorMsg;
    } else {
      input.classList.remove('has-error');
      input.classList.add('is-valid');
      if (errorEl) errorEl.textContent = '';
    }
  }

  /* Valida formulário completo */
  function validateAdoptForm() {
    let isValid = true;
    const data  = new FormData(adoptForm);

    Object.keys(adoptValidations).forEach(name => {
      const input   = adoptForm.elements[name];
      if (!input) return;
      const value   = input.type === 'checkbox' ? '' : (data.get(name) || '');
      const checked = input.type === 'checkbox' ? input.checked : true;
      const err     = validateAdoptField(name, value, checked);
      setAdoptFieldState(input, err);
      if (err) isValid = false;
    });

    return isValid;
  }

  /* Validação em tempo real */
  adoptForm.addEventListener('focusout', (e) => {
    const input = e.target;
    if (!input.name || !adoptValidations[input.name]) return;
    const err = validateAdoptField(
      input.name,
      input.type === 'checkbox' ? '' : input.value,
      input.checked
    );
    setAdoptFieldState(input, err);
  });

  /* Contador textarea */
  const adoptTextarea  = adoptForm.querySelector('#adopt-mensagem');
  const adoptCharCount = adoptForm.querySelector('.adopt-char');

  if (adoptTextarea && adoptCharCount) {
    adoptTextarea.addEventListener('input', () => {
      const len = adoptTextarea.value.length;
      adoptCharCount.textContent = `${len} / 800`;
      adoptCharCount.style.color = len > 720 ? '#e53e3e' : 'var(--clr-text-muted)';
    });
  }

  /* Status */
  function showAdoptStatus(type, message) {
    const el = document.getElementById('adopt-form-status');
    if (!el) return;
    el.className = `form-status form-status--${type}`;
    el.textContent = message;
    el.hidden = false;
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  /* Envio */
  const adoptSubmitBtn = document.getElementById('adopt-submit');

  adoptForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const statusEl = document.getElementById('adopt-form-status');
    if (statusEl) { statusEl.hidden = true; statusEl.textContent = ''; }

    if (!validateAdoptForm()) {
      const firstError = adoptForm.querySelector('.has-error');
      if (firstError) firstError.focus();
      return;
    }

    /* Loading */
    if (adoptSubmitBtn) {
      adoptSubmitBtn.disabled = true;
      adoptSubmitBtn.classList.add('is-loading');
      adoptSubmitBtn.setAttribute('aria-busy', 'true');
    }

    try {
      const payload = Object.fromEntries(new FormData(adoptForm).entries());

      const res = await fetch(ADOPT_ENDPOINT, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      showAdoptStatus(
        'success',
        '🐾 Interesse registrado com sucesso! Nossa equipe entrará em contato em breve.'
      );
      adoptForm.reset();
      adoptForm.querySelectorAll('.form-input').forEach(el => {
        el.classList.remove('is-valid', 'has-error');
      });
      if (adoptCharCount) adoptCharCount.textContent = '0 / 800';

    } catch (err) {
      console.error('Erro ao enviar formulário de adoção:', err);
      showAdoptStatus(
        'error',
        '❌ Não foi possível enviar. Tente novamente ou entre em contato pelo WhatsApp.'
      );
    } finally {
      if (adoptSubmitBtn) {
        adoptSubmitBtn.disabled = false;
        adoptSubmitBtn.classList.remove('is-loading');
        adoptSubmitBtn.setAttribute('aria-busy', 'false');
      }
    }
  });
}
