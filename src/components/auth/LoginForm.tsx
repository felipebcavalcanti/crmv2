// src/components/auth/LoginForm.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Eye, EyeOff, Loader2, Mail, Lock } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido')
    .transform(val => val.toLowerCase().trim()),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { signIn } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
    setError,
    clearErrors
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    clearErrors()
    
    try {
      const { error } = await signIn(data.email, data.password)
      
      if (error) {
        // Tratamento específico de erros do Supabase
        let errorMessage = 'Erro no login'
        let fieldError: 'email' | 'password' | null = null
        
        switch (error.message.toLowerCase()) {
          case 'invalid login credentials':
          case 'invalid credentials':
            errorMessage = 'Email ou senha incorretos'
            fieldError = 'email'
            break
          case 'email not confirmed':
            errorMessage = 'Confirme seu email antes de fazer login'
            fieldError = 'email'
            break
          case 'too many requests':
            errorMessage = 'Muitas tentativas. Tente novamente em alguns minutos'
            break
          case 'user not found':
            errorMessage = 'Usuário não encontrado'
            fieldError = 'email'
            break
          case 'invalid password':
            errorMessage = 'Senha incorreta'
            fieldError = 'password'
            break
          default:
            errorMessage = error.message
        }
        
        // Define erro no campo específico se aplicável
        if (fieldError) {
          setError(fieldError, { 
            type: 'manual', 
            message: errorMessage 
          })
        }
        
        toast.error('Erro no login', {
          description: errorMessage,
        })
      } else {
        toast.success('Login realizado com sucesso!')
        navigate('/dashboard', { replace: true })
      }
    } catch (error) {
      console.error('Unexpected login error:', error)
      toast.error('Erro inesperado', {
        description: 'Tente novamente em alguns instantes',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              className={`pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-ring ${errors.email ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
              {...register('email')}
              disabled={isLoading}
            />
          </div>
          {errors.email && (
            <p className="text-sm text-destructive">{errors.email.message}</p>
          )}
        </div>

        {/* Senha */}
        <div className="space-y-2">
          <Label htmlFor="password" className="text-foreground font-medium">Senha</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-3 h-4 w-4 text-primary" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className={`pl-10 pr-10 bg-background border-input text-foreground placeholder:text-muted-foreground focus:ring-ring focus:border-ring ${errors.password ? 'border-destructive focus:border-destructive focus:ring-destructive' : ''}`}
              {...register('password')}
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 h-4 w-4 text-primary hover:text-primary/80 transition-colors"
              disabled={isLoading}
            >
              {showPassword ? <EyeOff /> : <Eye />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-destructive">{errors.password.message}</p>
          )}
        </div>

        {/* Link para recuperar senha */}
        <div className="text-right">
          <Link 
            to="/forgot-password" 
            className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors"
          >
            Esqueceu a senha?
          </Link>
        </div>

        {/* Botão de login */}
        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground transition-colors" 
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Entrando...
            </>
          ) : (
            'Entrar'
          )}
        </Button>
      </form>

      {/* Link para cadastro */}
      <div className="text-center text-sm">
        <span className="text-muted-foreground">Não tem uma conta? </span>
        <Link to="/register" className="text-primary hover:text-primary/80 hover:underline transition-colors font-medium">
          Cadastre-se
        </Link>
      </div>
    </div>
  )
}