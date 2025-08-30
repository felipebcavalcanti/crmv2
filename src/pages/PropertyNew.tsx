// src/pages/PropertyNew.tsx
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Loader2, BedDouble, Bath, Car } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/lib/database";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

type FormData = Omit<Property, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

const PropertyNew = () => {
    const { addProperty } = useProperties();
    const navigate = useNavigate();

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
        const newProperty = await addProperty(formData);
        if (newProperty) {
            toast.success("Imóvel cadastrado com sucesso!");
            navigate(`/properties/${newProperty.id}`);
        }
      } catch (e) {
        console.error("Falha ao salvar imóvel:", e);
      } finally {
        setIsSubmitting(false);
      }
    };
  
    return (
        <div className="min-h-screen bg-background p-8 dark">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-foreground tracking-tight mb-8">Cadastrar Novo Imóvel</h1>
                <Card className="bg-card border-border">
                    <CardContent className="p-6">
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
                                <Button type="button" variant="secondary" onClick={() => navigate('/properties')}>Cancelar</Button>
                                <Button type="submit" className="bg-primary hover:bg-primary/90 text-primary-foreground" disabled={isSubmitting}>
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

export default PropertyNew;