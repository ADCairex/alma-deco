import { useState } from "react";

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || "alma-admin-2024";

interface Props {
  onLogin: () => void;
}

export default function AdminLogin({ onLogin }: Props) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      sessionStorage.setItem("admin_auth", "true");
      onLogin();
    } else {
      setError(true);
      setPassword("");
    }
  }

  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center">
      <div className="bg-white shadow-lg rounded-xl p-10 w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl text-stone-800">Alma Deco</h1>
          <p className="text-stone-500 text-sm mt-1">Panel de Administración</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError(false);
              }}
              className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-stone-400"
              placeholder="Introduce la contraseña"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-red-600 text-sm">Contraseña incorrecta.</p>
          )}

          <button
            type="submit"
            className="w-full bg-stone-800 text-white py-2.5 rounded-lg font-medium hover:bg-stone-700 transition-colors"
          >
            Acceder
          </button>
        </form>
      </div>
    </div>
  );
}
