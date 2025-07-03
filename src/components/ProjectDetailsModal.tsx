import { useState } from "react";
import { DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";


import { Project, WeeklyTracking } from "@/pages/Index";
import { Users, FileText, TrendingUp, AlertCircle, Plus, X, Edit2, Save, Camera, Upload, Trash2 } from "lucide-react";

interface ProjectDetailsModalProps {
  project: Project;
  onUpdate: (project: Project) => void;
}

interface Checkpoint {
  id: string;
  title: string;
  completed: boolean;
}

export const ProjectDetailsModal = ({ project, onUpdate }: ProjectDetailsModalProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Project>(project);
  const [weeklyTracking, setWeeklyTracking] = useState<WeeklyTracking[]>(project.weeklyTracking);
  const [checkpoints, setCheckpoints] = useState<Checkpoint[]>(
    project.checkpoints || [
      { id: "1", title: "Planejamento inicial", completed: false },
      { id: "2", title: "Setup do ambiente", completed: false },
      { id: "3", title: "Desenvolvimento core", completed: false },
      { id: "4", title: "Testes", completed: false },
      { id: "5", title: "Deploy", completed: false }
    ]
  );
  const [newCheckpoint, setNewCheckpoint] = useState("");
  const [newWeekData, setNewWeekData] = useState({
    week: "",
    progress: 0,
    notes: "",
    blockers: [] as string[]
  });
  const [newBlocker, setNewBlocker] = useState("");
  const [projectImages, setProjectImages] = useState<Array<{id: string, url: string, title: string, description: string}>>(
    project.images || []
  );
  const [newImageTitle, setNewImageTitle] = useState("");
  const [newImageDescription, setNewImageDescription] = useState("");
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "in-progress": return "bg-blue-100 text-blue-800";
      case "review": return "bg-yellow-100 text-yellow-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed": return "Concluído";
      case "in-progress": return "Em Andamento";
      case "review": return "Em Revisão";
      default: return "Planejamento";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "high": return "Alta";
      case "medium": return "Média";
      default: return "Baixa";
    }
  };

  const isOverdue = new Date(project.deliveryDate) < new Date() && project.status !== "completed";

  const calculateProgress = () => {
    const completedCheckpoints = checkpoints.filter(c => c.completed).length;
    return Math.round((completedCheckpoints / checkpoints.length) * 100);
  };

  const handleCheckpointToggle = (checkpointId: string) => {
    const updatedCheckpoints = checkpoints.map(c => 
      c.id === checkpointId ? { ...c, completed: !c.completed } : c
    );
    setCheckpoints(updatedCheckpoints);
    
    const newProgress = Math.round((updatedCheckpoints.filter(c => c.completed).length / updatedCheckpoints.length) * 100);
    const updatedProject = { ...editedProject, progress: newProgress, checkpoints: updatedCheckpoints };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const handleAddCheckpoint = () => {
    if (newCheckpoint.trim()) {
      const newCheckpointObj = {
        id: Date.now().toString(),
        title: newCheckpoint.trim(),
        completed: false
      };
      const updatedCheckpoints = [...checkpoints, newCheckpointObj];
      setCheckpoints(updatedCheckpoints);
      setNewCheckpoint("");
      
      const updatedProject = { ...editedProject, checkpoints: updatedCheckpoints };
      setEditedProject(updatedProject);
    }
  };

  const handleAddBlocker = () => {
    if (newBlocker.trim()) {
      setNewWeekData({
        ...newWeekData,
        blockers: [...newWeekData.blockers, newBlocker.trim()]
      });
      setNewBlocker("");
    }
  };

  const handleRemoveBlocker = (index: number) => {
    setNewWeekData({
      ...newWeekData,
      blockers: newWeekData.blockers.filter((_, i) => i !== index)
    });
  };

  const handleAddWeeklyTracking = () => {
    if (newWeekData.week.trim()) {
      const newTracking: WeeklyTracking = {
        week: newWeekData.week,
        progress: newWeekData.progress,
        notes: newWeekData.notes,
        blockers: newWeekData.blockers
      };
      
      const updatedTracking = [...weeklyTracking, newTracking];
      setWeeklyTracking(updatedTracking);
      setNewWeekData({
        week: "",
        progress: 0,
        notes: "",
        blockers: []
      });
      
      const updatedProject = { ...editedProject, weeklyTracking: updatedTracking };
      setEditedProject(updatedProject);
      onUpdate(updatedProject);
    }
  };

  const handleSave = () => {
    const updatedProject = {
      ...editedProject,
      weeklyTracking,
      checkpoints,
      images: projectImages
    };
    onUpdate(updatedProject);
    setIsEditing(false);
  };

  const handleDeleteWeeklyTracking = (index: number) => {
    const updatedTracking = weeklyTracking.filter((_, i) => i !== index);
    setWeeklyTracking(updatedTracking);
    
    const updatedProject = { ...editedProject, weeklyTracking: updatedTracking };
    setEditedProject(updatedProject);
    onUpdate(updatedProject);
  };

  const handleSaveImage = () => {
    if (selectedImageFile && newImageTitle.trim()) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newImage = {
          id: Date.now().toString(),
          url: e.target?.result as string,
          title: newImageTitle,
          description: newImageDescription
        };
        const updatedImages = [...projectImages, newImage];
        setProjectImages(updatedImages);
        setNewImageTitle("");
        setNewImageDescription("");
        setSelectedImageFile(null);
        
        const updatedProject = { ...editedProject, images: updatedImages };
        setEditedProject(updatedProject);
        onUpdate(updatedProject);
      };
      reader.readAsDataURL(selectedImageFile);
    }
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setSelectedImageFile(file || null);
  };

  return (
    <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
      <DialogHeader>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <DialogTitle className="text-xl">{project.name}</DialogTitle>
            <DialogDescription>{project.description}</DialogDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? <Save className="w-4 h-4 mr-2" /> : <Edit2 className="w-4 h-4 mr-2" />}
            {isEditing ? "Salvar" : "Editar"}
          </Button>
        </div>
      </DialogHeader>

      <div className="space-y-6">
        {/* Project Status and Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Status do Projeto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex gap-2">
                <Badge className={getStatusColor(project.status)}>
                  {getStatusText(project.status)}
                </Badge>
                <Badge className={getPriorityColor(project.priority)}>
                  {getPriorityText(project.priority)}
                </Badge>
                {isOverdue && (
                  <Badge className="bg-red-100 text-red-800">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Atrasado
                  </Badge>
                )}
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Progresso</span>
                  <span className="font-medium">{calculateProgress()}%</span>
                </div>
                <Progress value={calculateProgress()} className="h-3" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Checkpoints</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {checkpoints.slice(0, 3).map((checkpoint) => (
                <div key={checkpoint.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={checkpoint.completed}
                    onCheckedChange={() => handleCheckpointToggle(checkpoint.id)}
                  />
                  <span className={`text-sm ${checkpoint.completed ? 'line-through text-gray-500' : ''}`}>
                    {checkpoint.title}
                  </span>
                </div>
              ))}
              {checkpoints.length > 3 && (
                <p className="text-xs text-gray-500">+{checkpoints.length - 3} mais...</p>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="allocations">Alocações</TabsTrigger>
            <TabsTrigger value="tracking">Acompanhamento</TabsTrigger>
            <TabsTrigger value="checkpoints">Checkpoints</TabsTrigger>
            <TabsTrigger value="images">Imagens</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Descrição do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedProject.description}
                    onChange={(e) => setEditedProject({ ...editedProject, description: e.target.value })}
                    rows={4}
                  />
                ) : (
                  <p className="text-gray-700 leading-relaxed">
                    {project.description || "Nenhuma descrição fornecida."}
                  </p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notas</CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editedProject.notes}
                    onChange={(e) => setEditedProject({ ...editedProject, notes: e.target.value })}
                    rows={4}
                    placeholder="Adicione suas notas aqui..."
                  />
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4 min-h-[100px]">
                    {project.notes ? (
                      <p className="text-gray-700 whitespace-pre-wrap">{project.notes}</p>
                    ) : (
                      <p className="text-gray-500 italic">Nenhuma nota adicionada ao projeto.</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="allocations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Pessoas Alocadas ({project.allocations.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {project.allocations.map((person, index) => (
                    <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {person.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium">{person}</span>
                    </div>
                  ))}
                </div>
                {project.allocations.length === 0 && (
                  <p className="text-gray-500 text-sm">Nenhuma pessoa alocada ao projeto.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="checkpoints" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Gerenciar Checkpoints
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {checkpoints.map((checkpoint) => (
                  <div key={checkpoint.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <Checkbox
                      checked={checkpoint.completed}
                      onCheckedChange={() => handleCheckpointToggle(checkpoint.id)}
                    />
                    <span className={`flex-1 ${checkpoint.completed ? 'line-through text-gray-500' : ''}`}>
                      {checkpoint.title}
                    </span>
                    <Badge variant={checkpoint.completed ? "default" : "outline"}>
                      {checkpoint.completed ? "Concluído" : "Pendente"}
                    </Badge>
                  </div>
                ))}

                <Separator />

                <div className="flex gap-2">
                  <Input
                    value={newCheckpoint}
                    onChange={(e) => setNewCheckpoint(e.target.value)}
                    placeholder="Novo checkpoint..."
                    onKeyPress={(e) => e.key === "Enter" && handleAddCheckpoint()}
                  />
                  <Button onClick={handleAddCheckpoint} variant="outline">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="images" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="w-5 h-5" />
                  Imagens do Projeto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {projectImages.map((image) => (
                    <div key={image.id} className="border rounded-lg p-3">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-32 object-cover rounded mb-2"
                      />
                      <h4 className="font-medium text-sm">{image.title}</h4>
                      <p className="text-xs text-gray-600">{image.description}</p>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="space-y-3 border-2 border-dashed border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-700">Adicionar Nova Imagem</h4>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      value={newImageTitle}
                      onChange={(e) => setNewImageTitle(e.target.value)}
                      placeholder="Título da imagem *"
                    />
                    <Input
                      value={newImageDescription}
                      onChange={(e) => setNewImageDescription(e.target.value)}
                      placeholder="Descrição"
                    />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Label htmlFor="image-upload" className="cursor-pointer flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
                      <Upload className="w-4 h-4" />
                      {selectedImageFile ? selectedImageFile.name : "Escolher Imagem"}
                    </Label>
                    <Input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e)}
                      className="hidden"
                    />
                    <Button 
                      onClick={handleSaveImage}
                      disabled={!selectedImageFile || !newImageTitle.trim()}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Salvar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Acompanhamento Semanal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {weeklyTracking.map((week, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <h4 className="font-semibold">{week.week}</h4>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{week.progress}% completo</Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWeeklyTracking(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                    {week.notes && (
                      <p className="text-sm text-gray-600">{week.notes}</p>
                    )}
                    {week.blockers.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-red-600">Bloqueadores:</p>
                        {week.blockers.map((blocker, blockerIndex) => (
                          <div key={blockerIndex} className="flex items-center text-sm text-red-600">
                            <AlertCircle className="w-3 h-3 mr-1" />
                            {blocker}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                <Separator />

                {/* Add new tracking */}
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-4 space-y-4">
                  <h4 className="font-semibold text-gray-700">Adicionar Nova Semana</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="week">Nome da Semana</Label>
                      <Input
                        id="week"
                        value={newWeekData.week}
                        onChange={(e) => setNewWeekData({ ...newWeekData, week: e.target.value })}
                        placeholder="Ex: Semana 4"
                      />
                    </div>
                    <div>
                      <Label htmlFor="progress">Progresso (%)</Label>
                      <Input
                        id="progress"
                        type="number"
                        min="0"
                        max="100"
                        value={newWeekData.progress}
                        onChange={(e) => setNewWeekData({ ...newWeekData, progress: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="weekNotes">Notas da Semana</Label>
                    <Textarea
                      id="weekNotes"
                      value={newWeekData.notes}
                      onChange={(e) => setNewWeekData({ ...newWeekData, notes: e.target.value })}
                      placeholder="Descreva o progresso desta semana..."
                      rows={2}
                    />
                  </div>

                  <div>
                    <Label>Bloqueadores</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        value={newBlocker}
                        onChange={(e) => setNewBlocker(e.target.value)}
                        placeholder="Descreva um bloqueador"
                        onKeyPress={(e) => e.key === "Enter" && (e.preventDefault(), handleAddBlocker())}
                      />
                      <Button type="button" onClick={handleAddBlocker} variant="outline" size="sm">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {newWeekData.blockers.map((blocker, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-1 bg-red-100 text-red-800 px-2 py-1 rounded-md text-sm"
                        >
                          {blocker}
                          <X
                            className="h-3 w-3 cursor-pointer hover:text-red-600"
                            onClick={() => handleRemoveBlocker(index)}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <Button onClick={handleAddWeeklyTracking} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Semana
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DialogContent>
  );
};