import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface KycModalProps {
  open: boolean;
  onClose: () => void;
}

export default function KycModal({ open, onClose }: KycModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState({
    idCard: null as File | null,
    selfie: null as File | null,
    proofOfAddress: null as File | null,
  });

  const kycMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      
      if (files.idCard) formData.append("idCard", files.idCard);
      if (files.selfie) formData.append("selfie", files.selfie);
      if (files.proofOfAddress) formData.append("proofOfAddress", files.proofOfAddress);

      const res = await fetch("/api/kyc", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message);
      }

      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/kyc"] });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      toast({
        title: "Documentos enviados!",
        description: "Seus documentos estão em análise. Você receberá uma notificação em breve.",
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!files.idCard || !files.selfie || !files.proofOfAddress) {
      toast({
        title: "Documentos em falta",
        description: "Por favor, envie todos os documentos",
        variant: "destructive",
      });
      return;
    }
    kycMutation.mutate();
  };

  const handleFileChange = (field: keyof typeof files, file: File | null) => {
    setFiles(prev => ({ ...prev, [field]: file }));
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-3xl font-bold" data-testid="text-kyc-title">Verificação de Identidade</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Alert className="bg-primary/10 border-primary/20">
            <i className="fas fa-shield-alt text-primary"></i>
            <AlertDescription>
              <strong className="font-semibold">Segurança e Privacidade</strong>
              <p className="text-sm mt-1">
                Seus documentos são criptografados e processados com total segurança.
              </p>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="idCard">Bilhete de Identidade (BI)</Label>
            <Input 
              id="idCard"
              type="file" 
              accept="image/*,.pdf" 
              onChange={(e) => handleFileChange("idCard", e.target.files?.[0] || null)}
              required 
              data-testid="input-kyc-id"
            />
            <p className="text-xs text-muted-foreground">Frente e verso do documento</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="selfie">Selfie com BI</Label>
            <Input 
              id="selfie"
              type="file" 
              accept="image/*" 
              onChange={(e) => handleFileChange("selfie", e.target.files?.[0] || null)}
              required 
              data-testid="input-kyc-selfie"
            />
            <p className="text-xs text-muted-foreground">Tire uma selfie segurando seu BI ao lado do rosto</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proofOfAddress">Comprovativo de Residência</Label>
            <Input 
              id="proofOfAddress"
              type="file" 
              accept="image/*,.pdf" 
              onChange={(e) => handleFileChange("proofOfAddress", e.target.files?.[0] || null)}
              required 
              data-testid="input-kyc-proof"
            />
            <p className="text-xs text-muted-foreground">Conta de água, luz ou telefone dos últimos 3 meses</p>
          </div>

          <div className="flex gap-4 pt-4">
            <Button 
              type="button" 
              onClick={onClose}
              variant="outline"
              className="flex-1"
              data-testid="button-cancel-kyc"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="flex-1 bg-gradient-to-r from-primary to-[hsl(35,100%,45%)] text-primary-foreground font-semibold hover:shadow-lg"
              disabled={kycMutation.isPending}
              data-testid="button-submit-kyc"
            >
              {kycMutation.isPending ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  Enviar Documentos
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
