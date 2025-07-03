import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Home, Edit, Trash2, Filter, Plus, Image } from "lucide-react";

const PropertyManagement = () => {
  const [properties] = useState([
    {
      id: 1,
      name: "Casa Luxuosa",
      location: "Belo Horizonte",
      status: "Disponível",
      image: "/api/placeholder/80/60"
    },
    {
      id: 2,
      name: "Apartamento Moderno",
      location: "São Paulo",
      status: "Reservado",
      image: "/api/placeholder/80/60"
    }
  ]);

  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    location: "",
    status: "Disponível"
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Card className="mb-8 bg-blue-600 text-white">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <Home className="w-8 h-8" />
              <div>
                <CardTitle className="text-2xl">Gestão de Imóveis</CardTitle>
                <p className="text-blue-100">Gerencie e visualize todos os imóveis cadastrados.</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Label htmlFor="location">Localização:</Label>
                <Input id="location" placeholder="Digite a localização" />
              </div>
              <div className="w-40">
                <Label htmlFor="type">Tipo:</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="casa">Casa</SelectItem>
                    <SelectItem value="apartamento">Apartamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-40">
                <Label htmlFor="status">Status:</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos</SelectItem>
                    <SelectItem value="disponivel">Disponível</SelectItem>
                    <SelectItem value="reservado">Reservado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Filter className="w-4 h-4 mr-2" />
                Filtrar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Properties Table */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4">Foto</th>
                    <th className="text-left py-3 px-4">Nome</th>
                    <th className="text-left py-3 px-4">Localização</th>
                    <th className="text-left py-3 px-4">Status</th>
                    <th className="text-left py-3 px-4">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {properties.map((property) => (
                    <tr key={property.id} className="border-b hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="w-20 h-12 bg-gray-200 rounded flex items-center justify-center">
                          <Image className="w-6 h-6 text-gray-400" />
                        </div>
                      </td>
                      <td className="py-4 px-4 font-medium">{property.name}</td>
                      <td className="py-4 px-4">{property.location}</td>
                      <td className="py-4 px-4">
                        <Badge variant={property.status === "Disponível" ? "default" : "secondary"}>
                          {property.status}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            <Edit className="w-4 h-4 mr-1" />
                            Editar
                          </Button>
                          <Button size="sm" variant="destructive">
                            <Trash2 className="w-4 h-4 mr-1" />
                            Excluir
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Add Property Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Cadastrar Novo Imóvel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="photos">Fotos/Vídeos:</Label>
              <div className="mt-2">
                <Button variant="outline" className="w-full h-20 border-dashed">
                  <div className="text-center">
                    <Plus className="w-6 h-6 mx-auto mb-2" />
                    <span>Escolher arquivos</span>
                    <p className="text-sm text-gray-500">Nenhum arquivo escolhido</p>
                  </div>
                </Button>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descrição:</Label>
              <Textarea 
                id="description"
                placeholder="Digite a descrição do imóvel"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows={4}
              />
            </div>

            <div>
              <Label htmlFor="propertyLocation">Localização:</Label>
              <Input 
                id="propertyLocation"
                placeholder="Digite a localização"
                value={formData.location}
                onChange={(e) => setFormData({...formData, location: e.target.value})}
              />
            </div>

            <div>
              <Label htmlFor="propertyStatus">Status:</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponível">Disponível</SelectItem>
                  <SelectItem value="Reservado">Reservado</SelectItem>
                  <SelectItem value="Vendido">Vendido</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-4 pt-4">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Salvar
              </Button>
              <Button variant="outline">
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Property Details Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="text-xl">Detalhes do Imóvel</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">Selecione um imóvel da lista acima para ver os detalhes completos.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyManagement;