// src/pages/PropertyDetails.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useProperties } from '@/hooks/useProperties';
import { Property } from '@/lib/database';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft, BedDouble, Bath, Car, DollarSign, MapPin, Building2 } from 'lucide-react';

const DetailRow = ({ icon, label, value }: { icon: React.ReactNode, label: string, value: React.ReactNode }) => (
    <div className="flex items-start text-sm py-2">
        <div className="flex-shrink-0 w-6 mt-0.5 text-gray-500">{icon}</div>
        <div className="flex-1">
            <p className="font-semibold text-gray-800">{label}</p>
            <p className="text-gray-600 break-words">{value}</p>
        </div>
    </div>
);

const PropertyDetails = () => {
    const { id } = useParams<{ id: string }>();
    const { fetchPropertyById, loading } = useProperties();
    const [property, setProperty] = useState<Property | null>(null);

    useEffect(() => {
        if (id) {
            const loadProperty = async () => {
                const data = await fetchPropertyById(id);
                if (data) {
                    setProperty(data);
                }
            };
            loadProperty();
        }
    }, [id, fetchPropertyById]);

    if (loading || !property) {
        return (
            <div className="flex h-screen w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 p-4 sm:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="mb-6">
                    <Link to="/properties">
                        <Button variant="ghost">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Voltar para a lista
                        </Button>
                    </Link>
                </div>

                <Card className="bg-white shadow-lg">
                    <CardHeader>
                        <Badge variant="secondary" className="w-fit mb-2">{property.type} para {property.purpose}</Badge>
                        <CardTitle className="text-3xl font-bold">{property.name}</CardTitle>
                        <CardDescription className="flex items-center gap-2 pt-1">
                            <MapPin className="w-4 h-4" />
                            {property.location}
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid md:grid-cols-2 gap-x-8 gap-y-4">
                            <div>
                                <h3 className="font-semibold text-lg mb-2">Informações Principais</h3>
                                <DetailRow icon={<DollarSign size={16} />} label="Preço" value={
                                    <span className="font-bold text-blue-600 text-base">
                                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(property.price)}
                                        {property.purpose === 'Aluguel' ? <span className="text-sm font-normal text-gray-500">/mês</span> : ''}
                                    </span>
                                } />
                                <DetailRow icon={<Building2 size={16} />} label="Status" value={property.status} />
                            </div>

                            <div>
                                <h3 className="font-semibold text-lg mb-2">Características</h3>
                                <DetailRow icon={<BedDouble size={16} />} label="Quartos" value={property.bedrooms} />
                                <DetailRow icon={<Bath size={16} />} label="Suítes" value={property.suites} />
                                <DetailRow icon={<Bath size={16} />} label="Banheiros" value={property.bathrooms} />
                                <DetailRow icon={<Car size={16} />} label="Vagas de Garagem" value={property.parking_spots} />
                            </div>
                        </div>

                        {property.description && (
                            <div className="mt-6 border-t pt-4">
                                <h3 className="font-semibold text-lg mb-2">Descrição</h3>
                                <p className="text-gray-600 leading-relaxed">{property.description}</p>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default PropertyDetails;