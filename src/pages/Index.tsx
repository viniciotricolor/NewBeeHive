import { MadeWithDyad } from "@/components/made-with-dyad";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, TrendingUp, Globe } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Bem-vindo ao Explorador Hive
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Descubra novos membros da comunidade Hive Blockchain através da tag #introduceyourself
          </p>
          <Button 
            size="lg" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
            onClick={() => window.location.href = '/hive-users'}
          >
            <Users className="h-5 w-5 mr-2" />
            Explorar Novos Usuários
          </Button>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Novos Membros</CardTitle>
              <CardDescription>
                Descubra usuários recentes que se apresentaram na comunidade
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Estatísticas em Tempo Real</CardTitle>
              <CardDescription>
                Acompanhe o crescimento da comunidade Hive
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="text-center">
            <CardHeader>
              <Globe className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Conecte-se</CardTitle>
              <CardDescription>
                Visite os posts de apresentação e conheça novos desenvolvedores
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Pronto para explorar?</CardTitle>
              <CardDescription className="text-lg">
                Clique no botão acima para começar a descobrir novos talentos da comunidade Hive
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                size="lg" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => window.location.href = '/hive-users'}
              >
                Ir para a Lista de Usuários
              </Button>
            </CardContent>
          </Card>
        </div>

        <MadeWithDyad />
      </div>
    </div>
  );
};

export default Index;