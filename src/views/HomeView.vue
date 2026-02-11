<template>
  <div class="landing-page">
    
    <nav class="navbar">
      <div class="logo">e-Surf</div>
      <div class="nav-links">
        <router-link to="/login" class="nav-item">Accedi</router-link>
        <router-link to="/register" class="nav-btn">Registrati</router-link>
      </div>
    </nav>

    <header class="hero-section">
      <div class="hero-content">
        <h1 class="main-title">Il futuro della tua <span class="highlight">Connessione</span></h1>
        <p class="subtitle">
          Gestisci la tua energia e la tua connettività in un'unica piattaforma intelligente, 
          sicura e veloce. Unisciti a e-Surf oggi stesso.
        </p>
        
        <div class="cta-group">
          <router-link to="/register" class="btn-primary-lg">Inizia Ora</router-link>
          <router-link to="/login" class="btn-secondary-lg">Entra nel Portale</router-link>
        </div>
      </div>

      <div class="hero-decoration">
        <div class="circle circle-1"></div>
        <div class="circle circle-2"></div>
      </div>
    </header>

    <section class="features">
      <div class="feature-card">
        <div class="icon">🚀</div>
        <h3>Veloce</h3>
        <p>Attivazione immediata e gestione in tempo reale dei tuoi servizi.</p>
      </div>
      <div class="feature-card">
        <div class="icon">🔒</div>
        <h3>Sicuro</h3>
        <p>I tuoi dati sono protetti con i più alti standard di sicurezza.</p>
      </div>
      <div class="feature-card">
        <div class="icon">📱</div>
        <h3>Smart</h3>
        <p>Accessibile da ogni dispositivo, ovunque tu sia.</p>
      </div>
    </section>

    <footer class="footer">
      <p>&copy; 2026 e-Surf. Tutti i diritti riservati.</p>
    </footer>

  </div>
</template>

<script setup>
// Non serve logica complessa qui, solo routing tramite router-link
</script>

<style scoped>
/* RESET & LAYOUT */
.landing-page {
  font-family: 'Inter', sans-serif;
  color: #2d3748;
  background-color: #f7fafc;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
}

/* NAVBAR */
.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  background: white;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
}

.logo {
  font-size: 1.5rem;
  font-weight: 800;
  color: #3182ce;
  letter-spacing: -0.5px;
}

.nav-links {
  display: flex;
  gap: 1.5rem;
  align-items: center;
}

.nav-item {
  text-decoration: none;
  color: #4a5568;
  font-weight: 600;
  transition: color 0.2s;
}
.nav-item:hover { color: #3182ce; }

.nav-btn {
  background-color: #3182ce;
  color: white;
  padding: 0.5rem 1.2rem;
  border-radius: 6px;
  text-decoration: none;
  font-weight: 600;
  transition: background 0.2s;
}
.nav-btn:hover { background-color: #2b6cb0; }

/* HERO SECTION */
.hero-section {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 1rem;
  position: relative;
}

.hero-content {
  max-width: 800px;
  z-index: 2;
}

.main-title {
  font-size: 3rem;
  line-height: 1.2;
  margin-bottom: 1.5rem;
  font-weight: 800;
  color: #1a202c;
}

.highlight {
  color: #3182ce;
  background: linear-gradient(120deg, #e0f2ff 0%, #e0f2ff 100%);
  background-repeat: no-repeat;
  background-size: 100% 30%;
  background-position: 0 88%;
}

.subtitle {
  font-size: 1.2rem;
  color: #718096;
  margin-bottom: 2.5rem;
  line-height: 1.6;
}

.cta-group {
  display: flex;
  gap: 1rem;
  justify-content: center;
}

.btn-primary-lg {
  background-color: #3182ce;
  color: white;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  transition: transform 0.2s, background 0.2s;
  box-shadow: 0 4px 14px rgba(49, 130, 206, 0.4);
}

.btn-primary-lg:hover {
  background-color: #2b6cb0;
  transform: translateY(-2px);
}

.btn-secondary-lg {
  background-color: white;
  color: #3182ce;
  padding: 1rem 2rem;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  border: 2px solid #3182ce;
  transition: all 0.2s;
}

.btn-secondary-lg:hover {
  background-color: #ebf8ff;
}

/* BACKGROUND DECORATION */
.hero-decoration {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 1;
  pointer-events: none;
}
.circle {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.6;
}
.circle-1 {
  width: 400px;
  height: 400px;
  background: #bee3f8;
  top: -100px;
  left: -100px;
}
.circle-2 {
  width: 300px;
  height: 300px;
  background: #e2e8f0;
  bottom: -50px;
  right: -50px;
}

/* FEATURES */
.features {
  display: flex;
  justify-content: center;
  gap: 2rem;
  padding: 3rem 1rem;
  background: white;
  z-index: 2;
  flex-wrap: wrap;
}

.feature-card {
  text-align: center;
  padding: 2rem;
  width: 250px;
  border-radius: 12px;
  transition: transform 0.2s;
}
.feature-card:hover { transform: translateY(-5px); }

.icon { font-size: 2.5rem; margin-bottom: 1rem; }
.feature-card h3 { margin-bottom: 0.5rem; color: #2d3748; }
.feature-card p { color: #718096; font-size: 0.9rem; }

/* FOOTER */
.footer {
  text-align: center;
  padding: 2rem;
  color: #a0aec0;
  font-size: 0.9rem;
  background: #f7fafc;
  border-top: 1px solid #e2e8f0;
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .main-title { font-size: 2.2rem; }
  .cta-group { flex-direction: column; }
  .features { flex-direction: column; align-items: center; }
}
</style>