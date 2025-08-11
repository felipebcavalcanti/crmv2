// src/pages/PropertyManagement.tsx
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Upload, BedDouble, Bath, Car, Loader2 } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/lib/database";
import { toast } from "sonner";

type FormData = Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const PropertyManagement = () => {
  const { properties, addProperty, loading, error } = useProperties();

  const initialFormState: FormData = {
    name: "",
    description: "",
    location: "",
    status: "Disponível",
    type: "Apartamento",
    purpose: "Venda",
    price: 0,
    bedrooms: 0,
    suites: 0,
    bathrooms: 0,
    parking_spots: 0,
    images: null
  };
  const [formData, setFormData] = useState<FormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formattedPrice, setFormattedPrice] = useState("");

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = e.target.value.replace(/\D/g, '');
    if (rawValue === '') {
        setFormData(prev => ({ ...prev, price: 0 }));
        setFormattedPrice('');
        return;
    }
    const numericValue = Number(rawValue) / 100;
    
    setFormData(prev => ({ ...prev, price: numericValue }));
    setFormattedPrice(new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(numericValue));
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    const numericFields = ['bedrooms', 'suites', 'bathrooms', 'parking_spots'];
    if (numericFields.includes(id)) {
        setFormData(prev => ({ ...prev, [id]: Number(value) || 0 }));
    } else {
        setFormData(prev => ({ ...prev, [id]: value }));
    }
  };
  
  const handleSelectChange = (id: keyof FormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [id]: value as any }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
        toast.error("Erro de Validação", { description: "Nome do anúncio e localização são obrigatórios."});
        return;
    }
    setIsSubmitting(true);
    try {
      await addProperty(formData);
      setFormData(initialFormState);
      setFormattedPrice("");
    } catch (e) {
      console.error("Falha ao salvar imóvel:", e);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const getStatusBadgeVariant = (status: Property['status']) => {
    switch (status) {
      case 'Disponível': return 'default';
      case 'Vendido': return 'destructive';
      case 'Reservado': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Imóveis</h1>
                <p className="text-gray-600 mt-1">Gerencie e visualize todos os imóveis cadastrados.</p>
            </div>
        </div>

        <Card className="mb-8">
          <CardHeader><CardTitle>Lista de Imóveis</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /><p className="ml-4 text-gray-600">Carregando imóveis...</p></div>
            ) : error ? (
              <div className="text-center py-10"><p className="text-red-600">{error}</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b"><th className="text-left py-3 px-4 font-semibold">Nome</th><th className="text-left py-3 px-4 font-semibold">Localização</th><th className="text-left py-3 px-4 font-semibold">Status</th><th className="text-left py-3 px-4 font-semibold">Valor</th><th className="text-left py-3 px-4 font-semibold">Ações</th></tr>
                  </thead>
                  <tbody>
                    {properties.map((property) => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="py-4 px-4 font-medium">{property.name}</td>
                        <td className="py-4 px-4 text-gray-600">{property.location}</td>
                        <td className="py-4 px-4"><Badge variant={getStatusBadgeVariant(property.status)}>{property.status}</Badge></td>
                        <td className="py-4 px-4 font-medium text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}{property.purpose === 'Aluguel' ? '/mês' : ''}</td>
                        <td className="py-4 px-4"><div className="flex gap-2"><Button size="sm" variant="secondary"><Edit className="w-4 h-4 mr-1" />Editar</Button><Button size="sm" variant="destructive"><Trash2 className="w-4 h-4 mr-1" />Excluir</Button></div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-xl">Cadastrar Novo Imóvel</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><Label htmlFor="name">Nome do Anúncio *</Label><Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Ex: Apartamento 3 quartos no Centro" required /></div>
                <div><Label htmlFor="location">Localização *</Label><Input id="location" value={formData.location} onChange={handleInputChange} placeholder="Cidade, Estado" required /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div><Label htmlFor="type">Tipo de imóvel</Label><Select value={formData.type} onValueChange={handleSelectChange('type')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Apartamento">Apartamento</SelectItem><SelectItem value="Casa">Casa</SelectItem><SelectItem value="Sobrado">Sobrado</SelectItem><SelectItem value="Terreno">Terreno</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="purpose">Finalidade</Label><Select value={formData.purpose} onValueChange={handleSelectChange('purpose')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Venda">Venda</SelectItem><SelectItem value="Aluguel">Aluguel</SelectItem></SelectContent></Select></div>
                <div><Label htmlFor="status">Status</Label><Select value={formData.status} onValueChange={handleSelectChange('status')}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="Disponível">Disponível</SelectItem><SelectItem value="Reservado">Reservado</SelectItem><SelectItem value="Vendido">Vendido</SelectItem><SelectItem value="Indisponível">Indisponível</SelectItem></SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div><Label htmlFor="price">Valor (R$)</Label><Input id="price" value={formattedPrice} onChange={handlePriceChange} placeholder="R$ 0,00" /></div>
                  <div><Label htmlFor="bedrooms"><BedDouble className="w-4 h-4 inline-block mr-1"/>Dorms</Label><Input id="bedrooms" type="number" value={formData.bedrooms} onChange={handleInputChange} placeholder="0" /></div>
                  <div><Label htmlFor="suites"><Bath className="w-4 h-4 inline-block mr-1"/>Suítes</Label><Input id="suites" type="number" value={formData.suites} onChange={handleInputChange} placeholder="0" /></div>
                  <div><Label htmlFor="bathrooms"><Bath className="w-4 h-4 inline-block mr-1"/>Banhs</Label><Input id="bathrooms" type="number" value={formData.bathrooms} onChange={handleInputChange} placeholder="0" /></div>
                  <div><Label htmlFor="parking_spots"><Car className="w-4 h-4 inline-block mr-1"/>Vagas</Label><Input id="parking_spots" type="number" value={formData.parking_spots} onChange={handleInputChange} placeholder="0" /></div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="secondary" onClick={() => { setFormData(initialFormState); setFormattedPrice(""); }}>Cancelar</Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700" disabled={isSubmitting}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isSubmitting ? "Salvando..." : "Salvar Imóvel"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyManagement;