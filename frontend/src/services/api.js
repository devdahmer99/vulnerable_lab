// API Helper - adiciona token às requisições automaticamente
export async function apiCall(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token')
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  }

  // Adicionar token se existir
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`http://localhost:8000/api${endpoint}`, {
    ...options,
    headers,
  })

  return response
}
