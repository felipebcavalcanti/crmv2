// src/pages/ForgotPassword.tsx
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/useAuth'
import { toast } from 'sonner'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido').min(1, 'Email é obrigatório'),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { resetPassword } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    
    try {
      const { error } = await resetPassword(data.email)
      
      if (error) {
        let errorMessage = 'Erro ao enviar email'
        
        switch (error.message) {
          case 'User not found':
            errorMessage = 'Email não encontrado em nossa base de dados'
            break
          case 'For security purposes, you can only request this once every 60 seconds':
            errorMessage = 'Aguarde 60 segundos antes de solicitar novamente'
            break
          default:
            errorMessage = error.message
        }
        
        toast.error('Erro', {
          description: errorMessage,
        })
      } else {
        setEmailSent(true)
        toast.success('Email enviado!', {
          description: 'Verifique sua caixa de entrada para redefinir sua senha.',
        })
      }
    } catch (error) {
      console.error('Unexpected forgot password error:', error)
      toast.error('Erro inesperado', {
        description: 'Tente novamente em alguns instantes',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Tela de confirmação após enviar email
  if (emailSent) {
    return (
      <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md bg-card border-border">
          <CardHeader className="space-y-1 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
              <Mail className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">Email Enviado!</CardTitle>
            <CardDescription>
              Enviamos um link para redefinir sua senha para:
              <br />
              <strong>{getValues('email')}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center text-sm text-muted-foreground space-y-2">
              <p>Verifique sua caixa de entrada e siga as instruções no email.</p>
              <p>Não recebeu? Verifique sua pasta de spam.</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full"
              >
                Tentar outro email
              </Button>
              
              <Link to="/" className="w-full">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Voltar ao login
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Formulário para inserir email
  return (
    <div className="dark min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center tracking-tight">Esqueceu sua senha?</CardTitle>
          <CardDescription className="text-center">
            Digite seu email para receber um link de redefinição de senha
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...register('email')}
                className={errors.email ? 'border-destructive' : ''}
                disabled={isLoading}
              />
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                'Enviar link de redefinição'
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/" className="text-sm text-primary hover:underline inline-flex items-center">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Voltar ao login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default ForgotPassword