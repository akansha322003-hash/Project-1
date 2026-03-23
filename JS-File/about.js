 
    // Navbar scroll
    const navbar = document.getElementById('navbar');
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 10);
    });

    // Mobile menu
    function toggleMenu() {
      document.getElementById('hamburger').classList.toggle('open');
      document.getElementById('mobileMenu').classList.toggle('open');
    }
    document.querySelectorAll('.mobile-menu a').forEach(a => {
      a.addEventListener('click', () => {
        document.getElementById('hamburger').classList.remove('open');
        document.getElementById('mobileMenu').classList.remove('open');
      });
    });

    // Scroll reveal
    const els = document.querySelectorAll('.reveal, .reveal-right, .reveal-left');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e, i) => {
        if (e.isIntersecting) {
          setTimeout(() => e.target.classList.add('v'), i * 100);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach(el => obs.observe(el));
