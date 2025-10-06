
import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  const successTimeoutRef = useRef<number | null>(null);
  
  const isCardConfigured = useMemo(() => {
    return (cardPlugin?.status === 'enabled' || cardPlugin?.status === 'trial') && !!settings.paymentTerminalSecretKey && !!settings.terminalId;
  }, [cardPlugin, settings]);

  const totalAmount = useMemo(() => {
    if (!orderToPay) return 0;
    return orderToPay.reduce((sum, order) => sum + order.balanceDue, 0);
  }, [orderToPay]);

  const totalPaid = useMemo(() => payments.reduce((acc, p) => acc + p.amount, 0), [payments]);
  const remainingDue = totalAmount - totalPaid;

  useEffect(() => {
    if (isOpen) {
        setPayments([]);
        setPaymentStatus('paying');
        setFinalizedOrder(null);
        setActiveMethod('');
        setTenderedAmount('');
        setEmailSent(false);
        const customerEmail = (orderToPay && orderToPay.length > 0 && orderToPay[0].customer?.email) ? orderToPay[0].customer.email : '';
        setEmail(customerEmail);
        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
            successTimeoutRef.current = null;
        }
    }
    return () => {
        if (successTimeoutRef.current) {
            clearTimeout(successTimeoutRef.current);
        }
    };
  }, [isOpen, orderToPay]);

  useEffect(() => {
    if (totalPaid >= totalAmount && totalAmount > 0 && !successTimeoutRef.current && paymentStatus === 'paying') {
      successTimeoutRef.current = window.setTimeout(() => {
        const finalOrder = onFinalize(payments);
        setFinalizedOrder(finalOrder);
        setPaymentStatus('success');
        successTimeoutRef.current = null;
      }, 1000); // Delay to show $0.00 balance
    }
  }, [totalPaid, totalAmount, onFinalize, payments, paymentStatus]);

  const addCashPayment = (amount: number) => {
    if (amount <= 0) return;
    const newPayment: Payment = {
        method: 'Cash',
        amount: amount,
        timestamp: Date.now(),
    };
    setPayments(prev => [...prev, newPayment]);
    setTenderedAmount('');
    setActiveMethod('');
  };

  const addCardPayment = (amount: number, method: string = 'Card') => {
      const newPayment: Payment = { method, amount, timestamp: Date.now() };
      setPayments(prev => [...prev, newPayment]);
  };

  const handleTenderedAmountClick = (amount: number) => {
      setTenderedAmount(String(amount));
      addCashPayment(amount);
  };
  
  const handleCustomAmount = () => {
    const amount = parseFloat(tenderedAmount);
    if (!isNaN(amount) && amount > 0) {
      if (activeMethod === 'cash') {
          addCashPayment(amount);
      } else if (activeMethod === 'card') {
          handleCardPayment(amount);
      }
    }
  };

  const handleCardPayment = (amount: number) => {
    if (isCardConfigured) {
        openModal('livePayment', { 
            amount, 
            provider: settings.paymentProvider,
            terminalId: settings.terminalId,
            onApprove: () => {
                addCardPayment(amount, 'Card');
                closeModal();
            },
            onDecline: () => {
                addToast({ type: 'error', title: 'Payment Declined', message: 'The card payment was declined by the terminal.' });
                closeModal();
            }
        });
    } else {
         openModal('cardPaymentSimulation', { amount, onApprove: () => { addCardPayment(amount, 'Card'); closeModal() }, onDecline: () => { closeModal() } });
    }
  };
  
  const handlePaymentMethodClick = (method: string) => {
      if(method.toLowerCase() === 'cash') {
          setActiveMethod('cash');
          setTenderedAmount('');
      } else if (method.toLowerCase() === 'card') {
          handleCardPayment(remainingDue);
      } else {
          addCardPayment(remainingDue, method);
      }
  };
  
  const handleExactAmount = () => {
    if (remainingDue > 0) {
      addCashPayment(remainingDue);
    }
  };
  
  const renderPayingContent = () => {
    const cashDenominations = [5, 10, 20, 50, 100];
    const nextBillUp = Math.ceil(remainingDue / 5) * 5;

    return (
      <>
        <ModalHeader>
          <div className="text-center w-full">
            <ModalTitle>Total Due</ModalTitle>
            <p className="text-4xl font-bold text-primary mt-1">{currency}{totalAmount.toFixed(2)}</p>
          </div>
        </ModalHeader>
        <ModalContent>
          <div className="flex flex-col gap-4">
             {totalPaid > 0 && (
                <div className="flex justify-between items-center bg-accent p-2 rounded-lg text-lg">
                    <span className="font-semibold text-muted-foreground">Total Paid</span>
                    <span className="font-bold text-foreground">{currency}{totalPaid.toFixed(2)}</span>
                </div>
            )}
            <div className="text-center bg-card p-4 rounded-lg relative">
              <h3 className="text-lg font-semibold text-muted-foreground">Remaining Due</h3>
              <div
                className={cn(
                  'text-5xl font-bold transition-all duration-300',
                  remainingDue > 0 ? 'text-red-500 animated-gradient-border animate-blink' : 'text-green-500'
                )}
              >
                {currency}{Math.max(0, remainingDue).toFixed(2)}
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              {(allPaymentTypes || []).map(pt => (
                <Button key={pt.id} variant="outline" className="h-16 text-lg" onClick={() => handlePaymentMethodClick(pt.name)}>
                    {pt.name === 'Cash' && <CurrencyDollarIcon className="w-6 h-6 mr-2" />}
                    {pt.name === 'Card' && <CreditCardIcon className="w-6 h-6 mr-2" />}
                    {pt.name}
                </Button>
              ))}
            </div>
            {activeMethod === 'cash' && (
              <div className="space-y-3 animate-fade-in-down">
                <div className="grid grid-cols-3 gap-3">
                    <Button variant="secondary" className="h-14" onClick={handleExactAmount}>Exact</Button>
                    {cashDenominations.map(amount => (
                      remainingDue < amount && <Button key={amount} variant="secondary" className="h-14" onClick={() => handleTenderedAmountClick(amount)}>${amount}</Button>
                    ))}
                    {remainingDue > nextBillUp && <Button variant="secondary" className="h-14" onClick={() => handleTenderedAmountClick(nextBillUp)}>${nextBillUp}</Button>}
                </div>
                <div className="flex gap-2">
                    <Input type="number" placeholder="Custom amount..." value={tenderedAmount} onChange={e => setTenderedAmount(e.target.value)} className="h-14 text-center text-lg" />
                    <Button onClick={handleCustomAmount} className="h-14">Pay</Button>
                </div>
              </div>
            )}
          </div>
        </ModalContent>
      </>
    );
  };
  
  const renderSuccessContent = () => {
    if (!finalizedOrder) return null;
    
    const paidAmount = finalizedOrder.payments.reduce((sum, p) => sum + p.amount, 0);
    const totalAmount = finalizedOrder.total;
    const changeDue = paidAmount - totalAmount;

    return (
        <div className="text-center p-8">
            <CheckCircleIcon className="w-24 h-24 text-primary mx-auto mb-4" />
            <h2 className="text-3xl font-bold text-foreground">Payment Successful</h2>
            
            {changeDue > 0.005 && (
                <div className="mt-6 bg-blue-500/10 p-4 rounded-lg">
                    <p className="text-lg font-semibold text-blue-800 dark:text-blue-300">Change Due</p>
                    <p className="text-5xl font-bold text-blue-500 animate-blink">
                        {currency}{changeDue.toFixed(2)}
                    </p>
                </div>
            )}
            
            <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => onDirectPrintReceipt(finalizedOrder)} className="flex-grow flex items-center justify-center gap-2">
                    <PrinterIcon className="w-5 h-5"/> Print Receipt
                </Button>
                <Button variant="outline" onClick={() => onPrintA4(finalizedOrder)} className="flex-grow flex items-center justify-center gap-2">
                    <DocumentArrowDownIcon className="w-5 h-5"/> A4 Invoice
                </Button>
            </div>
            {settings.advancedPOS.emailReceipt && (
                <form onSubmit={(e) => { e.preventDefault(); setEmailSent(true); }} className="mt-4 flex gap-2">
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Customer email..." className="flex-grow" />
                    <Button type="submit" disabled={emailSent}>{emailSent ? 'Sent' : 'Email'}</Button>
                </form>
            )}
            <Button onClick={onClose} size="lg" className="w-full mt-6">Done</Button>
        </div>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
        {paymentStatus === 'paying' ? renderPayingContent() : renderSuccessContent()}
    </Modal>
  );
};

export default PaymentModal;