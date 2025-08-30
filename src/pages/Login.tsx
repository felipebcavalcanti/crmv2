import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { LoginForm } from '@/components/auth/LoginForm'


const Login = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted p-4 dark">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-foreground tracking-tight">Bem-vindo de volta</h1>
          <p className="text-muted-foreground">Entre na sua conta para continuar</p>
        </div>
        
        <Card className="border-border bg-card/50 backdrop-blur-sm shadow-2xl">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-xl font-semibold text-foreground">Fazer Login</CardTitle>
            <CardDescription className="text-muted-foreground">
              Digite suas credenciais para acessar o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Login