// src/pages/PropertySearch.tsx
import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Building, BedDouble, Bath, Car, DollarSign } from 'lucide-react';
import { useProperties } from "@/hooks/useProperties";
import { Property } from "@/lib/database";
import { Link } from 'react-router-dom'; // Para criar links para os detalhes

const PropertyCard = ({ property }: { property: Property }) => {
    const getStatusBadgeVariant = (status: Property['status']) => {
        switch (status) {
          case 'Disponível': return 'default';
          case 'Vendido': return 'destructive';
          case 'Reservado': return 'secondary';
          default: return 'outline';
        }
    };
    
    return (
        <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <CardTitle className="truncate">{property.name}</CardTitle>
                <CardDescription>{property.location}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                    <Badge variant={getStatusBadgeVariant(property.status)}>{property.status}</Badge>
                    <div className="font-bold text-lg text-blue-600">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                        {property.purpose === 'Aluguel' ? <span className="text-sm font-normal text-gray-500">/mês</span> : ''}
                    </div>
                </div>
                <div className="flex justify-between text-sm text-gray-600 border-t pt-3">
                    <div className="flex items-center gap-1"><BedDouble className="w-4 h-4 text-gray-500" /> {property.bedrooms}</div>
                    <div className="flex items-center gap-1"><Bath className="w-4 h-4 text-gray-500" /> {property.bathrooms}</div>
                    <div className="flex items-center gap-1"><Car className="w-4 h-4 text-gray-500" /> {property.parking_spots}</div>
                </div>
                <Link to={`/properties/${property.id}`} className="w-full">
                    <Button variant="outline" className="w-full mt-2">
                        Ver Detalhes
                    </Button>
                </Link>
            </CardContent>
        </Card>
    )
}


const PropertySearch = () => {
    const { searchForProperties } = useProperties();
    const [searchTerm, setSearchTerm] = useState('');
    const [results, setResults] = useState<Property[]>([]);
    const [loading, setLoading] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = useCallback(async () => {
        if (!searchTerm.trim()) return;
        setLoading(true);
        setHasSearched(true);
        const searchResult = await searchForProperties(searchTerm);
        setResults(searchResult);
        setLoading(false);
    }, [searchTerm, searchForProperties]);

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
            <div className="max-w-7xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Pesquisar Imóveis</h1>
                    <p className="text-gray-600 mt-1">Encontre imóveis por nome, localização ou descrição.</p>
                </div>

                <div className="flex gap-2 mb-8">
                    <Input 
                        placeholder="Digite sua busca..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        className="flex-grow"
                    />
                    <Button onClick={handleSearch} disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                        <span className="ml-2">Buscar</span>
                    </Button>
                </div>

                <div>
                    {loading ? (
                        <div className="flex justify-center items-center py-16">
                            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                        </div>
                    ) : hasSearched && results.length === 0 ? (
                        <div className="text-center py-16">
                            <Building className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-semibold text-gray-800">Nenhum imóvel encontrado</h3>
                            <p className="mt-1 text-gray-500">Tente ajustar seus termos de busca.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {results.map(property => (
                                <PropertyCard key={property.id} property={property} />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PropertySearch;