<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const email = ref('')
const password = ref('')
const errorMsg = ref('')
const { login, loading } = useAuth()
const router = useRouter()

const handleLogin = async () => {
  errorMsg.value = ''
  try {
    await login(email.value, password.value)
    router.push('/admin')
  } catch (err) {
    errorMsg.value = 'Credenciales inválidas. Por favor intente de nuevo.'
    console.error(err)
  }
}
</script>

<template>
  <div class="login-container">
    <div class="login-card">
      <div class="login-header">
        <img src="@/assets/logoSystematic.png" alt="Logo Systematic" class="login-logo" />
        <h1>Horario System</h1>
        <p>Iniciar sesión</p>
      </div>

      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <input 
            id="email"
            v-model="email" 
            type="email" 
            placeholder="ejemplo@correo.com" 
            required 
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input 
            id="password"
            v-model="password" 
            type="password" 
            placeholder="••••••••" 
            required 
          />
        </div>

        <p v-if="errorMsg" class="error-message">{{ errorMsg }}</p>

        <button type="submit" :disabled="loading" class="btn-login">
          {{ loading ? 'Cargando...' : 'Ingresar' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top left, #1a1a2e, #16213e);
  padding: 1rem;
}

.login-card {
  background: rgba(10, 18, 40, 0.8);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 2.5rem;
  border-radius: 32px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-logo {
  width: 120px;
  height: auto;
  margin-bottom: 1.5rem;
  filter: drop-shadow(0 0 20px rgba(56, 189, 248, 0.4));
  animation: pulse 3s infinite ease-in-out;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 0.9; }
  50% { transform: scale(1.05); opacity: 1; }
}

.login-header h1 {
  color: #fff;
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
  font-weight: 900;
  letter-spacing: -0.05em;
  background: linear-gradient(to right, #ffffff, #60a5fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.login-header p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-weight: 800;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.75rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  margin-left: 0.25rem;
}

.form-group input {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 1rem 1.25rem;
  border-radius: 16px;
  color: white;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.form-group input:focus {
  outline: none;
  border-color: #38bdf8;
  box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.2);
}

.error-message {
  color: #f87171;
  font-size: 0.85rem;
  text-align: center;
}

.btn-login {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  padding: 1rem;
  border: none;
  border-radius: 16px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  margin-top: 1rem;
  box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.5);
}

.btn-login:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
}

.btn-login:active:not(:disabled) {
  transform: translateY(0);
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
