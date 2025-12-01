import { Leaf, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Separator } from './ui/separator';
type OrderConfirmationProps = {
  orderId: string | null;
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
};
export function OrderConfirmation({ orderId, isOpen, onOpenChange }: OrderConfirmationProps) {
  if (!orderId) return null;
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center items-center">
          <div className="p-3 rounded-full bg-primary/10 mb-4">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold font-display">Order Confirmed!</DialogTitle>
          <DialogDescription>
            Thank you for your purchase. Your green friends are on their way!
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-2">
          <div className="flex justify-between items-center bg-secondary p-3 rounded-md">
            <span className="text-muted-foreground">Order ID</span>
            <span className="font-mono text-sm font-semibold">{orderId}</span>
          </div>
          <div className="flex justify-between items-center p-3">
            <span className="text-muted-foreground">Estimated Delivery</span>
            <span className="font-semibold">3-5 Business Days</span>
          </div>
        </div>
        <Separator />
        <DialogFooter className="sm:justify-center pt-4">
          <Button asChild variant="outline" onClick={() => onOpenChange(false)}>
            <Link to="/">
              <Leaf className="mr-2 h-4 w-4" />
              Continue Shopping
            </Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}