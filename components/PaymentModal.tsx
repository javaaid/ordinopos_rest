

import React, { useState, useEffect, useMemo } from 'react';
import { Order, PaymentMethod, AppPlugin, PaymentType, AppSettings, ToastNotification } from '../types';
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

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderToPay: Order[] | null;
  onProcessFinalOrder: (orders: Order[] | null, paymentMethod: PaymentMethod) => Order;
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

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, orderToPay, onProcessFinalOrder, onDirectPrintReceipt, onPrintA4, cardPlugin, allPaymentTypes, currency, settings, setSettings, addToast }) => {
  const { openModal, closeModal } = useModalContext();
  const [activeMethod, setActiveMethod] = useState<string>('');
  const [tenderedAmount, setTenderedAmount] = useState('');
  const [cardStatus, setCardStatus] = useState<CardStatus>('idle');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('paying');
  const [finalizedOrder, setFinalizedOrder] = useState<Order | null>(null);
  const [email, setEmail] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  
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
  const tendered = parseFloat(tenderedAmount) || 0;
  const changeDue = tendered > totalDue ? tendered - totalDue : 0;
  
  useEffect(() => {
    if (isOpen) {
      setTenderedAmount(totalDue.toFixed(2));
      setCardStatus('idle');
      setPaymentStatus('paying');
      setFinalizedOrder(null);
      setEmail(orderToPay?.[0]?.customer?.email || '');
      setEmailSent(false);
      
      if (enabledPaymentTypes.length > 0) {
        const cardMethod = enabledPaymentTypes.find(pt => pt?.id?.toLowerCase() === 'card');
        if (cardMethod) {
            setActiveMethod('card');
        } else {
            const firstMethod = enabledPaymentTypes[0];
            if (firstMethod?.name) {
                 setActiveMethod(firstMethod.name.toLowerCase());
            } else {
                 setActiveMethod(''); // Fallback for corrupted data
            }
        }
      } else {
        setActiveMethod('');
      }
    }
  }, [isOpen, totalDue, enabledPaymentTypes, orderToPay]);

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

  const handleProcessPayment = (method: PaymentMethod) => {
    const tenderedNum = parseFloat(tenderedAmount) || 0;
    // Compare values in cents to avoid floating point inaccuracies
    if (method === 'Cash' && Math.round(tenderedNum * 100) < Math.round(totalDue * 100)) {
      alert("Tendered amount is less than total due.");
      return;
    }

    if (method === 'Card') {
      setCardStatus('processing');
      openModal('livePayment', {
        amount: totalDue,
        provider: settings.paymentProvider,
        terminalId: settings.terminalId,
        onApprove: () => {
          closeModal(); // Close simulation modal
          setCardStatus('approved');
          setTimeout(() => {
            const finalOrder = onProcessFinalOrder(orderToPay, method);
            setFinalizedOrder(finalOrder);
            setPaymentStatus('success');
          }, 1000);
        },
        onDecline: () => {
          closeModal(); // Close simulation modal
          setCardStatus('declined');
        }
      });
    } else {
      const finalOrder = onProcessFinalOrder(orderToPay, method);
      setFinalizedOrder(finalOrder);
      setPaymentStatus('success');
    }
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
            <div className="p-6 border-b border-border text-center">
                <h2 className="text-2xl font-bold text-foreground">Payment</h2>
                <div className="text-center">
                    <p className="text-6xl font-mono font-bold text-primary mt-2">{currency}{totalDue.toFixed(2)}</p>
                    {settings.dualCurrency.enabled && (
                        <p className="text-xl text-muted-foreground font-mono -mt-1">
                            ≈ {settings.dualCurrency.secondaryCurrency} {(totalDue * settings.dualCurrency.exchangeRate).toFixed(2)}
                        </p>
                    )}
                </div>
            </div>
            <div className="p-6 flex gap-6">
              <div className="w-1/3 space-y-3">
                {enabledPaymentTypes.map(pt => {
                    if (!pt?.name) return null;
                    const Icon = paymentMethodIcons[pt.name.toLowerCase()] || CurrencyDollarIcon;
                    const isActive = activeMethod === pt.name.toLowerCase();
                    
                    const activeColorClasses: { [key: string]: { button: string; icon: string; } } = {
                        cash: { button: 'bg-green-600/20 border-green-500', icon: 'text-green-500' },
                        card: { button: 'bg-blue-600/20 border-blue-500', icon: 'text-blue-500' },
                    };

                    const defaultActiveClasses = { button: 'bg-primary/10 border-primary', icon: 'text-primary' };
                    
                    const buttonClass = isActive 
                        ? (activeColorClasses[pt.name.toLowerCase()]?.button || defaultActiveClasses.button)
                        : 'bg-secondary border-border hover:border-muted-foreground';
                        
                    const iconClass = isActive
                        ? (activeColorClasses[pt.name.toLowerCase()]?.icon || defaultActiveClasses.icon)
                        : 'text-muted-foreground';
                    
                    return (
                        <button 
                            key={pt.id} 
                            onClick={() => setActiveMethod(pt.name.toLowerCase())}
                            className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${buttonClass}`}
                        >
                            <Icon className={`w-8 h-8 ${iconClass}`} />
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
                         <div className="text-center bg-secondary p-4 rounded-lg">
                            <p className="text-muted-foreground">Change Due</p>
                            <p className="text-3xl font-mono font-bold text-primary">{currency}{changeDue.toFixed(2)}</p>
                         </div>
                         <Button onClick={() => handleProcessPayment('Cash')} className="w-full mt-4 h-auto py-4 text-xl">
                            Confirm Cash Payment
                         </Button>
                    </div>
                )}
                 {activeMethod === 'card' && (
                    <>
                    {isCardConfigured ? (
                        <div className="text-center flex flex-col items-center justify-center h-full bg-secondary rounded-lg p-6">
                            {cardStatus === 'idle' && <Button onClick={() => handleProcessPayment('Card')} className="w-full h-auto py-12 text-xl">Process Card Payment</Button>}
                            {cardStatus === 'processing' && <p className="text-muted-foreground animate-pulse">Waiting for terminal...</p>}
                            {cardStatus === 'approved' && <p className="text-primary font-bold text-xl">Card Approved!</p>}
                            {cardStatus === 'declined' && <p className="text-destructive font-bold text-xl">Card Declined. Please try another card.</p>}
                        </div>
                    ) : (
                        <div className="text-center flex flex-col items-center justify-center h-full bg-secondary rounded-lg p-6">
                            <h4 className="text-lg font-bold text-foreground mb-2">Card Payments Not Configured</h4>
                            <p className="text-muted-foreground mb-6">The 'Advanced Card Payments' plugin must be configured before you can accept card payments.</p>
                            <Button onClick={handleGoToCardSettings} className="w-full text-lg">
                                Go to Settings
                            </Button>
                        </div>
                    )}
                    </>
                )}
              </div>
            </div>
        </div>
    </Modal>
  );
};

export default PaymentModal;