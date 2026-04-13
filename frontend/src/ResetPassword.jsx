import { useMemo, useState } from "react";
import axios from "axios";
import { ArrowLeft, KeyRound, Lock, Mail } from "lucide-react";
import { API_URL, getApiErrorMessage } from "./api";

const RESET_API_URL = `${API_URL}/auth/reset-password`;

export default function ResetPassword({ onBackToLogin }) {
  const params = useMemo(
    () => new URLSearchParams(window.location.search),
    []
  );

  const [form, setForm] = useState({
    token: params.get("token") || "",
    email: params.get("email") || "",
    password: "",
    password_confirmation: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setError("");

    try {
      const response = await axios.post(RESET_API_URL, form);
      setMessage(response.data.message);
    } catch (err) {
      console.error("Erreur reset password :", err);
      setError(
        err?.response?.data?.message ||
          "Impossible de réinitialiser le mot de passe."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.panel}>
        <button type="button" style={styles.backButton} onClick={onBackToLogin}>
          <ArrowLeft size={16} /> Retour au login
        </button>

        <div style={styles.header}>
          <div style={styles.iconWrap}>
            <KeyRound size={20} />
          </div>
          <div>
            <h1 style={styles.title}>Reinitialiser le mot de passe</h1>
            <p style={styles.subtitle}>
              Entrez votre nouveau mot de passe pour recuperer l&apos;acces a votre compte.
            </p>
          </div>
        </div>

        {message && <div style={styles.successBox}>{message}</div>}
        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
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
              required
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>
              <Lock size={14} /> Nouveau mot de passe
            </span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>

          <label style={styles.field}>
            <span style={styles.label}>
              <Lock size={14} /> Confirmer le mot de passe
            </span>
            <input
              name="password_confirmation"
              type="password"
              value={form.password_confirmation}
              onChange={handleChange}
              style={styles.input}
              required
            />
          </label>

          <button type="submit" style={styles.goldButton} disabled={loading}>
            {loading ? "Reinitialisation..." : "Valider le nouveau mot de passe"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(212,175,55,0.12), transparent 22%), linear-gradient(135deg, #07090d 0%, #10131a 46%, #0d0f14 100%)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "24px",
    boxSizing: "border-box",
  },
  panel: {
    width: "100%",
    maxWidth: "560px",
    background: "linear-gradient(180deg, #101217 0%, #0f1116 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "28px",
    padding: "26px",
    color: "#fff",
    boxShadow: "0 28px 80px rgba(0,0,0,0.42)",
  },
  backButton: {
    border: "1px solid rgba(255,255,255,0.08)",
    background: "#151922",
    color: "#f3f5f8",
    borderRadius: "14px",
    padding: "10px 14px",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "18px",
  },
  header: {
    display: "flex",
    gap: "14px",
    alignItems: "center",
    marginBottom: "18px",
  },
  iconWrap: {
    width: "50px",
    height: "50px",
    borderRadius: "16px",
    background: "rgba(212,175,55,0.15)",
    color: "#f3d77c",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid rgba(212,175,55,0.22)",
  },
  title: {
    margin: 0,
    fontSize: "30px",
  },
  subtitle: {
    margin: "6px 0 0",
    color: "#b7c0cc",
    lineHeight: 1.6,
  },
  successBox: {
    background: "rgba(0,255,100,0.09)",
    border: "1px solid rgba(125,247,170,0.18)",
    color: "#8ef0b4",
    padding: "12px 14px",
    borderRadius: "14px",
    marginBottom: "14px",
  },
  errorBox: {
    background: "rgba(255,0,0,0.08)",
    border: "1px solid rgba(255,120,120,0.18)",
    color: "#ffb0b0",
    padding: "12px 14px",
    borderRadius: "14px",
    marginBottom: "14px",
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
    color: "#dde4ee",
    fontWeight: "bold",
    fontSize: "13px",
  },
  input: {
    background: "#161a22",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "14px",
    color: "#fff",
    padding: "13px 14px",
    outline: "none",
  },
  goldButton: {
    marginTop: "8px",
    width: "100%",
    border: "none",
    borderRadius: "14px",
    background: "#d4af37",
    color: "#111",
    fontWeight: "bold",
    padding: "14px 18px",
    cursor: "pointer",
  },
};

