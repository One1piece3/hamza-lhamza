import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Lock, Mail, Shield, User, UserPlus, X } from "lucide-react";
import Shop from "./shop";
import AdminPanel from "./AdminPanel";
import ResetPassword from "./ResetPassword";
import { API_URL, getApiErrorMessage } from "./api";
import {
  clearAdminSession,
  clearCustomerSession,
  getAdminSession,
  getCustomerSession,
  saveAdminSession,
  saveCustomerSession,
} from "./adminSession";

const LOGIN_API_URL = `${API_URL}/auth/login`;
const REGISTER_API_URL = `${API_URL}/auth/register`;
const FORGOT_PASSWORD_API_URL = `${API_URL}/auth/forgot-password`;
const LOGOUT_API_URL = `${API_URL}/auth/logout`;

function App() {
  const [adminSession, setAdminSession] = useState(() => getAdminSession());
  const [customerSession, setCustomerSession] = useState(() => getCustomerSession());
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    rememberMe: true,
  });
  const [message, setMessage] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const isAdmin = useMemo(() => Boolean(adminSession?.token), [adminSession]);
  const isResetPasswordPage = useMemo(
    () => window.location.pathname === "/reset-password",
    []
  );

  useEffect(() => {
    if (isResetPasswordPage) {
      document.title = "Reinitialiser le mot de passe | Hamza Lhamza";
      return;
    }

    if (isAdmin) {
      document.title = "Espace admin | Hamza Lhamza";
      return;
    }

    document.title = "Hamza Lhamza";
  }, [isAdmin, isResetPasswordPage]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetAuthForm = () => {
    setForm({ name: "", email: "", password: "", rememberMe: true });
    setMessage("");
    setAuthLoading(false);
    setForgotLoading(false);
  };

  const openAuthModal = (mode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setMessage("");
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
    resetAuthForm();
    setForgotEmail("");
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    if (authLoading) {
      return;
    }

    setAuthLoading(true);
    setMessage("");

    try {
      const response =
        authMode === "register"
          ? await axios.post(REGISTER_API_URL, {
              name: form.name,
              email: form.email,
              password: form.password,
            })
          : await axios.post(LOGIN_API_URL, {
              email: form.email,
              password: form.password,
              remember: form.rememberMe,
            });

      if (response.data.role === "admin") {
        saveAdminSession(response.data, form.rememberMe);
        clearCustomerSession();
        setCustomerSession(null);
        setAdminSession(response.data);
        closeAuthModal();
        return;
      }

      const customerData = response.data.user;
      saveCustomerSession(customerData, authMode === "login" ? form.rememberMe : true);
      setCustomerSession(customerData);
      closeAuthModal();
    } catch (error) {
      console.error("Erreur auth :", error);
      setMessage(getApiErrorMessage(error, "Impossible de se connecter pour le moment."));
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (forgotLoading) {
      return;
    }

    setForgotLoading(true);
    setMessage("");

    try {
      const response = await axios.post(FORGOT_PASSWORD_API_URL, {
        email: forgotEmail,
        frontend_url: window.location.origin,
      });
      setMessage(response.data.message);
    } catch (error) {
      console.error("Erreur forgot password :", error);
      setMessage(getApiErrorMessage(error, "Impossible d'envoyer le lien de reinitialisation."));
    } finally {
      setForgotLoading(false);
    }
  };

  const handleAdminLogout = async () => {
    try {
      if (adminSession?.token) {
        await axios.post(
          LOGOUT_API_URL,
          {},
          {
            headers: {
              Authorization: `Bearer ${adminSession.token}`,
            },
          }
        );
      }
    } catch (error) {
      console.error("Erreur logout admin :", error);
    } finally {
      clearAdminSession();
      setAdminSession(null);
    }
  };

  const handleCustomerLogout = () => {
    clearCustomerSession();
    setCustomerSession(null);
  };

  const handleAdminSessionExpired = (payload = null) => {
    clearAdminSession();
    setAdminSession(null);
    setAuthMode("login");
    setShowAuthModal(true);
    setMessage(
      payload?.message || "Session admin expiree. Merci de vous reconnecter."
    );
  };

  if (isAdmin) {
    return (
      <AdminPanel
        onLogout={handleAdminLogout}
        onSessionExpired={handleAdminSessionExpired}
        onGoToShop={() => {
          clearAdminSession();
          setAdminSession(null);
        }}
      />
    );
  }

  if (isResetPasswordPage) {
    return (
      <ResetPassword
        onBackToLogin={() => {
          window.history.pushState({}, "", "/");
          window.location.reload();
        }}
      />
    );
  }

  return (
    <>
      <Shop
        customerSession={customerSession}
        onOpenLogin={() => openAuthModal("login")}
        onOpenRegister={() => openAuthModal("register")}
        onCustomerLogout={handleCustomerLogout}
      />

      {showAuthModal && (
        <div style={styles.overlay} onClick={closeAuthModal}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button type="button" style={styles.closeButton} onClick={closeAuthModal}>
              <X size={18} />
            </button>

            <div style={styles.tabRow}>
              <button
                type="button"
                style={{
                  ...styles.tabButton,
                  ...(authMode === "login" ? styles.tabButtonActive : {}),
                }}
                onClick={() => {
                  setAuthMode("login");
                  setMessage("");
                }}
              >
                <User size={15} /> Login
              </button>
              <button
                type="button"
                style={{
                  ...styles.tabButton,
                  ...(authMode === "register" ? styles.tabButtonActive : {}),
                }}
                onClick={() => {
                  setAuthMode("register");
                  setMessage("");
                }}
              >
                <UserPlus size={15} /> Creer un compte
              </button>
            </div>

            <div style={styles.header}>
              <div style={styles.iconWrap}>
                {authMode === "login" ? <Shield size={20} /> : <UserPlus size={20} />}
              </div>
              <div>
                <h2 style={styles.title}>
                  {authMode === "login" ? "Connexion" : "Creer un compte client"}
                </h2>
                <p style={styles.subtitle}>
                  Si les identifiants correspondent a l&apos;admin, vous serez redirige vers
                  l&apos;espace admin. Sinon, vous entrez dans la boutique comme client.
                </p>
              </div>
            </div>

            {message && <div style={styles.messageBox}>{message}</div>}

            <form onSubmit={handleAuthSubmit} style={styles.form}>
              {authMode === "register" && (
                <label style={styles.field}>
                  <span style={styles.label}>
                    <User size={14} /> Nom complet
                  </span>
                  <input
                    name="name"
                    type="text"
                    value={form.name}
                    onChange={handleChange}
                    style={styles.input}
                    placeholder="Votre nom"
                    required
                  />
                </label>
              )}

              <label style={styles.field}>
                <span style={styles.label}>
                  <Mail size={14} /> Email
                </span>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="vous@email.com"
                  required
                />
              </label>

              <label style={styles.field}>
                <span style={styles.label}>
                  <Lock size={14} /> Mot de passe
                </span>
                <input
                  name="password"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  style={styles.input}
                  placeholder="Votre mot de passe"
                  required
                />
              </label>

              {authMode === "login" && (
                <label style={styles.checkboxRow}>
                  <input
                    name="rememberMe"
                    type="checkbox"
                    checked={form.rememberMe}
                    onChange={handleChange}
                    style={styles.checkbox}
                  />
                  <span style={styles.checkboxLabel}>Se souvenir de moi</span>
                </label>
              )}

              <button type="submit" style={styles.goldButton} disabled={authLoading}>
                {authLoading
                  ? "Chargement..."
                  : authMode === "login"
                  ? "Se connecter"
                  : "Creer mon compte"}
              </button>
            </form>

            {authMode === "login" && (
              <div style={styles.forgotBox}>
                <p style={styles.forgotTitle}>Mot de passe oublie ?</p>
                <form onSubmit={handleForgotPassword} style={styles.forgotForm}>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    style={styles.input}
                    placeholder="Votre email"
                    required
                  />
                  <button type="submit" style={styles.forgotButton} disabled={forgotLoading}>
                    {forgotLoading ? "Envoi..." : "Envoyer le lien"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    inset: 0,
    background:
      "radial-gradient(circle at top left, rgba(255,126,95,0.2), transparent 26%), rgba(20, 24, 32, 0.4)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "20px",
    zIndex: 1300,
  },
  modal: {
    width: "100%",
    maxWidth: "520px",
    background: "linear-gradient(180deg, rgba(255,255,255,0.98), rgba(255,247,242,0.97))",
    color: "#1f2430",
    border: "1px solid rgba(230,188,168,0.62)",
    borderRadius: "28px",
    padding: "24px",
    position: "relative",
    boxShadow: "0 24px 60px rgba(194,121,96,0.18)",
  },
  closeButton: {
    position: "absolute",
    right: "16px",
    top: "16px",
    width: "38px",
    height: "38px",
    borderRadius: "50%",
    border: "1px solid rgba(255,126,95,0.18)",
    background: "#fff8f4",
    color: "#d85d49",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  tabRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    marginBottom: "18px",
  },
  tabButton: {
    border: "1px solid rgba(230,188,168,0.7)",
    background: "rgba(255,255,255,0.94)",
    color: "#6b7280",
    borderRadius: "14px",
    padding: "12px 14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    fontWeight: "bold",
  },
  tabButtonActive: {
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    border: "1px solid rgba(255,126,95,0.45)",
    boxShadow: "0 12px 22px rgba(255,95,109,0.18)",
  },
  header: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
    marginBottom: "18px",
  },
  iconWrap: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    background: "rgba(255,126,95,0.12)",
    color: "#dd5f45",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(255,126,95,0.22)",
  },
  title: {
    margin: 0,
    fontSize: "28px",
    color: "#1f2430",
    fontWeight: "800",
    textShadow: "0 1px 0 rgba(255,255,255,0.75)",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#5c6577",
    lineHeight: 1.6,
    fontSize: "14px",
  },
  messageBox: {
    background: "rgba(255,126,95,0.1)",
    border: "1px solid rgba(255,126,95,0.2)",
    color: "#b24d37",
    padding: "12px 14px",
    borderRadius: "14px",
    marginBottom: "16px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
  },
  field: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  label: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    color: "#4d586b",
    fontWeight: "bold",
    fontSize: "13px",
  },
  input: {
    background: "rgba(255,255,255,0.96)",
    border: "1px solid rgba(230,188,168,0.75)",
    borderRadius: "14px",
    color: "#283042",
    padding: "13px 14px",
    outline: "none",
  },
  checkboxRow: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "2px 2px 0",
  },
  checkbox: {
    width: "18px",
    height: "18px",
    accentColor: "#ff6a63",
    cursor: "pointer",
  },
  checkboxLabel: {
    color: "#4d586b",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
  },
  goldButton: {
    marginTop: "8px",
    width: "100%",
    border: "none",
    borderRadius: "14px",
    background: "linear-gradient(135deg, #ff7e5f 0%, #ff5f6d 100%)",
    color: "#fff",
    fontWeight: "bold",
    padding: "14px 18px",
    cursor: "pointer",
    boxShadow: "0 14px 26px rgba(255,95,109,0.2)",
  },
  forgotBox: {
    marginTop: "16px",
    borderTop: "1px solid rgba(230,188,168,0.62)",
    paddingTop: "16px",
  },
  forgotTitle: {
    margin: "0 0 10px",
    color: "#4d586b",
    fontWeight: "bold",
  },
  forgotForm: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "10px",
  },
  forgotButton: {
    border: "1px solid rgba(230,188,168,0.75)",
    background: "#fff8f4",
    color: "#d85d49",
    borderRadius: "14px",
    padding: "0 16px",
    cursor: "pointer",
    fontWeight: "bold",
  },
};

export default App;
