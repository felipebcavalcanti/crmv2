import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, Mail, Facebook, Instagram } from "lucide-react";

const MarketingIntegrations = () => {
  const [campaignData, setCampaignData] = useState({
    name: "",
    template: "E-mail"
  });

  const templates = [
    { id: 1, name: "Template 1", description: "Template básico para campanhas de e-mail" },
    { id: 2, name: "Template 2", description: "Template avançado com design responsivo" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-8 bg-blue-600 text-white">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <TrendingUp className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Marketing e Integrações</CardTitle>
                <p className="text-blue-100">Gerencie campanhas e integre-se às redes sociais e portais imobiliários.</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Marketing Campaigns */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Campanhas de Marketing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="campaignName">Nome da Campanha:</Label>
              <Input 
                id="campaignName"
                placeholder="Digite o nome da campanha"
                value={campaignData.name}
                onChange={(e) => setCampaignData({...campaignData, name: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="template">Template:</Label>
              <Select value={campaignData.template} onValueChange={(value) => setCampaignData({...campaignData, template: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="E-mail">E-mail</SelectItem>
                  <SelectItem value="SMS">SMS</SelectItem>
                  <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button className="bg-blue-600 hover:bg-blue-700">
              <Mail className="w-4 h-4 mr-2" />
              Criar Campanha
            </Button>
          </CardContent>
        </Card>

        {/* Ad Templates */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Templates de Anúncios</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {templates.map((template) => (
                <div key={template.id} className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">{template.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                  <Button className="bg-blue-600 hover:bg-blue-700">
                    Selecionar
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Social Media Integration */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Redes Sociais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button className="bg-blue-600 hover:bg-blue-700 h-12">
                <Facebook className="w-5 h-5 mr-2" />
                Compartilhar no Facebook
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 h-12">
                <Instagram className="w-5 h-5 mr-2" />
                Compartilhar no Instagram
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MarketingIntegrations;