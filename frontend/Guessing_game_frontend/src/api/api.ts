// Api calls e tals pra criar sessoões e etc
// Usar um hardcoded token? de duração infinita KKKK. Vence em 3080
// Isso porque a ideia é não ter login, então o "admin" tem um token fixo e os 
// players só precisam colocar o id da sala pra entrar, e o resto o websocket resolve
// Verificação de ambiente
import axios from 'axios'
const dev = import.meta.env.DEV
export const api = axios.create({
  baseURL: dev ? import.meta.env.VITE_API_URL : '/api',
  withCredentials: true,
  xsrfCookieName: 'csrf_token',
  xsrfHeaderName: 'X-CSRFToken',
})

// Interceptor para debug
api.interceptors.request.use(
  config => {
    console.log('Request config:', {
      url: config.url,
      method: config.method,
      withCredentials: config.withCredentials,
      headers: config.headers,
    })
    return config
  },
  error => {
    console.error('Request error:', error)
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  response => {
    console.log('Response:', {
      status: response.status,
      headers: response.headers,
      cookies: document.cookie,
    })
    return response
  },
  error => {
    console.error('Response error:', error.response || error)
    return Promise.reject(error)
  }
)

// Função para obter CSRF token
export const fetchCSRFToken = async () => {
  try {
    console.log('Fetching CSRF token...')
    
    // Primeiro, limpe qualquer cookie existente (opcional)
    document.cookie = 'csrf_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;'
    
    // Faça a requisição
    const response = await api.get('/set-csrf-token/', {
      headers: {
        'Accept': 'application/json',
      }
    })
    
    console.log('CSRF response:', response.data)
    console.log('Document cookie:', document.cookie)
    
    // Verifique se o axios detectou o cookie
    console.log('Axios defaults xsrfCookieName:', api.defaults.xsrfCookieName)
    
    return true
  } catch (error) {
    const errorObject = error instanceof Error ? error : new Error(String(error))
    const axiosError = error as any
    console.error('Error fetching CSRF token:', {
      message: errorObject.message,
      response: axiosError.response?.data,
      status: axiosError.response?.status,
      headers: axiosError.response?.headers,
    })
    return false
  }
}


