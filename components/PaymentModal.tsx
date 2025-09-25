

import React, { useState, useEffect, useMemo } from 'react';
import { Order, PaymentMethod, AppPlugin, PaymentType, AppSettings, ToastNotification, Payment } from '../types';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import CreditCardIcon from './icons/CreditCardIcon';
import CheckCircleIcon from './icons/CheckCircleIcon';
import PrinterIcon from './icons/PrinterIcon';
import DocumentArrowDownIcon from './icons/DocumentArrowDownIcon';
import EnvelopeIcon from './icons/EnvelopeIcon';
import { Modal, ModalHeader, ModalTitle, ModalContent, ModalFooter } from './ui/Modal';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { useModalContext, useToastContext } from '../contexts/AppContext';
import { cn } from '../lib/utils';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToPay: Order[] | null;
  onFinalize: (payments: Payment[]) => Order;
  onDirectPrintReceipt: (order: Order) => void;
  onPrintA4: (order: Order) => void;
  cardPlugin: AppPlugin | undefined;
  allPaymentTypes: PaymentType[];
  currency: string;
  settings: AppSettings;
  setSettings: React.Dispatch<React.SetStateAction<AppSettings>>;
  addToast: (toast: Omit<ToastNotification, 'id'>) => void;
}

type CardStatus = 'idle' | 'processing' | 'approved' | 'declined';
type PaymentStatus = 'paying' | 'success';

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, orderToPay, onFinalize, onDirectPrintReceipt, onPrintA4, cardPlugin, allPaymentTypes, currency, settings, setSettings, addToast }) => {
  const { openModal, closeModal } = useModalContext();
  const [activeMethod, setActiveMethod] = useState<string>('');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paying');
  const [finalizedOrder, setFinalizedOrder] = useState<Order | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [payments, setPayments] = useState<Payment[]>([]);
  
  const isCardConfigured = useMemo(() => {
    return (cardPlugin?.status === 'enabled' || cardPlugin?.status === 'trial') 
        && !!settings.paymentProvider && settings.paymentProvider !== 'none'
        && !!settings.paymentTerminalSecretKey
        && !!settings.terminalId;
  }, [cardPlugin, settings]);
  
  const enabledPaymentTypes = useMemo(() => {
    if (!Array.isArray(allPaymentTypes)) return [];
    return allPaymentTypes.filter(pt => pt?.isEnabled);
  }, [allPaymentTypes]);

  const totalDue = useMemo(() => orderToPay?.reduce((sum, o) => sum + o.total, 0) || 0, [orderToPay]);
  const totalPaid = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const remainingDue = useMemo(() => totalDue - totalPaid, [totalDue, totalPaid]);
  
  useEffect(() => {
    if (isOpen) {
      setPayments([]);
      setCardStatus('idle');
      setPaymentStatus('paying');
      setFinalizedOrder(null);
      setEmail(orderToPay?.[0]?.customer?.email || '');
      setEmailSent(false);
      
      if (enabledPaymentTypes.length > 0) {
        const firstMethod = enabledPaymentTypes[0];
        setActiveMethod(firstMethod?.name?.toLowerCase() || '');
      } else {
        setActiveMethod('');
      }
    }
  }, [isOpen, orderToPay, enabledPaymentTypes]);
  
  useEffect(() => {
    setTenderedAmount(remainingDue > 0 ? remainingDue.toFixed(2) : '0.00');
  }, [remainingDue]);

  useEffect(() => {
    if (remainingDue <= 0.001 && payments.length > 0 && paymentStatus === 'paying' && isOpen) {
      const finalOrder = onFinalize(payments);
      setFinalizedOrder(finalOrder);
      setPaymentStatus('success');
    }
  }, [remainingDue, payments, paymentStatus, onFinalize, orderToPay, isOpen]);
  
  useEffect(() => {
    if (finalizedOrder && settings?.advancedPOS?.printReceiptAfterPayment) {
        const timer = setTimeout(() => {
            onDirectPrintReceipt(finalizedOrder);
        }, 500);
        return () => clearTimeout(timer);
    }
  }, [finalizedOrder, settings?.advancedPOS?.printReceiptAfterPayment, onDirectPrintReceipt]);


  if (!isOpen || !orderToPay) return null;

  const handleSendEmail = () => {
    if (email && email.includes('@')) {
        console.log(`Simulating sending email receipt to ${email}`);
        addToast({ type: 'success', title: 'Email Sent', message: `Receipt sent to ${email}` });
        setEmailSent(true);
    } else {
        addToast({ type: 'error', title: 'Invalid Email', message: 'Please enter a valid email address.' });
    }
  };
  
  const handleGoToCardSettings = () => {
    onClose(); // Close the payment modal first
    openModal('paymentTerminalSettings', {
        settings: settings,
        onSave: (newTerminalSettings: Partial<AppSettings>) => {
            setSettings(prev => ({ ...prev, ...newTerminalSettings }));
            addToast({ type: 'success', title: 'Settings Saved', message: 'Payment terminal has been configured.' });
        }
    });
  };
  
  const handleAddPayment = (method: PaymentMethod, amount: number) => {
    if (amount <= 0) return;
    const newPayment: Payment = { method, amount, timestamp: Date.now() };
    setPayments(prev => [...prev, newPayment]);
  };
  
  const handleProcessCashPayment = () => {
    const tendered = parseFloat(tenderedAmount) || 0;
    if (tendered < remainingDue) {
      handleAddPayment('Cash', tendered);
    } else {
      const change = tendered - remainingDue;
      if (change > 0) {
        addToast({ type: 'info', title: 'Change Due', message: `${currency}${change.toFixed(2)}`});
      }
      handleAddPayment('Cash', remainingDue);
    }
  };

  const handleProcessCardPayment = () => {
    const amountToCharge = parseFloat(tenderedAmount);
    if (isNaN(amountToCharge) || amountToCharge <= 0) return;

    setCardStatus('processing');
    openModal('livePayment', {
      amount: amountToCharge,
      provider: settings.paymentProvider,
      terminalId: settings.terminalId,
      onApprove: () => {
        closeModal(); // Close simulation modal
        setCardStatus('approved');
        setTimeout(() => {
          handleAddPayment('Card', amountToCharge);
          setCardStatus('idle');
        }, 1000);
      },
      onDecline: () => {
        closeModal(); // Close simulation modal
        setCardStatus('declined');
      }
    });
  };
  
  const paymentMethodIcons: Record<string, React.FC<any>> = {
    cash: CurrencyDollarIcon,
    card: CreditCardIcon
  };
  
  if (paymentStatus === 'success') {
    const completedOrder = finalizedOrder;
    return (
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalContent className="p-8 text-center">
          <CheckCircleIcon className="w-24 h-24 text-primary mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground">Payment Successful</h3>
          <p className="text-muted-foreground mb-6">
            {completedOrder ? `Order #${completedOrder.orderNumber} is complete.` : 'Order is complete.'}
          </p>

          <div className="grid grid-cols-2 gap-3 mb-6">
              <Button onClick={() => completedOrder && onDirectPrintReceipt(completedOrder)} disabled={!completedOrder} variant="outline" className="w-full flex items-center justify-center gap-2">
                  <PrinterIcon className="w-5 h-5"/> Print Receipt
              </Button>
              <Button onClick={() => completedOrder && onPrintA4(completedOrder)} disabled={!completedOrder} variant="outline" className="w-full flex items-center justify-center gap-2">
                  <DocumentArrowDownIcon className="w-5 h-5"/> Print/Save PDF
              </Button>
          </div>

          {settings?.advancedPOS?.emailReceipt && (
            <div className="space-y-2 text-left">
                <label className="text-sm font-medium text-muted-foreground">Send Email Receipt</label>
                <div className="flex gap-2">
                    <Input 
                      type="email" 
                      placeholder="customer@example.com" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      disabled={emailSent}
                    />
                    <Button onClick={handleSendEmail} disabled={!email || emailSent}>
                       <EnvelopeIcon className="w-5 h-5"/>
                    </Button>
                </div>
                 {emailSent && <p className="text-xs text-green-400 text-center">Receipt sent to {email}</p>}
            </div>
          )}
          
          <div className="mt-8">
              <Button onClick={onClose} className="w-full">
                  New Order
              </Button>
          </div>
        </ModalContent>
      </Modal>
    );
  }

  if (enabledPaymentTypes.length === 0) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalHeader>
                <ModalTitle>Payment Error</ModalTitle>
            </ModalHeader>
            <ModalContent>
                <p className="text-destructive text-center">
                    No payment methods are enabled. Please ask a manager to enable payment types in Management &gt; Payment Types.
                </p>
            </ModalContent>
            <ModalFooter>
                <Button onClick={onClose}>Close</Button>
            </ModalFooter>
        </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-3xl">
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-border text-center">
                <h2 className="text-lg font-bold text-foreground">Payment</h2>
                <div className="text-center">
                    <p className="text-2xl font-mono text-muted-foreground">Total Due</p>
                    <p className="text-6xl font-mono font-bold text-primary mt-1">{currency}{totalDue.toFixed(2)}</p>
                </div>
            </div>
            <div className="p-6 flex gap-6">
              <div className="w-1/3 space-y-3">
                {enabledPaymentTypes.map(pt => {
                    if (!pt?.name) return null;
                    const Icon = paymentMethodIcons[pt.name.toLowerCase()] || CurrencyDollarIcon;
                    const isActive = activeMethod === pt.name.toLowerCase();
                    return (
                        <button 
                            key={pt.id} 
                            onClick={() => setActiveMethod(pt.name.toLowerCase())}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${isActive ? 'bg-primary/10 border-primary' : 'bg-secondary border-border hover:border-muted-foreground'}`}
                        >
                            <Icon className={`w-8 h-8 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                            <span className="font-bold text-lg text-foreground">{pt.name}</span>
                        </button>
                    )
                })}
              </div>
              <div className="w-2/3">
                 {activeMethod === 'cash' && (
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-muted-foreground mb-1">Tendered Amount</label>
                            <Input 
                                type="number" 
                                value={tenderedAmount}
                                onChange={e => setTenderedAmount(e.target.value)}
                                className="p-3 text-2xl font-mono text-center h-auto"
                            />
                        </div>
                         <div className="grid grid-cols-3 gap-2">
                             {[5,10,20,50,100,200].map(val => (
                                 <Button key={val} type="button" variant="outline" onClick={() => setTenderedAmount(val.toFixed(2))}>{currency}{val}</Button>
                             ))}
                         </div>
                         <Button onClick={handleProcessCashPayment} className="w-full mt-4 h-auto py-4 text-xl">
                            Pay With Cash
                         </Button>
                    </div>
                )}
                 {activeMethod === 'card' && (
                    <>
                    {isCardConfigured ? (
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-muted-foreground mb-1">Amount to Charge</label>
                                <Input 
                                    type="number" 
                                    value={tenderedAmount}
                                    onChange={e => setTenderedAmount(e.target.value)}
                                    className="p-3 text-2xl font-mono text-center h-auto"
                                />
                            </div>
                            <Button onClick={handleProcessCardPayment} disabled={cardStatus !== 'idle'} className="w-full mt-4 h-auto py-4 text-xl">
                                {cardStatus === 'idle' && 'Charge Card'}
                                {cardStatus === 'processing' && 'Processing...'}
                                {cardStatus === 'approved' && 'Approved!'}
                                {cardStatus === 'declined' && 'Declined'}
                            </Button>
                        </div>
                    ) : (
                        <div className="text-center flex flex-col items-center justify-center h-full bg-secondary rounded-lg p-6">
                            <h4 className="text-lg font-bold text-foreground mb-2">Card Payments Not Configured</h4>
                            <p className="text-muted-foreground mb-6">The 'Advanced Card Payments' plugin must be configured.</p>
                            <Button onClick={handleGoToCardSettings} className="w-full text-lg">
                                Go to Settings
                            </Button>
                        </div>
                    )}
                    </>
                )}
              </div>
            </div>
            <div className="p-4 border-t border-border bg-card mt-auto space-y-2">
                <div className="flex justify-between items-center text-xl font-bold">
                    <span>Paid:</span>
                    <span>{currency}{totalPaid.toFixed(2)}</span>
                </div>
                <div className={cn(
                    "flex justify-between items-center text-5xl font-bold text-destructive",
                    remainingDue > 0.001 && "animate-pulse"
                )}>
                    <span>Remaining Due:</span>
                    <span>{currency}{remainingDue.toFixed(2)}</span>
                </div>
                {payments.length > 0 && (
                    <div className="pt-2 border-t border-border mt-2">
                        <h4 className="text-xs font-semibold uppercase text-muted-foreground">Applied Payments</h4>
                        {payments.map((p, i) => (
                            <div key={i} className="flex justify-between text-sm">
                                <span>{p.method}</span>
                                <span>{currency}{p.amount.toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    </Modal>
  );
};

export default PaymentModal;
