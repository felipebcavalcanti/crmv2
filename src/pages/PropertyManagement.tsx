// src/pages/PropertyManagement.tsx
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Loader2, Search } from "lucide-react";
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/lib/database";
import { useNavigate } from "react-router-dom";

const PropertyManagement = () => {
  const { properties, loading, error, searchForProperties, fetchProperties } = useProperties();
  const [displayProperties, setDisplayProperties] = useState<Property[]>(properties);
  const [searchTerm, setSearchTerm] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setDisplayProperties(properties);
  }, [properties]);

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
        fetchProperties();
        return;
    }
    setIsSearching(true);
    const results = await searchForProperties(searchTerm);
    setDisplayProperties(results);
    setIsSearching(false);
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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Imóveis</h1>
                <p className="text-gray-600 mt-1">Gerencie e visualize todos os imóveis cadastrados.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
                <Input 
                    placeholder="Pesquisar imóveis..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                    className="flex-grow"
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                </Button>
            </div>
        </div>

        <Card>
          <CardHeader><CardTitle>Lista de Imóveis</CardTitle></CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center h-40"><Loader2 className="h-8 w-8 animate-spin text-blue-600" /></div>
            ) : error ? (
              <div className="text-center py-10"><p className="text-red-600">{error}</p></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b"><th className="text-left py-3 px-4 font-semibold">Nome</th><th className="text-left py-3 px-4 font-semibold">Localização</th><th className="text-left py-3 px-4 font-semibold">Status</th><th className="text-left py-3 px-4 font-semibold">Valor</th><th className="text-left py-3 px-4 font-semibold">Ações</th></tr>
                  </thead>
                  <tbody>
                    {displayProperties.map((property) => (
                      <tr 
                        key={property.id} 
                        className="border-b hover:bg-gray-100 cursor-pointer"
                        onClick={() => navigate(`/properties/${property.id}`)}
                      >
                        <td className="py-4 px-4 font-medium">{property.name}</td>
                        <td className="py-4 px-4 text-gray-600">{property.location}</td>
                        <td className="py-4 px-4"><Badge variant={getStatusBadgeVariant(property.status)}>{property.status}</Badge></td>
                        <td className="py-4 px-4 font-medium text-gray-800">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}{property.purpose === 'Aluguel' ? '/mês' : ''}</td>
                        <td className="py-4 px-4">
                            <div className="flex gap-2">
                                <Button size="sm" variant="secondary" onClick={(e) => e.stopPropagation()}>
                                    <Edit className="w-4 h-4 mr-1" />Editar
                                </Button>
                                <Button size="sm" variant="destructive" onClick={(e) => e.stopPropagation()}>
                                    <Trash2 className="w-4 h-4 mr-1" />Excluir
                                </Button>
                            </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PropertyManagement;