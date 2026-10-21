export default function Home() {
  return (
    <main className="login-page">
      <section className="welcome-panel" aria-label="Présentation">
        <a className="brand" href="#">
          <span className="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 32 32" fill="none">
              <circle cx="12" cy="11" r="4" />
              <circle cx="22" cy="13" r="3" />
              <path d="M4.5 25c.7-4.1 3.2-6.2 7.5-6.2s6.8 2.1 7.5 6.2M19 19.4c3.8-.5 6.6 1.4 7.5 4.6" />
              <path d="M24 4v6M21 7h6" />
            </svg>
          </span>
          Find New Friends
        </a>
        <div className="welcome-copy">
          <span className="eyebrow">TON PROCHAIN CHAPITRE COMMENCE ICI</span>
          <h1>Les belles rencontres<br />commencent par un <em>bonjour.</em></h1>
          <p>Retrouve tes amis, fais de nouvelles rencontres et partage les moments qui comptent.</p>
        </div>
        <div className="panel-bottom"><span className="avatars"><i>J</i><i>M</i><i>A</i><i>+</i></span><span>Rejoins une communauté qui te ressemble</span></div>
        <div className="decor decor-one" /><div className="decor decor-two" />
      </section>
      <section className="form-panel">
        <div className="mobile-brand"><span className="brand-mark">f</span> find<span>friends</span></div>
        <div className="login-card">
          <div className="welcome-small">BON RETOUR</div>
          <h2>Content de te revoir !</h2>
          <p className="subtitle">Connecte-toi pour trouver de nouveaux amis.</p>
          <form action="#" method="get">
            <label htmlFor="email">Adresse e-mail</label>
            <input id="email" name="email" type="email" placeholder="toi@exemple.com" autoComplete="email" required />
            <div className="password-label"><label htmlFor="password">Mot de passe</label><a href="#forgot">Mot de passe oublié ?</a></div>
            <input id="password" name="password" type="password" placeholder="Saisis ton mot de passe" autoComplete="current-password" required />
            <label className="remember"><input type="checkbox" name="remember" /> <span>Se souvenir de moi</span></label>
            <button className="submit-button" type="submit">Se connecter <span aria-hidden="true">→</span></button>
          </form>
          <div className="divider"><span>ou continuer avec</span></div>
          <button className="google-button" type="button"><span className="google-g">G</span> Continuer avec Google</button>
          <p className="signup">Pas encore de compte ? <a href="/inscription">Créer un compte</a></p>
        </div>
        <footer>En te connectant, tu acceptes nos <a href="#terms">Conditions d’utilisation</a> et notre <a href="#privacy">Politique de confidentialité</a>.</footer>
      </section>
    </main>
  );
}
